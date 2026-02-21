import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <div className="page page-home">
      <div className="page-content">
        <h1 className="page-home-title">Invisible Guardian</h1>
        <p className="page-home-tagline">Contact-free fall detection and breathing monitoring</p>

        <section className="page-home-section">
          <h2 className="page-section-title">What it does</h2>
          <p className="page-text">
            Invisible Guardian uses Wi‑Fi Channel State Information (CSI) to monitor a room without cameras or wearables.
            Two ESP32 boards exchange radio packets; the system analyzes how the wireless channel changes when people move or breathe.
            The result is continuous occupancy detection, breathing rate estimation, and automatic fall alerts—with no images and no devices on the person.
          </p>
        </section>

        <section className="page-home-section">
          <h2 className="page-section-title">Why it matters</h2>
          <p className="page-text">
            Falls in care settings are a major cause of injury and delayed response. Cameras raise privacy concerns; wearables are often not worn.
            CSI-based monitoring works in the dark, through bedding, and generates no personally identifiable imagery. It can run on low-cost hardware
            and scale to many rooms, giving staff earlier alerts when someone has fallen or when breathing becomes irregular.
          </p>
        </section>

        <section className="page-home-section">
          <h2 className="page-section-title">Live dashboard</h2>
          <p className="page-text">
            The monitoring dashboard shows real-time CSI data, breathing rate, room state, and an event log. Use the link below to open it,
            or read about each part of the system in the pages linked here.
          </p>
          <p className="page-home-cta">
            <Link to="/dashboard" className="page-link page-link-primary">Open dashboard</Link>
          </p>
        </section>

        <section className="page-home-section">
          <h2 className="page-section-title">Learn more</h2>
          <ul className="page-link-list">
            <li><Link to="/csi" className="page-link">CSI amplitude & heatmap</Link> — What the 52 subcarriers represent and how the heatmap is built.</li>
            <li><Link to="/breathing-rate" className="page-link">Breathing rate</Link> — How BPM is derived from CSI and what the baseline window means.</li>
            <li><Link to="/occupancy-status" className="page-link">Occupancy & patient status</Link> — CLEAR, MONITORING, ALERT and fall detection.</li>
            <li><Link to="/event-log" className="page-link">Event log</Link> — Timestamped events and how they are used.</li>
            <li><Link to="/system" className="page-link">System metadata</Link> — Packet rate, RSSI, model version, latency, uptime.</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
