import React from 'react';
import ReactDOM from 'react-dom/client';
import { UserRound, LayoutDashboard, MapPin, Shield, FileText } from 'lucide-react';
import { Button } from './components/common/Button';
import { Card } from './components/common/Card';
import { Chip } from './components/common/Chip';
import { StatusBadge } from './components/common/StatusBadge';
import './index.css';

const links = [
  [LayoutDashboard, 'Dashboard'],
  [FileText, 'My Complaints'],
  [MapPin, 'City Map']
];

function PreviewNav({ mobile = false }) {
  return (
    <>
      <header className={`navbar ${mobile ? 'preview-nav-mobile' : ''}`}>
        <div className="navbar-brand"><a className="logo-link" href="#preview"><span className="logo-badge"><Shield size={19} /></span><span className="logo-text">UIIP <span>Portal</span></span></a></div>
        <nav className="navbar-actions" aria-label="Preview account navigation">
          {mobile ? <button className="button-icon-circular" aria-label="Account"><UserRound size={18} /></button> : <span className="preview-user">Administrator</span>}
        </nav>
      </header>
      <aside className={`sidebar ${mobile ? 'preview-sidebar-mobile' : ''}`} aria-label="Preview workspace navigation">
        <nav className="sidebar-nav" aria-label="Workspace preview">
          <div className="sidebar-group">{links.map(([Icon, label]) => <a key={label} className={`sidebar-link ${label === 'Dashboard' ? 'active' : ''}`} href="#preview"><Icon size={18} className="sidebar-icon" /><span>{label}</span></a>)}</div>
        </nav>
      </aside>
    </>
  );
}

function PrimitiveSet({ mobile = false }) {
  return (
    <section className={`preview-device ${mobile ? 'preview-device-mobile' : 'preview-device-desktop'}`}>
      <p className="preview-device-label">{mobile ? 'Mobile · 390px' : 'Desktop · 1200px'}</p>
      <PreviewNav mobile={mobile} />
      <main className="preview-content">
        <p className="preview-eyebrow">Shared primitives</p>
        <h1 className="preview-title">Issue overview</h1>
        <div className="preview-actions">
          <Button>View reports</Button>
          <Button variant="outline">Filter</Button>
        </div>
        <Card className="preview-card">
          <div className="preview-card-heading"><div><p className="preview-eyebrow">Complaint · #UIIP-2041</p><h2>Road surface damage</h2></div><StatusBadge status="In Progress" /></div>
          <p className="preview-description">Pothole reported near the public library entrance.</p>
          <div className="preview-chip-row"><Chip icon={MapPin}>Ward 08</Chip><Chip>Roads</Chip></div>
        </Card>
        <div className="preview-badge-row"><StatusBadge status="Submitted" /><StatusBadge status="Verified" /><StatusBadge status="Resolved" /><StatusBadge status="Rejected" /></div>
      </main>
    </section>
  );
}

function DesignPreview() {
  return <div className="design-preview"><header className="preview-page-heading"><p className="preview-eyebrow">UIIP · Step 2</p><h1>Primitive preview</h1><p>Live shared components at desktop and mobile widths.</p></header><div className="preview-device-grid"><PrimitiveSet /><PrimitiveSet mobile /></div></div>;
}

ReactDOM.createRoot(document.getElementById('design-preview-root')).render(<DesignPreview />);
