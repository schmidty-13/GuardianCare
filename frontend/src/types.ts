export type RoomState = 'empty_room' | 'person_present' | 'person_fallen';

export type PatientStatus = 'clear' | 'monitoring' | 'alert';

export interface CSIAmplitudeFrame {
  /** 52 subcarrier amplitudes (latest frame) */
  amplitudes: number[];
  /** Unix ms */
  timestamp: number;
}

export interface WebSocketMessage {
  type: 'update';
  /** Room state from CNN */
  roomState: RoomState;
  /** Confidence 0–1 */
  confidence: number;
  /** Current breathing rate (BPM) */
  breathingBpm: number | null;
  /** Latest CSI amplitudes (length 52) */
  csiAmplitudes: number[];
  /** Nurse alert sent (with timestamp) */
  alertSentAt?: number | null;
  /** Anomaly flag from breathing predictor */
  breathingAnomaly?: boolean;
}
