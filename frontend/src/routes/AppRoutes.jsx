import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { RoleRoute } from './RoleRoute';
import { ROLES } from '../constants/roles';

// Layouts
import { PublicLayout } from '../layouts/PublicLayout';
import { CitizenLayout } from '../layouts/CitizenLayout';
import { EngineerLayout } from '../layouts/EngineerLayout';
import { AdminLayout } from '../layouts/AdminLayout';

// Public Pages
import { Home } from '../pages/public/Home';
import { About } from '../pages/public/About';
import { Login } from '../pages/public/Login';
import { Register } from '../pages/public/Register';

// Citizen Pages
import { CitizenDashboard } from '../pages/citizen/CitizenDashboard';
import { ReportIssue } from '../pages/citizen/ReportIssue';
import { MyComplaints } from '../pages/citizen/MyComplaints';
import { ComplaintDetails } from '../pages/citizen/ComplaintDetails';
import { CitizenNotices } from '../pages/citizen/CitizenNotices';
import { CitizenNotifications } from '../pages/citizen/CitizenNotifications';

// Engineer Pages
import { EngineerDashboard } from '../pages/engineer/EngineerDashboard';
import { EngineerComplaints } from '../pages/engineer/EngineerComplaints';
import { EngineerComplaintDetails } from '../pages/engineer/EngineerComplaintDetails';
import { ResolveComplaint } from '../pages/engineer/ResolveComplaint';
import { EngineerHistory } from '../pages/engineer/EngineerHistory';
import { EngineerNotifications } from '../pages/engineer/EngineerNotifications';

// Admin Pages
import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { AdminComplaints } from '../pages/admin/AdminComplaints';
import { VerifyComplaint } from '../pages/admin/VerifyComplaint';
import { AssignEngineer } from '../pages/admin/AssignEngineer';
import { AdminMap } from '../pages/admin/AdminMap';
import { AdminNotices } from '../pages/admin/AdminNotices';
import { CreateNotice } from '../pages/admin/CreateNotice';
import { AdminEngineers } from '../pages/admin/AdminEngineers';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        {/* Citizen Routes */}
        <Route element={<RoleRoute allowedRoles={[ROLES.CITIZEN]} />}>
          <Route element={<CitizenLayout />}>
            <Route path="/citizen/dashboard" element={<CitizenDashboard />} />
            <Route path="/citizen/report-issue" element={<ReportIssue />} />
            <Route path="/citizen/complaints" element={<MyComplaints />} />
            <Route path="/citizen/complaints/:id" element={<ComplaintDetails />} />
            <Route path="/citizen/notices" element={<CitizenNotices />} />
            <Route path="/citizen/notifications" element={<CitizenNotifications />} />
          </Route>
        </Route>

        {/* Engineer Routes */}
        <Route element={<RoleRoute allowedRoles={[ROLES.ENGINEER]} />}>
          <Route element={<EngineerLayout />}>
            <Route path="/engineer/dashboard" element={<EngineerDashboard />} />
            <Route path="/engineer/complaints" element={<EngineerComplaints />} />
            <Route path="/engineer/complaints/:id" element={<EngineerComplaintDetails />} />
            <Route path="/engineer/complaints/:id/resolve" element={<ResolveComplaint />} />
            <Route path="/engineer/history" element={<EngineerHistory />} />
            <Route path="/engineer/notifications" element={<EngineerNotifications />} />
          </Route>
        </Route>

        {/* Admin Routes */}
        <Route element={<RoleRoute allowedRoles={[ROLES.ADMIN]} />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/complaints" element={<AdminComplaints />} />
            <Route path="/admin/complaints/:id/verify" element={<VerifyComplaint />} />
            <Route path="/admin/assignments" element={<AdminComplaints />} />
            <Route path="/admin/map" element={<AdminMap />} />
            <Route path="/admin/notices" element={<AdminNotices />} />
            <Route path="/admin/notices/create" element={<CreateNotice />} />
            <Route path="/admin/engineers" element={<AdminEngineers />} />
          </Route>
        </Route>
      </Route>

      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
