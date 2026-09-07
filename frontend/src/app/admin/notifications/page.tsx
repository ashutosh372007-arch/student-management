'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Notification } from '@/types';

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('');

  useEffect(() => {
    loadNotifications();
  }, [user]);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const data = await api.get<Notification[]>('/notifications');
      setNotifications(data);
    } catch (err) {
      console.error('Error loading notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      // Optimistic update
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      await api.put(`/notifications/${id}/read`, {});
    } catch (err) {
      console.error('Error marking notification as read:', err);
      loadNotifications();
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      // Optimistic update
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      await api.put('/notifications/read-all', {});
    } catch (err) {
      console.error('Error marking all as read:', err);
      loadNotifications();
    }
  };

  const getEmojiForType = (type: string) => {
    switch (type) {
      case 'Low Attendance':
        return '⚠️';
      case 'Pending Fee':
        return '💳';
      case 'Assignment':
        return '📚';
      case 'Exam':
        return '📅';
      case 'Result':
        return '📝';
      default:
        return '🔔';
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (!categoryFilter) return true;
    return n.type === categoryFilter;
  });

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Notification Center</h1>
          <p className="page-subtitle">View and manage portal alerts, events, and warnings</p>
        </div>
        {notifications.some((n) => !n.isRead) && (
          <button className="btn btn-secondary" onClick={handleMarkAllAsRead}>
            ✓ Mark All Read
          </button>
        )}
      </div>

      {/* Filter panel */}
      <div className="card" style={{ padding: '16px', marginBottom: '24px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button
          className={`btn ${categoryFilter === '' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          onClick={() => setCategoryFilter('')}
        >
          All Alerts
        </button>
        <button
          className={`btn ${categoryFilter === 'Low Attendance' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          onClick={() => setCategoryFilter('Low Attendance')}
        >
          ⚠️ Attendance
        </button>
        <button
          className={`btn ${categoryFilter === 'Pending Fee' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          onClick={() => setCategoryFilter('Pending Fee')}
        >
          💳 Fees
        </button>
        <button
          className={`btn ${categoryFilter === 'Assignment' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          onClick={() => setCategoryFilter('Assignment')}
        >
          📚 Assignments
        </button>
        <button
          className={`btn ${categoryFilter === 'Exam' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          onClick={() => setCategoryFilter('Exam')}
        >
          📅 Exams
        </button>
        <button
          className={`btn ${categoryFilter === 'Result' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          onClick={() => setCategoryFilter('Result')}
        >
          📝 Results
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '30vh' }}>
          <div style={{ animation: 'pulse 1.5s infinite' }}>Loading alerts...</div>
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔔</div>
          <h4 style={{ color: 'var(--text-primary)', marginBottom: '4px' }}>No Notifications Found</h4>
          <p style={{ fontSize: '13px' }}>You are completely caught up with your notifications.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredNotifications.map((noti) => (
            <div
              key={noti._id}
              onClick={() => !noti.isRead && handleMarkAsRead(noti._id)}
              style={{
                display: 'flex',
                gap: '16px',
                padding: '16px',
                background: noti.isRead ? 'var(--bg-card)' : 'rgba(99, 102, 241, 0.08)',
                border: '1px solid var(--border)',
                borderColor: noti.isRead ? 'var(--border)' : 'var(--primary)',
                borderRadius: 'var(--radius-md)',
                cursor: noti.isRead ? 'default' : 'pointer',
                transition: 'var(--transition-fast)',
                alignItems: 'flex-start',
              }}
            >
              <div style={{ fontSize: '24px', padding: '4px', background: 'var(--bg-glass)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {getEmojiForType(noti.type)}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 600, fontSize: '15px', color: noti.isRead ? 'var(--text-primary)' : 'var(--primary-light)' }}>
                    {noti.title}
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {new Date(noti.createdAt).toLocaleString()}
                  </span>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{noti.message}</p>
                {!noti.isRead && (
                  <span style={{ fontSize: '11px', color: 'var(--primary-light)', fontWeight: 600, marginTop: '8px', display: 'inline-block' }}>
                    ● Mark as read
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
