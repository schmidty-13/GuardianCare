import type { PatientStatus, RoomState } from '../types';

interface PatientStatusCardProps {
  status: PatientStatus;
  roomState: RoomState;
  confidence: number;
  alertSentAt: number | null;
  breathingAnomaly?: boolean;
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
  alertSentAt,
  breathingAnomaly = false,
}: PatientStatusCardProps) {
  const isAlert = status === 'alert';
  const alertTime = alertSentAt ? new Date(alertSentAt).toLocaleTimeString('en-US', { hour12: false }) : null;

  return (
    <section className={`panel patient-status status-${status}`} data-alert={isAlert}>
      <header className="panel-header patient-status__header">
        <h2 className="panel-title">PATIENT STATUS</h2>
        <span className="status-badge status-badge--small" data-status={status}>
          {statusLabel(status)}
        </span>
      </header>
      <div className="patient-status__center">
        <div className="patient-status__primary">
          <div className="patient-status__room">
            <span className="patient-status__room-label">Room state</span>
            <span className="patient-status__room-value">{ROOM_LABELS[roomState]}</span>
          </div>
          <div className="patient-status__confidence">
            <span className="patient-status__confidence-label">Confidence</span>
            <span className="patient-status__confidence-value">{(confidence * 100).toFixed(1)}%</span>
          </div>
        </div>
      </div>
      {isAlert && (
        <div className="alert-banner">
          <span className="alert-text">NURSE ALERT SENT</span>
          {alertTime && <span className="alert-time">{alertTime}</span>}
        </div>
      )}
      {breathingAnomaly && (
        <div className="patient-status__secondary">
          <span className="anomaly">Breathing anomaly detected</span>
        </div>
      )}
    </section>
  );
}
