import { Link } from 'react-router-dom';

export default function EventLogPage() {
  return (
    <div className="page">
      <div className="page-content">
        <h1 className="page-title">Event log</h1>

        <section className="page-section">
          <h2 className="page-section-title">What it is</h2>
          <p className="page-text">
            The event log at the bottom of the dashboard is a timestamped list of system events. Each entry has a time (with milliseconds) and a short message.
            Events are appended in real time as the stream runs. The list is kept to a limited size (e.g. last 100 entries); newest entries appear at the top when viewing the log.
          </p>
        </section>

        <section className="page-section">
          <h2 className="page-section-title">Types of events</h2>
          <p className="page-text">
            Events are tagged by level and styled accordingly:
          </p>
          <ul className="page-list">
            <li><strong>Info</strong> — Normal operations: e.g. “Stream connected”, “State: MONITORING”.</li>
            <li><strong>Warn</strong> — Notable but non-critical conditions (if used by the backend).</li>
            <li><strong>Alert</strong> — Critical events such as “State: ALERT” and “Nurse alert sent”. These are shown in red and bold so they stand out for staff.</li>
          </ul>
        </section>

        <section className="page-section">
          <h2 className="page-section-title">Why it’s useful</h2>
          <p className="page-text">
            The log provides an audit trail of state changes and alerts. Staff can see when the system went from CLEAR to MONITORING, when a fall was detected and an alert sent,
            and when the stream connected. That supports both real-time awareness and later review without needing to watch the live dashboard continuously.
          </p>
        </section>

        <p className="page-back"><Link to="/" className="page-link">← Home</Link> · <Link to="/dashboard" className="page-link">Dashboard</Link></p>
      </div>
    </div>
  );
}
