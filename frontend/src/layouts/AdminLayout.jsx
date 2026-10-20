import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar';
import { Sidebar } from '../components/common/Sidebar';
import { ToastContainer } from '../components/common/Toast';

export const AdminLayout = () => {
  return (
    <div className="layout-dashboard">
      <Navbar />
      <ToastContainer />
      <div className="dashboard-container">
        <Sidebar />
        <main className="dashboard-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
