import type { SystemMeta } from '../types';

function formatUptime(ms: number): string {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  if (h > 0) return `${h}h ${m % 60}m`;
  if (m > 0) return `${m}m ${s % 60}s`;
  return `${s}s`;
}

interface SystemMetaBarProps {
  meta: SystemMeta;
  connected: boolean;
  demoMode: boolean;
}

export function SystemMetaBar({ meta, connected, demoMode }: SystemMetaBarProps) {
  return (
    <div className="system-meta-bar">
      <span className="system-meta-item">
        <span className="system-meta-label">PACKET RATE</span>
        <span className="system-meta-value">{meta.packetRate != null ? `${meta.packetRate} p/s` : '—'}</span>
      </span>
      <span className="system-meta-item">
        <span className="system-meta-label">RSSI</span>
        <span className="system-meta-value">{meta.rssi != null ? `${meta.rssi} dBm` : '—'}</span>
      </span>
      <span className="system-meta-item">
        <span className="system-meta-label">MODEL</span>
        <span className="system-meta-value">{meta.modelVersion ?? '—'}</span>
      </span>
      <span className="system-meta-item">
        <span className="system-meta-label">LATENCY</span>
        <span className="system-meta-value">{meta.detectionLatencyMs != null ? `${meta.detectionLatencyMs} ms` : '—'}</span>
      </span>
      <span className="system-meta-item">
        <span className="system-meta-label">UPTIME</span>
        <span className="system-meta-value">{formatUptime(meta.uptimeMs)}</span>
      </span>
      <span className="system-meta-item">
        <span className="system-meta-label">LINK</span>
        <span className={`system-meta-value system-meta-link ${connected ? 'connected' : 'disconnected'}`}>
          {demoMode ? 'DEMO' : connected ? 'LIVE' : 'DOWN'}
        </span>
      </span>
    </div>
  );
}
