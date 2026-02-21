import type { LogEvent } from '../types';

function formatLogTime(ms: number): string {
  const d = new Date(ms);
  return d.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit', fractionalSecondDigits: 3 });
}

interface EventLogProps {
  events: LogEvent[];
  maxEntries?: number;
}

export function EventLog({ events, maxEntries = 100 }: EventLogProps) {
  const display = events.slice(-maxEntries).reverse();

  return (
    <section className="panel event-log">
      <header className="panel-header">
        <h2 className="panel-title">EVENT LOG</h2>
        <span className="panel-meta">{events.length} entries</span>
      </header>
      <div className="event-log-list">
        {display.length === 0 ? (
          <div className="event-log-empty">No events</div>
        ) : (
          display.map((e) => (
            <div key={e.id} className={`event-log-row event-log-row--${e.level}`}>
              <span className="event-log-time">{formatLogTime(e.timestamp)}</span>
              <span className="event-log-message">{e.message}</span>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
