import { Link } from 'react-router-dom';

export default function SystemPage() {
  return (
    <div className="page">
      <div className="page-content">
        <h1 className="page-title">System metadata</h1>

        <section className="page-section">
          <h2 className="page-section-title">What is shown</h2>
          <p className="page-text">
            The dashboard header displays a row of system metrics so operators can see link and pipeline health at a glance. All values are updated from the live stream (or from demo data when in demo mode).
          </p>
        </section>

        <section className="page-section">
          <h2 className="page-section-title">Metrics explained</h2>
          <ul className="page-list">
            <li><strong>Packet rate</strong> — CSI packets per second (p/s) received by the pipeline. Target is around 100 p/s. A drop can indicate WiFi interference or receiver issues.</li>
            <li><strong>RSSI</strong> — Received Signal Strength Indicator in dBm. Indicates link quality between the two ESP32 boards. Very low values (e.g. below −80 dBm) may mean poor placement or obstacles.</li>
            <li><strong>Model</strong> — Version string of the classification model (e.g. 1.0.0). Useful to confirm which model is in use after updates.</li>
            <li><strong>Latency</strong> — Detection latency in milliseconds: time from CSI window to classification result. Lower is better for faster fall alerts; typical values are under 200 ms.</li>
            <li><strong>Uptime</strong> — How long the current stream has been connected (hours, minutes, seconds). Resets when the page is reloaded or the connection is restarted.</li>
            <li><strong>Link</strong> — DEMO (using built-in demo data), LIVE (connected to backend), or DOWN (disconnected). Lets staff know whether they are viewing live hardware data or a simulation.</li>
          </ul>
        </section>

        <p className="page-back"><Link to="/" className="page-link">← Home</Link> · <Link to="/dashboard" className="page-link">Dashboard</Link></p>
      </div>
    </div>
  );
}
