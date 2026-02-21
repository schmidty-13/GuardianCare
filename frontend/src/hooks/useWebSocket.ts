import { useEffect, useRef, useState, useCallback } from 'react';
import type { WebSocketMessage } from '../types';

const WS_URL = (() => {
  const base = typeof window !== 'undefined' ? window.location : { host: 'localhost', protocol: 'ws:' };
  const host = (import.meta as { env?: { VITE_WS_HOST?: string } }).env?.VITE_WS_HOST;
  if (host) return host;
  return `${(base as { protocol: string }).protocol === 'https:' ? 'wss:' : 'ws:'}//${(base as { host: string }).host}/ws`;
})();

const DEMO_UPDATE_MS = 150;

function useWebSocket(useDemoData: boolean) {
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const demoIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
    ws.onclose = () => setConnected(false);
    ws.onerror = () => setError('Connection error');
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data as string) as WebSocketMessage;
        if (data.type === 'update') setLastMessage(data);
      } catch {
        setError('Invalid message');
      }
    };
    return () => {
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

export { useWebSocket, WS_URL };
