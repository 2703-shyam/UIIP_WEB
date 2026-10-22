import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ClipboardCheck,
  HardHat,
  MapPin,
  ShieldCheck,
  UsersRound,
  Wrench
} from 'lucide-react';

const roles = [
  {
    icon: UsersRound,
    title: 'Citizens',
    description: 'Report local infrastructure problems with photos and a location, then follow the complaint as it moves forward.'
  },
  {
    icon: HardHat,
    title: 'Field engineers',
    description: 'Review assigned work, record progress from the field, and submit a resolution report with completion evidence.'
  },
  {
    icon: ClipboardCheck,
    title: 'Administrators',
    description: 'Verify reports, set priorities, assign engineers, and review submitted resolution evidence.'
  }
];

export const About = () => (
  <div className="about-page">
    <section className="about-intro">
      <div className="about-eyebrow"><ShieldCheck size={16} /> Urban Infrastructure Issue Platform</div>
      <h1>Better city services start with a clear report.</h1>
      <p className="about-intro-copy">
        UIIP connects residents and municipal teams in one place, helping local infrastructure issues move from a submitted report to a documented resolution.
      </p>
      <div className="about-intro-actions">
        <Link to="/register" className="btn btn-primary btn-lg">Report an issue <ArrowRight size={18} /></Link>
        <Link to="/login" className="about-signin-link">Sign in to your workspace</Link>
      </div>
      <div className="about-flow" aria-label="Issue reporting workflow">
        <span><MapPin size={16} /> Report</span>
        <i aria-hidden="true" />
        <span><ShieldCheck size={16} /> Review</span>
        <i aria-hidden="true" />
        <span><Wrench size={16} /> Resolve</span>
      </div>
    </section>

    <section className="about-mission" aria-labelledby="about-mission-title">
      <div className="about-section-kicker">Our mission</div>
      <div className="about-mission-content">
        <h2 id="about-mission-title">Make civic issue resolution easier to follow.</h2>
        <p>
          A useful report needs enough detail to act on, and residents deserve visibility into what happens next. UIIP brings location-aware reporting, municipal review, engineer assignments, and resolution evidence into a shared workflow.
        </p>
      </div>
    </section>

    <section className="about-roles" aria-labelledby="about-roles-title">
      <div className="about-section-heading">
        <div>
          <div className="about-section-kicker">One shared workflow</div>
          <h2 id="about-roles-title">Built for the people moving work forward</h2>
        </div>
        <p>Each workspace supports a different part of the same service journey.</p>
      </div>
      <div className="about-role-grid">
        {roles.map(({ icon: Icon, title, description }, index) => (
          <article className="about-role-card" key={title}>
            <div className="about-role-card-top">
              <span className="about-role-icon"><Icon size={21} /></span>
              <span className="about-role-number">0{index + 1}</span>
            </div>
            <h3>{title}</h3>
            <p>{description}</p>
          </article>
        ))}
      </div>
    </section>
  </div>
);
