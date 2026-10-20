import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ROLES } from '../../constants/roles';
import {
  LayoutDashboard,
  PlusCircle,
  FileText,
  Bell,
  CheckSquare,
  History,
  MapPin,
  Megaphone
} from 'lucide-react';

export const Sidebar = () => {
  const { role } = useAuth();

  const getNavSections = () => {
    switch (role) {
      case ROLES.CITIZEN:
        return [
          {
            category: 'Main Menu',
            items: [
              { to: '/citizen/dashboard', label: 'Dashboard', icon: LayoutDashboard },
              { to: '/citizen/report-issue', label: 'Report Issue', icon: PlusCircle },
              { to: '/citizen/complaints', label: 'My Complaints', icon: FileText }
            ]
          },
          {
            category: 'Community & Alerts',
            items: [
              { to: '/citizen/notices', label: 'Public Notices', icon: Megaphone },
              { to: '/citizen/notifications', label: 'Notifications', icon: Bell }
            ]
          }
        ];

      case ROLES.ENGINEER:
        return [
          {
            category: 'Workspace',
            items: [
              { to: '/engineer/dashboard', label: 'Dashboard', icon: LayoutDashboard },
              { to: '/engineer/complaints', label: 'Assigned Work', icon: CheckSquare },
              { to: '/engineer/history', label: 'Work History', icon: History }
            ]
          },
          {
            category: 'Communication',
            items: [{ to: '/engineer/notifications', label: 'Notifications', icon: Bell }]
          }
        ];

      case ROLES.ADMIN:
        return [
          {
            category: 'Administration',
            items: [
              { to: '/admin/dashboard', label: 'Operations Hub', icon: LayoutDashboard },
              { to: '/admin/complaints', label: 'Complaints Registry', icon: FileText },
              { to: '/admin/map', label: 'Citywide GIS Map', icon: MapPin }
            ]
          },
          {
            category: 'Public Services',
            items: [{ to: '/admin/notices', label: 'Public Notices', icon: Megaphone }]
          }
        ];

      default:
        return [];
    }
  };

  const sections = getNavSections();

  return (
    <aside className="sidebar">
      <div className="sidebar-nav">
        {sections.map((section, idx) => (
          <div key={idx} className="sidebar-group">
            <div className="sidebar-category">{section.category}</div>
            {section.items.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `sidebar-link ${isActive ? 'active' : ''}`
                  }
                >
                  <Icon size={19} className="sidebar-icon" />
                  <span>{link.label}</span>
                </NavLink>
              );
            })}
          </div>
        ))}
      </div>
    </aside>
  );
};
