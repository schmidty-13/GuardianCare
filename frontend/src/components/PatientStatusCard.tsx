import type { PatientStatus, RoomState } from '../types';

interface PatientStatusCardProps {
  status: PatientStatus;
  roomState: RoomState;
  confidence: number;
  breathingBpm: number | null;
  alertSentAt: number | null;
  breathingAnomaly?: boolean;
  detectionLatencyMs?: number | null;
  breathingBaselineWindowMin?: number;
}

const ROOM_LABELS: Record<RoomState, string> = {
  empty_room: 'Room empty',
  person_present: 'Person present',
  person_fallen: 'Fall detected',
};

function statusLabel(s: PatientStatus): string {
  switch (s) {
    case 'clear':
      return 'CLEAR';
    case 'monitoring':
      return 'MONITORING';
    case 'alert':
      return 'ALERT';
    default:
      return '—';
  }
}

export function PatientStatusCard({
  status,
  roomState,
  confidence,
  breathingBpm,
  alertSentAt,
  breathingAnomaly = false,
  detectionLatencyMs = null,
  breathingBaselineWindowMin = 10,
}: PatientStatusCardProps) {
  const isAlert = status === 'alert';
  const alertTime = alertSentAt ? new Date(alertSentAt).toLocaleTimeString('en-US', { hour12: false }) : null;

  return (
    <section className={`panel patient-status status-${status}`} data-alert={isAlert}>
      <header className="panel-header">
        <h2 className="panel-title">OCCUPANCY / PATIENT STATUS</h2>
      </header>
      <div className="status-content">
        <div className="status-badge" data-status={status}>
          {statusLabel(status)}
        </div>
        {isAlert && (
          <div className="alert-banner">
            <span className="alert-text">NURSE ALERT SENT</span>
            {alertTime && <span className="alert-time">{alertTime}</span>}
          </div>
        )}
        <dl className="status-details">
          <dt>Room state</dt>
          <dd>{ROOM_LABELS[roomState]}</dd>
          <dt>Confidence</dt>
          <dd>{(confidence * 100).toFixed(1)}%</dd>
          <dt>Detection latency</dt>
          <dd>{detectionLatencyMs != null ? `${detectionLatencyMs} ms` : '—'}</dd>
          <dt>Breathing rate</dt>
          <dd>{breathingBpm != null ? `${breathingBpm} BPM` : '—'}</dd>
          <dt>Baseline window</dt>
          <dd>{breathingBaselineWindowMin} m</dd>
          {breathingAnomaly && (
            <>
              <dt>Breathing</dt>
              <dd className="anomaly">Anomaly detected</dd>
            </>
          )}
        </dl>
      </div>
    </section>
  );
}
