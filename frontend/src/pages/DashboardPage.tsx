import { useState, useRef, useEffect, useCallback } from 'react';
import { useWebSocket, API_BASE_URL } from '../hooks/useWebSocket';
import { CSIHeatmap } from '../components/CSIHeatmap';
import { CSIAmplitudeChart } from '../components/CSIAmplitudeChart';
import { BreathingRateChart } from '../components/BreathingRateChart';
import { PatientStatusCard } from '../components/PatientStatusCard';
import { SystemMetaBar } from '../components/SystemMetaBar';
import { EventLog } from '../components/EventLog';
import type { PatientStatus, SystemMeta, LogEvent } from '../types';

const DEFAULT_CSI = Array.from({ length: 52 }, () => 25 + Math.random() * 15);
const CSI_HISTORY_SIZE = 120;

function deriveStatus(roomState: string, breathingAnomaly: boolean): PatientStatus {
  if (roomState === 'no_hardware' || roomState === 'waiting') return 'offline';
  if (roomState === 'person_fallen') return 'alert';
  if (roomState === 'person_present' || breathingAnomaly) return 'monitoring';
  return 'clear';
}

let eventId = 0;
function createEvent(message: string, level: LogEvent['level']): LogEvent {
  return { id: `e-${++eventId}`, timestamp: Date.now(), message, level };
}

export default function DashboardPage() {
  const [demoMode, setDemoMode] = useState(true);
  const { lastMessage, connected, error } = useWebSocket(demoMode);
  const bpmHistoryRef = useRef<{ bpm: number; timestamp: number }[]>([]);
  const [bpmHistory, setBpmHistory] = useState<{ bpm: number; timestamp: number }[]>([]);
  const csiHistoryRef = useRef<{ timestamp: number; amplitudes: number[] }[]>([]);
  const [csiHistory, setCsiHistory] = useState<{ timestamp: number; amplitudes: number[] }[]>([]);
  const [events, setEvents] = useState<LogEvent[]>([]);
  const startTimeRef = useRef<number>(Date.now());
  const prevStatusRef = useRef<PatientStatus | null>(null);
  const prevAlertRef = useRef<number | null>(null);

  const pushEvent = useCallback((message: string, level: LogEvent['level']) => {
    setEvents((prev) => [...prev.slice(-99), createEvent(message, level)]);
  }, []);

  useEffect(() => {
    if (!lastMessage) return;
    const bpm = lastMessage.breathingBpm;
    const ts = lastMessage.alertSentAt ?? Date.now();
    if (bpm != null && bpm > 0) {
      bpmHistoryRef.current = [...bpmHistoryRef.current.slice(-199), { bpm, timestamp: ts }];
      setBpmHistory(bpmHistoryRef.current);
    }
  }, [lastMessage?.breathingBpm, lastMessage?.alertSentAt, lastMessage?.type]);

  useEffect(() => {
    if (!lastMessage?.csiAmplitudes?.length) return;
    const entry = { timestamp: Date.now(), amplitudes: lastMessage.csiAmplitudes };
    csiHistoryRef.current = [...csiHistoryRef.current.slice(-(CSI_HISTORY_SIZE - 1)), entry];
    setCsiHistory(csiHistoryRef.current);
  }, [lastMessage?.csiAmplitudes]);

  const roomState = lastMessage?.roomState ?? 'empty_room';
  const breathingAnomaly = lastMessage?.breathingAnomaly ?? false;
  const status = deriveStatus(roomState, breathingAnomaly);

  useEffect(() => {
    if (prevStatusRef.current !== status) {
      if (prevStatusRef.current != null) pushEvent(`State: ${status}`, status === 'alert' ? 'alert' : 'info');
      prevStatusRef.current = status;
    }
    const at = lastMessage?.alertSentAt ?? null;
    if (at != null && at !== prevAlertRef.current) {
      pushEvent('Nurse alert sent', 'alert');
      prevAlertRef.current = at;
    }
  }, [status, lastMessage?.alertSentAt, pushEvent]);

  useEffect(() => {
    if (connected && events.length === 0) pushEvent('Stream connected', 'info');
  }, [connected]); // eslint-disable-line react-hooks/exhaustive-deps

  const csiAmplitudes = lastMessage?.csiAmplitudes?.length === 52 ? lastMessage.csiAmplitudes : DEFAULT_CSI;
  const confidence = lastMessage?.confidence ?? 0;
  const alertSentAt = lastMessage?.alertSentAt ?? null;

  const systemMeta: SystemMeta = {
    packetRate: lastMessage?.packetRate ?? null,
    rssi: lastMessage?.rssi ?? null,
    modelVersion: lastMessage?.modelVersion ?? null,
    detectionLatencyMs: lastMessage?.detectionLatencyMs ?? null,
    breathingBaselineWindowMin: 10,
    uptimeMs: Date.now() - startTimeRef.current,
    frameCount: lastMessage?.frameCount ?? null,
  };

  const resetAlert = useCallback(async () => {
    try {
      await fetch(`${API_BASE_URL}/reset_alert`, { method: 'POST' });
    } catch {
      // ignore
    }
  }, []);

  return (
    <div className="app-dashboard">
      <header className="app-header app-header-dashboard">
        <div className="app-header-top">
          <span className="app-title">Dashboard</span>
          <label className="toggle-label">
            <input type="checkbox" checked={demoMode} onChange={(e) => setDemoMode(e.target.checked)} />
            <span>Demo</span>
          </label>
        </div>
        <SystemMetaBar meta={systemMeta} connected={connected} demoMode={demoMode} />
        {error && <div className="app-error">{error}</div>}
      </header>

      <main className="dashboard">
        <div className="dashboard-top">
            <PatientStatusCard
              status={status}
              roomState={roomState}
              confidence={confidence}
              alertSentAt={alertSentAt}
              breathingAnomaly={breathingAnomaly}
              onResetAlert={demoMode ? undefined : resetAlert}
            />
        </div>
        <div className="dashboard-main">
          <div className="dashboard-left">
            <CSIAmplitudeChart history={csiHistory} />
            <CSIHeatmap amplitudes={csiAmplitudes} />
          </div>
          <div className="dashboard-right">
            <BreathingRateChart history={bpmHistory} />
            <EventLog events={events} />
          </div>
        </div>
      </main>
    </div>
  );
}
