import { Link } from 'react-router-dom';

export default function CsiPage() {
  return (
    <div className="page">
      <div className="page-content">
        <h1 className="page-title">CSI amplitude (52 subcarriers)</h1>

        <section className="page-section">
          <h2 className="page-section-title">What is CSI?</h2>
          <p className="page-text">
            Channel State Information (CSI) describes how a wireless signal propagates between transmitter and receiver.
            In Wi‑Fi (802.11n/ac), the channel is measured across many subcarriers—narrow frequency bins. We use 52 subcarriers.
            Each subcarrier has an amplitude (and phase); the amplitude reflects how much the environment attenuates or reinforces that frequency.
            When a person moves or breathes, they change the multipath pattern (reflections, obstructions), so CSI amplitudes change over time.
          </p>
        </section>

        <section className="page-section">
          <h2 className="page-section-title">What the heatmap shows</h2>
          <p className="page-text">
            The dashboard heatmap displays the latest amplitude for all 52 subcarriers in a 4×13 grid. Color runs from light (low amplitude) to dark blue (high amplitude).
            In an empty room the pattern is relatively stable; when someone is present, amplitudes fluctuate with breathing and movement. The system uses this stream
            as input for occupancy classification (empty / person present / person fallen) and for breathing-rate extraction.
          </p>
        </section>

        <section className="page-section">
          <h2 className="page-section-title">How we get CSI</h2>
          <p className="page-text">
            One ESP32 acts as transmitter, sending UDP packets; the other is the receiver. The receiver runs Espressif’s esp-csi pipeline to extract CSI from incoming packets.
            We target about 100 CSI frames per second. Each frame gives 52 amplitude values, forming a 52-dimensional vector at 100 Hz that the Python pipeline filters,
            feeds into a CNN for room state, and uses (e.g. on a high-variance subcarrier) for breathing rate via bandpass + FFT.
          </p>
        </section>

        <p className="page-back"><Link to="/" className="page-link">← Home</Link> · <Link to="/dashboard" className="page-link">Dashboard</Link></p>
      </div>
    </div>
  );
}
