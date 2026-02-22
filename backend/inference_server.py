#!/usr/bin/env python3
"""
inference_server.py — Invisible Guardian: Real-time CSI Fall Detection Server

Reads WiFi CSI data from an ESP32 via serial, runs CNN inference for
presence/fall detection, and serves results via FastAPI + WebSocket.
"""

import re
import time
import asyncio
import threading
from datetime import datetime, timezone
from collections import deque

import numpy as np
import torch
import torch.nn as nn
from scipy.signal import butter, filtfilt
import serial
import uvicorn
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

SERIAL_PORT       = "/dev/tty.usbserial-0001"
BAUD_RATE         = 921600
MODEL_PATH        = "invisible_guardian_model.pth"
WINDOW_SIZE       = 500
STEP              = 50
ALERT_CONSECUTIVE = 3

TWILIO_ENABLED = True
TWILIO_SID     = ""
TWILIO_AUTH    = ""
TWILIO_FROM    = ""
TWILIO_TO      = ""

CLASS_LABELS = {0: "Empty", 1: "Present", 2: "Fallen"}

class CSIFallDetectionCNN(nn.Module):
    def __init__(self, n_subcarriers: int = 192, window_size: int = 500):
        super().__init__()
        self.conv_block = nn.Sequential(
            nn.Conv1d(n_subcarriers, 32, kernel_size=5, padding=2),
            nn.ReLU(),
            nn.MaxPool1d(2),
            nn.Conv1d(32, 64, kernel_size=5, padding=2),
            nn.ReLU(),
            nn.MaxPool1d(2),
            nn.Conv1d(64, 128, kernel_size=3, padding=1),
            nn.ReLU(),
            nn.MaxPool1d(2),
        )
        self.flat_size = 128 * (window_size // 8)
        self.fc_block = nn.Sequential(
            nn.Flatten(),
            nn.Linear(self.flat_size, 128),
            nn.ReLU(),
            nn.Dropout(0.4),
            nn.Linear(128, 64),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(64, 3)
        )

    def forward(self, x):
        x = self.conv_block(x)
        x = self.fc_block(x)
        return x

state_lock = threading.Lock()
shared_state = {
    "prediction":        "Waiting",
    "prediction_id":     -1,
    "confidence":        0.0,
    "alert_active":      False,
    "alert_time":        None,
    "frame_count":       0,
    "consecutive_fallen": 0,
    "raw_amplitudes":    [],
}

def load_model(path: str):
    print(f"[MODEL] Loading checkpoint from {path} ...")
    checkpoint = torch.load(path, map_location="cpu", weights_only=False)
    n_sub = checkpoint.get("n_subcarriers", 192)
    win   = checkpoint.get("window_size", WINDOW_SIZE)
    print(f"[MODEL] n_subcarriers={n_sub}  window_size={win}")
    model = CSIFallDetectionCNN(n_subcarriers=n_sub, window_size=win)
    model.load_state_dict(checkpoint["model_state_dict"])
    model.eval()
    print("[MODEL] Model loaded and set to eval mode ✓")
    return model, n_sub, win


def parse_csi_line(line: str, n_sub: int):
    """Extract amplitude values from a CSI_DATA line."""
    if "CSI_DATA" not in line:
        return None
    match = re.search(r"\[([^\]]+)\]", line)
    if not match:
        return None
    try:
        raw = match.group(1).strip()
        if "," in raw:
            vals = [int(v.strip()) for v in raw.split(",") if v.strip()]
        else:
            vals = [int(v) for v in raw.split()]
        return np.array(vals[:n_sub], dtype=np.float32)
    except ValueError:
        return None


def butterworth_lowpass(data: np.ndarray, cutoff=0.5, fs=100.0, order=4):
    """Low-pass filter along time axis. data shape: (n_sub, win)"""
    nyq = fs / 2.0
    b, a = butter(order, cutoff / nyq, btype="low", analog=False)
    return filtfilt(b, a, data, axis=1).astype(np.float32)


def normalize(data: np.ndarray):
    return (data - data.mean()) / (data.std() + 1e-8)


def send_twilio_sms(message: str):
    if not TWILIO_ENABLED:
        return
    try:
        from twilio.rest import Client
        Client(TWILIO_SID, TWILIO_AUTH).messages.create(
            body=message, from_=TWILIO_FROM, to=TWILIO_TO
        )
        print(f"[TWILIO] SMS sent to {TWILIO_TO}")
    except Exception as e:
        print(f"[TWILIO] Failed: {e}")

def inference_thread(model, n_sub: int, win: int):
    buffer               = deque(maxlen=win)
    frames_since_infer   = 0

    print(f"[SERIAL] Opening {SERIAL_PORT} @ {BAUD_RATE} baud ...")
    try:
        ser = serial.Serial(SERIAL_PORT, BAUD_RATE, timeout=1)
    except serial.SerialException as e:
        print(f"[SERIAL] Could not open port: {e}")
        with state_lock:
            shared_state["prediction"] = "No Hardware"
        return

    print("[SERIAL] Port opened ✓  Waiting for CSI_DATA lines ...")

    while True:
        try:
            raw = ser.readline()
        except serial.SerialException as e:
            print(f"[SERIAL] Read error: {e}")
            with state_lock:
                shared_state["prediction"] = "No Hardware"
            time.sleep(1)
            continue

        try:
            line = raw.decode("utf-8", errors="replace").strip()
        except Exception:
            continue

        amplitudes = parse_csi_line(line, n_sub)
        if amplitudes is None:
            continue

        if len(amplitudes) < n_sub:
            amplitudes = np.pad(amplitudes, (0, n_sub - len(amplitudes)))

        buffer.append(amplitudes)
        frames_since_infer += 1

        with state_lock:
            shared_state["frame_count"] += 1
            fc = shared_state["frame_count"]
            shared_state["raw_amplitudes"] = amplitudes.tolist()

        if fc % 100 == 0:
            print(f"[DATA] Frames: {fc}  Buffer: {len(buffer)}/{win}")

        if len(buffer) < win or frames_since_infer < STEP:
            continue

        frames_since_infer = 0

        window = np.stack(list(buffer), axis=1)

        try:
            window = butterworth_lowpass(window)
        except Exception as e:
            print(f"[FILTER] Warning: {e}")

        window = normalize(window)

        tensor = torch.from_numpy(window).unsqueeze(0)

        with torch.no_grad():
            logits = model(tensor)                                   
            probs  = torch.softmax(logits, dim=1).squeeze(0).numpy()
            pred_id    = int(np.argmax(probs))
            confidence = float(probs[pred_id])

        label = CLASS_LABELS.get(pred_id, "Unknown")
        print(f"[INFERENCE] {label} ({confidence:.1%})  "
              f"Empty:{probs[0]:.2f} Present:{probs[1]:.2f} Fallen:{probs[2]:.2f}")

        with state_lock:
            shared_state["prediction"]    = label
            shared_state["prediction_id"] = pred_id
            shared_state["confidence"]    = round(confidence, 4)

            if pred_id == 2:
                shared_state["consecutive_fallen"] += 1
            else:
                shared_state["consecutive_fallen"] = 0
                shared_state["alert_active"]        = False

            consec = shared_state["consecutive_fallen"]

            if consec >= ALERT_CONSECUTIVE and not shared_state["alert_active"]:
                now = datetime.now(timezone.utc).isoformat()
                shared_state["alert_active"] = True
                shared_state["alert_time"]   = now
                print(f"\n{'!'*60}")
                print(f"  FALL ALERT — {consec} consecutive Fallen predictions")
                print(f"  Time: {now}")
                print(f"{'!'*60}\n")
                threading.Thread(
                    target=send_twilio_sms,
                    args=(f"FALL ALERT: Fall detected at {now}. Check immediately.",),
                    daemon=True,
                ).start()

app = FastAPI(title="Invisible Guardian")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _snapshot():
    with state_lock:
        return dict(shared_state)


@app.get("/status")
def get_status():
    return _snapshot()


@app.post("/reset_alert")
def reset_alert():
    with state_lock:
        shared_state["alert_active"]       = False
        shared_state["alert_time"]         = None
        shared_state["consecutive_fallen"] = 0
    print("[API] Alert reset")
    return {"message": "Alert reset", "state": _snapshot()}


@app.websocket("/ws")
async def websocket_endpoint(ws: WebSocket):
    await ws.accept()
    print("[WS] Client connected")
    try:
        while True:
            await ws.send_json(_snapshot())
            await asyncio.sleep(0.1)
    except WebSocketDisconnect:
        print("[WS] Client disconnected")
    except Exception as e:
        print(f"[WS] Error: {e}")

def main():
    print("=" * 60)
    print("  Invisible Guardian — CSI Fall Detection Server")
    print("=" * 60)
    print(f"  Serial Port  : {SERIAL_PORT}")
    print(f"  Baud Rate    : {BAUD_RATE}")
    print(f"  Model        : {MODEL_PATH}")
    print(f"  Window       : {WINDOW_SIZE} frames (step {STEP})")
    print(f"  Alert after  : {ALERT_CONSECUTIVE} consecutive Fallen")
    print(f"  Twilio SMS   : {'Enabled' if TWILIO_ENABLED else 'Disabled'}")
    print(f"  API          : http://0.0.0.0:8000")
    print("=" * 60)

    model, n_sub, win = load_model(MODEL_PATH)

    t = threading.Thread(target=inference_thread, args=(model, n_sub, win), daemon=True)
    t.start()
    print("[MAIN] Inference thread started ✓")

    print("[MAIN] Starting FastAPI on port 8000 ...")
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="warning")


if __name__ == "__main__":
    main()
