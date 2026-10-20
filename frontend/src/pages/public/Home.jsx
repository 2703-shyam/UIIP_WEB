import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, MapPin, CheckCircle, Bell, ArrowRight, Sparkles, Users, Wrench, Building2 } from 'lucide-react';

export const Home = () => {
  return (
    <div className="home-page">
      <section className="hero-section">
        <div className="hero-container">
          <div className="badge badge-info" style={{ marginBottom: '20px', display: 'inline-flex', padding: '6px 16px' }}>
            <Sparkles size={16} /> Next-Gen Urban Infrastructure Platform
          </div>
          <h1 className="hero-title">
            Smart Municipal Tracking & Faster Civic Issue Resolution
          </h1>
          <p className="hero-subtitle">
            Seamlessly bridging citizens, municipal engineers, and city administrators through real-time GIS mapping, status updates, and automated workflows.
          </p>
          <div className="hero-actions">
            <Link to="/register" className="btn btn-primary btn-lg">
              Report an Issue Now <ArrowRight size={18} />
            </Link>
            <Link to="/about" className="btn btn-outline btn-lg" style={{ color: '#0f0d0d', borderColor: 'rgba(255,255,255,0.3)' }}>
              Explore Platform
            </Link>
          </div>
        </div>
      </section>

      <section className="features-section">
        <div className="section-container">
          <h2 className="section-title">Designed for Modern Cities</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="stat-icon-container" style={{ margin: '0 auto 16px' }}>
                <MapPin size={28} />
              </div>
              <h3>GPS Location Tagging</h3>
              <p>Pinpoint exact locations of potholes, streetlights, or water leaks with high precision on interactive maps.</p>
            </div>

            <div className="feature-card">
              <div className="stat-icon-container" style={{ margin: '0 auto 16px', background: '#ecfdf5', color: '#10b981' }}>
                <CheckCircle size={28} />
              </div>
              <h3>End-to-End Tracking</h3>
              <p>Track your complaint live from verification and engineer assignment through repair completion.</p>
            </div>

            <div className="feature-card">
              <div className="stat-icon-container" style={{ margin: '0 auto 16px', background: '#f0f9ff', color: '#0ea5e9' }}>
                <Bell size={28} />
              </div>
              <h3>Public Bulletins</h3>
              <p>Get instant notifications on scheduled water cutoffs, road diversions, and public maintenance notices.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section-container" style={{ padding: '40px 24px 80px' }}>
        <h2 className="section-title">Unified Workflows for 3 Roles</h2>
        <div className="features-grid">
          <div className="card" style={{ textAlign: 'center' }}>
            <Users size={36} style={{ color: '#4f46e5', margin: '0 auto 12px' }} />
            <h3>Citizens</h3>
            <p className="helper-text" style={{ marginTop: '8px' }}>
              Report issues, attach evidence photos, select map coordinates, and receive real-time repair notifications.
            </p>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <Wrench size={36} style={{ color: '#10b981', margin: '0 auto 12px' }} />
            <h3>Engineers</h3>
            <p className="helper-text" style={{ marginTop: '8px' }}>
              Receive field work orders, update task progress from site, and submit completion resolution evidence.
            </p>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <Building2 size={36} style={{ color: '#f59e0b', margin: '0 auto 12px' }} />
            <h3>Administrators</h3>
            <p className="helper-text" style={{ marginTop: '8px' }}>
              Verify reported issues, set priority/department, dispatch engineers, and monitor citywide GIS analytics.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
