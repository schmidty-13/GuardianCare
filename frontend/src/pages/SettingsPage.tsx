import { Link } from 'react-router-dom';

export default function SettingsPage() {
  return (
    <div className="page">
      <div className="page-content">
        <h1 className="page-title">Settings</h1>
        <section className="page-section">
          <p className="page-text">
            Configuration and preferences for Invisible Guardian monitoring.
          </p>
        </section>
        <p className="page-back"><Link to="/" className="page-link">← Dashboard</Link></p>
      </div>
    </div>
  );
}
