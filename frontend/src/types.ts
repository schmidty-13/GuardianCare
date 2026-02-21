export type RoomState = 'empty_room' | 'person_present' | 'person_fallen';

export type PatientStatus = 'clear' | 'monitoring' | 'alert';

export interface CSIAmplitudeFrame {
  amplitudes: number[];
  timestamp: number;
}

export interface WebSocketMessage {
  type: 'update';
  roomState: RoomState;
  confidence: number;
  breathingBpm: number | null;
  csiAmplitudes: number[];
  alertSentAt?: number | null;
  breathingAnomaly?: boolean;
  /** Packets per second */
  packetRate?: number | null;
  /** RSSI dBm */
  rssi?: number | null;
  /** Model version string */
  modelVersion?: string | null;
  /** Detection latency in ms */
  detectionLatencyMs?: number | null;
  /** Breathing baseline window in minutes */
  breathingBaselineWindowMin?: number | null;
  /** Frames processed (inference server) */
  frameCount?: number | null;
}

export interface SystemMeta {
  packetRate: number | null;
  rssi: number | null;
  modelVersion: string | null;
  detectionLatencyMs: number | null;
  breathingBaselineWindowMin: number;
  uptimeMs: number;
  frameCount: number | null;
}

export interface LogEvent {
  id: string;
  timestamp: number;
  message: string;
  level: 'info' | 'warn' | 'alert';
}
