# Invisible Guardian — Dashboard

Clinical frontend for contact-free fall detection and breathing monitoring. Connects to the FastAPI backend via WebSocket for live CSI data, or runs in **Demo data** mode without a backend.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:5173. Toggle **Demo data** to use simulated CSI/BPM when the backend is not running.

## Backend connection

Set the WebSocket URL (optional):

- Create `.env` with `VITE_WS_HOST=ws://localhost:8000/ws` (or your backend URL).
- Uncheck **Demo data** to connect to the live stream.

Expected WebSocket message shape:

```json
{
  "type": "update",
  "roomState": "empty_room" | "person_present" | "person_fallen",
  "confidence": 0.95,
  "breathingBpm": 14,
  "csiAmplitudes": [ ... 52 values ... ],
  "alertSentAt": 1234567890123,
  "breathingAnomaly": false
}
```

## Panels

- **Patient status** — Clear / Monitoring / ALERT; room state, confidence, breathing rate; red pulse and “NURSE ALERT SENT” + timestamp when alert fires.
- **Breathing rate (BPM)** — Time-series chart with 12–20 BPM reference band.
- **CSI amplitude** — 52-subcarrier heatmap (low → high color scale).
