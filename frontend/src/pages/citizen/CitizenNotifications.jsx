import React, { useEffect, useState } from 'react';
import { notificationService } from '../../services/notificationService';
import { Loading } from '../../components/common/Loading';
import { ErrorState } from '../../components/common/ErrorState';
import { EmptyState } from '../../components/common/EmptyState';
import { formatTimeAgo } from '../../utils/formatDate';
import { Bell, Check } from 'lucide-react';

export const CitizenNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await notificationService.getNotifications();
      setNotifications(data || []);
    } catch (err) {
      setError('Failed to fetch notifications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => ((n._id || n.id) === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  if (loading) return <Loading message="Loading notifications..." />;
  if (error) return <ErrorState message={error} onRetry={fetchNotifications} />;

  return (
    <div className="page-container">
      <h1 className="page-title">Notifications</h1>
      <p className="page-subtitle">Real-time updates regarding your reports and public alerts.</p>

      {notifications.length === 0 ? (
        <EmptyState icon={Bell} title="No notifications" message="You're all caught up!" />
      ) : (
        <div className="notifications-list card">
          {notifications.map((item) => {
            const id = item._id || item.id;
            return (
              <div key={id} className={`notification-item ${item.isRead ? 'read' : 'unread'}`}>
                <div className="notification-icon">
                  <Bell size={18} />
                </div>
                <div className="notification-content">
                  <h4 className="notification-title">{item.title}</h4>
                  <p className="notification-message">{item.message}</p>
                  <span className="notification-time">{formatTimeAgo(item.createdAt)}</span>
                </div>
                {!item.isRead && (
                  <button
                    onClick={() => handleMarkRead(id)}
                    className="btn-mark-read"
                    title="Mark as read"
                  >
                    <Check size={16} /> Mark read
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
