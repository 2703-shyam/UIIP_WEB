import React from 'react';

export const About = () => {
  return (
    <div className="about-page section-container">
      <h1 className="page-title">About UIIP</h1>
      <p className="lead-text">
        The Urban Infrastructure Issue Platform (UIIP) is a unified digital platform built to bridge the gap between citizens and municipal authorities.
      </p>

      <div className="about-section">
        <h2>Our Mission</h2>
        <p>
          To accelerate infrastructure repair, improve public accountability, and enhance civic satisfaction through real-time tracking, GIS map integration, and workflow automation.
        </p>
      </div>

      <div className="roles-overview">
        <h2>Platform Roles</h2>
        <div className="role-cards-grid">
          <div className="role-info-card">
            <h3>Citizens</h3>
            <p>Easily upload pictures, describe issues, tag location coordinates, track progress, and receive civic alerts.</p>
          </div>
          <div className="role-info-card">
            <h3>Engineers</h3>
            <p>Access assigned work orders, view issue severity, navigate to complaint sites, and log completion evidence.</p>
          </div>
          <div className="role-info-card">
            <h3>Administrators</h3>
            <p>Review submitted issues, set priority/severity, assign field engineers, publish notices, and view citywide GIS analytics.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
