import { Link } from 'react-router-dom';

export default function BreathingRatePage() {
  return (
    <div className="page">
      <div className="page-content">
        <h1 className="page-title">Breathing rate (BPM)</h1>

        <section className="page-section">
          <h2 className="page-section-title">What is shown</h2>
          <p className="page-text">
            The breathing rate panel on the dashboard shows breaths per minute (BPM) over time. Normal resting breathing for adults is typically 12–20 BPM.
            The chart includes reference lines for this range. The line is updated in real time from the CSI-derived breathing signal.
          </p>
        </section>

        <section className="page-section">
          <h2 className="page-section-title">How BPM is derived</h2>
          <p className="page-text">
            The pipeline selects a high-variance subcarrier (or combines several) from the CSI stream. A bandpass filter isolates the respiratory band (about 0.1–0.5 Hz),
            which corresponds to 6–30 BPM. An FFT is run on the filtered signal; the dominant peak frequency is converted to BPM (peak_frequency × 60).
            This value is sent to the dashboard and plotted in the time series.
          </p>
        </section>

        <section className="page-section">
          <h2 className="page-section-title">Baseline window (10 m)</h2>
          <p className="page-text">
            The system keeps a rolling baseline of breathing rate over a 10-minute window. That baseline is used for anomaly detection: if the current BPM drifts
            more than about 2 standard deviations from the baseline for a sustained period (e.g. 60 seconds), an anomaly is flagged. That helps spot irregular breathing
            or unusual patterns without requiring a fixed threshold. The “Baseline window” value on the occupancy card indicates this 10-minute window.
          </p>
        </section>

        <p className="page-back"><Link to="/" className="page-link">← Home</Link> · <Link to="/dashboard" className="page-link">Dashboard</Link></p>
      </div>
    </div>
  );
}
