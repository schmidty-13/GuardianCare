import type { SystemMeta } from '../types';

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
        <span className="system-meta-label">LINK</span>
        <span className={`system-meta-value system-meta-link ${connected ? 'connected' : 'disconnected'}`}>
          {demoMode ? 'DEMO' : connected ? 'LIVE' : 'DOWN'}
        </span>
      </span>
    </div>
  );
}
