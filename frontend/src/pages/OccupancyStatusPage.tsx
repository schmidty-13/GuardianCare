import { Link } from 'react-router-dom';

export default function OccupancyStatusPage() {
  return (
    <div className="page">
      <div className="page-content">
        <h1 className="page-title">Occupancy & patient status</h1>

        <section className="page-section">
          <h2 className="page-section-title">The three states</h2>
          <p className="page-text">
            The system classifies the room into three states, which map to patient status on the dashboard:
          </p>
          <ul className="page-list">
            <li><strong>CLEAR</strong> — Room is empty. No person detected.</li>
            <li><strong>MONITORING</strong> — A person is present (sitting, standing, or moving normally) or a breathing anomaly has been detected. The room is being actively monitored.</li>
            <li><strong>ALERT</strong> — A fall is detected (person_fallen). The panel turns red, a nurse alert is sent (e.g. via SMS), and “NURSE ALERT SENT” is shown with a timestamp.</li>
          </ul>
        </section>

        <section className="page-section">
          <h2 className="page-section-title">How classification works</h2>
          <p className="page-text">
            A small 1D-CNN runs on sliding windows of CSI data (e.g. 500 samples × 52 subcarriers at 100 Hz, so 5 seconds per window). The model is trained on labeled data:
            empty room, person present, person fallen. The network outputs a class and confidence score. To reduce false alarms, an ALERT is only raised when the model
            predicts person_fallen with high confidence (e.g. &gt;80%) for several consecutive windows (e.g. 3). Confidence and detection latency are shown on the dashboard.
          </p>
        </section>

        <section className="page-section">
          <h2 className="page-section-title">What you see on the dashboard</h2>
          <p className="page-text">
            The occupancy/patient status card shows: current status badge (CLEAR / MONITORING / ALERT), room state label, confidence percentage, detection latency in milliseconds,
            current breathing rate, and the breathing baseline window (e.g. 10 m). When status is ALERT, the card background turns muted red with a subtle pulse and
            the “NURSE ALERT SENT” banner with timestamp is displayed.
          </p>
        </section>

        <p className="page-back"><Link to="/" className="page-link">← Home</Link> · <Link to="/dashboard" className="page-link">Dashboard</Link></p>
      </div>
    </div>
  );
}
