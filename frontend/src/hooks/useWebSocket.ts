import { useEffect, useRef, useState, useCallback } from 'react';
import type { WebSocketMessage } from '../types';

const WS_URL = (import.meta as { env?: { VITE_WS_HOST?: string } }).env?.VITE_WS_HOST ?? 'ws://localhost:8000/ws';

const API_BASE_URL = (() => {
  const wsUrl = WS_URL;
  try {
    const u = new URL(wsUrl);
    u.protocol = u.protocol === 'wss:' ? 'https:' : 'http:';
    const path = u.pathname.replace(/\/ws\/?$/, '');
    return `${u.protocol}//${u.host}${path}`;
  } catch {
    return 'http://localhost:8000';
  }
})();

const DEMO_UPDATE_MS = 150;
const MODEL_VERSION = '1.0.0';

type InferencePrediction = 'Empty' | 'Present' | 'Fallen' | 'No Hardware' | 'Waiting';

interface InferenceMessage {
  prediction: InferencePrediction;
  confidence: number;
  alert_active: boolean;
  alert_time: string | null;
  frame_count: number;
  raw_amplitudes: number[];
}

const PREDICTION_TO_ROOM: Record<string, WebSocketMessage['roomState']> = {
  Empty: 'empty_room',
  Present: 'person_present',
  Fallen: 'person_fallen',
  'No Hardware': 'no_hardware',
  Waiting: 'waiting',
};

function inferenceToMessage(data: InferenceMessage, alertSentAt: number | null): WebSocketMessage {
  const roomState = PREDICTION_TO_ROOM[data.prediction] ?? 'waiting';
  const raw = data.raw_amplitudes ?? [];
  const csiAmplitudes = raw.length >= 52 ? raw.slice(0, 52) : [...raw, ...Array(52 - raw.length).fill(0)];
  return {
    type: 'update',
    roomState,
    confidence: data.confidence ?? 0,
    breathingBpm: null,
    csiAmplitudes,
    alertSentAt,
    breathingAnomaly: false,
    packetRate: null,
    rssi: null,
    modelVersion: null,
    detectionLatencyMs: null,
    breathingBaselineWindowMin: 10,
    frameCount: data.frame_count ?? null,
  };
}

function useWebSocket(useDemoData: boolean) {
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const demoIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const alertSentAtRef = useRef<number | null>(null);

  const connect = useCallback(() => {
    if (useDemoData) {
      setConnected(true);
      setError(null);
      let t = 0;
      const baseBpm = 14 + Math.random() * 4;
      const baseAmps = Array.from({ length: 52 }, () => 20 + Math.random() * 30);
      demoIntervalRef.current = setInterval(() => {
        t += DEMO_UPDATE_MS / 1000;
        const breathingWave = Math.sin(2 * Math.PI * (baseBpm / 60) * t) * 3;
        const csiAmplitudes = baseAmps.map((a, i) =>
          Math.max(5, a + breathingWave * (1 + (i % 5) * 0.1) + (Math.random() - 0.5) * 4)
        );
        setLastMessage({
          type: 'update',
          roomState: 'person_present',
          confidence: 0.92 + Math.random() * 0.06,
          breathingBpm: Math.round(baseBpm + (Math.random() - 0.5) * 2),
          csiAmplitudes,
          breathingAnomaly: false,
          packetRate: 95 + Math.floor(Math.random() * 10),
          rssi: -52 - Math.floor(Math.random() * 12),
          modelVersion: MODEL_VERSION,
          detectionLatencyMs: 80 + Math.floor(Math.random() * 40),
          breathingBaselineWindowMin: 10,
          frameCount: null,
        });
      }, DEMO_UPDATE_MS);
      return;
    }
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;
    ws.onopen = () => {
      setConnected(true);
      setError(null);
    };
    ws.onclose = () => {
      setConnected(false);
      reconnectTimeoutRef.current = setTimeout(() => connect(), 2000);
    };
    ws.onerror = () => setError('Connection error');
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data as string) as InferenceMessage;
        if (data.alert_active) {
          if (alertSentAtRef.current == null) alertSentAtRef.current = Date.now();
        } else {
          alertSentAtRef.current = null;
        }
        setLastMessage(inferenceToMessage(data, alertSentAtRef.current));
      } catch {
        setError('Invalid message');
      }
    };
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      ws.close();
      wsRef.current = null;
    };
  }, [useDemoData]);

  useEffect(() => {
    const cleanup = connect();
    return () => {
      if (demoIntervalRef.current) {
        clearInterval(demoIntervalRef.current);
        demoIntervalRef.current = null;
      }
      if (typeof cleanup === 'function') cleanup();
    };
  }, [connect]);

  return { lastMessage, connected, error };
}

export { useWebSocket, WS_URL, API_BASE_URL };
