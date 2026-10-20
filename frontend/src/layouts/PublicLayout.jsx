import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar';
import { ToastContainer } from '../components/common/Toast';

export const PublicLayout = () => {
  return (
    <div className="layout-public">
      <Navbar />
      <ToastContainer />
      <main className="main-content-public">
        <Outlet />
      </main>
      <footer className="public-footer">
        <div className="footer-container">
          <p>&copy; {new Date().getFullYear()} UIIP - Urban Infrastructure Issue Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};
