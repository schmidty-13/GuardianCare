import { useState, useRef, useEffect } from 'react';
import { useWebSocket } from './hooks/useWebSocket';
import { CSIHeatmap } from './components/CSIHeatmap';
import { BreathingRateChart } from './components/BreathingRateChart';
import { PatientStatusCard } from './components/PatientStatusCard';
import type { PatientStatus } from './types';
import './App.css';

const DEFAULT_CSI = Array.from({ length: 52 }, () => 25 + Math.random() * 15);

function derivePatientStatus(
  roomState: string,
  breathingAnomaly: boolean
): PatientStatus {
  if (roomState === 'person_fallen') return 'alert';
  if (roomState === 'person_present' || breathingAnomaly) return 'monitoring';
  return 'clear';
}

export default function App() {
  const [demoMode, setDemoMode] = useState(true);
  const { lastMessage, connected, error } = useWebSocket(demoMode);
  const bpmHistoryRef = useRef<{ bpm: number; timestamp: number }[]>([]);
  const [bpmHistory, setBpmHistory] = useState<{ bpm: number; timestamp: number }[]>([]);

  useEffect(() => {
    if (!lastMessage) return;
    const bpm = lastMessage.breathingBpm;
    const ts = lastMessage.alertSentAt ?? Date.now();
    if (bpm != null && bpm > 0) {
      bpmHistoryRef.current = [
        ...bpmHistoryRef.current.slice(-199),
        { bpm, timestamp: ts },
      ];
      setBpmHistory(bpmHistoryRef.current);
    }
  }, [lastMessage?.breathingBpm, lastMessage?.alertSentAt, lastMessage?.type]);

  const csiAmplitudes = lastMessage?.csiAmplitudes?.length === 52
    ? lastMessage.csiAmplitudes
    : DEFAULT_CSI;
  const roomState = lastMessage?.roomState ?? 'empty_room';
  const confidence = lastMessage?.confidence ?? 0;
  const breathingBpm = lastMessage?.breathingBpm ?? null;
  const alertSentAt = lastMessage?.alertSentAt ?? null;
  const breathingAnomaly = lastMessage?.breathingAnomaly ?? false;
  const status = derivePatientStatus(roomState, breathingAnomaly);

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">Invisible Guardian</h1>
        <p className="app-subtitle">Contact-free fall detection &amp; breathing monitoring</p>
        <div className="app-controls">
          <label className="toggle-label">
            <input
              type="checkbox"
              checked={demoMode}
              onChange={(e) => setDemoMode(e.target.checked)}
            />
            <span>Demo data</span>
          </label>
          <span className={`connection-badge ${connected ? 'connected' : 'disconnected'}`}>
            {connected ? 'Live' : 'Disconnected'}
          </span>
          {error && <span className="connection-error">{error}</span>}
        </div>
      </header>

      <main className="dashboard">
        <div className="dashboard-row dashboard-row--main">
          <PatientStatusCard
            status={status}
            roomState={roomState}
            confidence={confidence}
            breathingBpm={breathingBpm}
            alertSentAt={alertSentAt}
            breathingAnomaly={breathingAnomaly}
          />
          <BreathingRateChart history={bpmHistory} />
        </div>
        <div className="dashboard-row">
          <CSIHeatmap amplitudes={csiAmplitudes} />
        </div>
      </main>

      <footer className="app-footer">
        <span>CSI-based monitoring · No camera · No wearable</span>
      </footer>
    </div>
  );
}
