'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Notice } from '@/types';

const emptyNotice = {
  title: '',
  content: '',
  category: 'General' as 'Exam' | 'Assignment' | 'Event' | 'Holiday' | 'Placement' | 'General',
  isImportant: false,
};

export default function NoticesPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Notice | null>(null);
  const [form, setForm] = useState(emptyNotice);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadNotices();
  }, []);

  const loadNotices = async () => {
    setLoading(true);
    try {
      const data = await api.get<Notice[]>('/notices');
      setNotices(data);
    } catch (err) {
      console.error('Error loading notices:', err);
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setEditing(null);
    setForm(emptyNotice);
    setShowModal(true);
  };

  const openEdit = (notice: Notice) => {
    setEditing(notice);
    setForm({
      title: notice.title,
      content: notice.content,
      category: notice.category,
      isImportant: notice.isImportant,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editing) {
        await api.put(`/notices/${editing._id}`, form);
      } else {
        await api.post('/notices', form);
      }
      setShowModal(false);
      loadNotices();
    } catch (err: any) {
      alert(err.message || 'Error saving notice');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this notice?')) return;
    try {
      await api.delete(`/notices/${id}`);
      loadNotices();
    } catch (err: any) {
      alert(err.message || 'Error deleting notice');
    }
  };

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Campus Announcements</h1>
          <p className="page-subtitle">Broadcasting news, placements, examinations, and events</p>
        </div>
        {isAdmin && (
          <button className="btn btn-primary" onClick={openAdd}>
            + Publish Announcement
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '40vh' }}>
          <div style={{ animation: 'pulse 1.5s infinite', fontSize: '16px' }}>Loading notices...</div>
        </div>
      ) : notices.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📢</div>
          <div className="empty-state-text">No announcements published</div>
          <div className="empty-state-subtext">Announcements will appear here once published by the administration.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {notices.map((notice) => (
            <div
              key={notice._id}
              className="card"
              style={{
                position: 'relative',
                borderLeft: notice.isImportant ? '5px solid var(--warning)' : '5px solid var(--primary)',
                background: 'var(--bg-secondary)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className={`badge ${notice.isImportant ? 'badge-warning' : 'badge-info'}`} style={{ fontSize: '11px' }}>
                    {notice.category}
                  </span>
                  {notice.isImportant && (
                    <span style={{ fontSize: '11px', color: 'var(--warning-light)', fontWeight: 600 }}>
                      ⚠️ Urgent Broadcast
                    </span>
                  )}
                </div>
                {isAdmin && (
                  <div style={{ display: 'flex', gap: '6px' }} className="no-print">
                    <button className="btn btn-secondary btn-sm" onClick={() => openEdit(notice)}>✏️</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(notice._id)}>🗑️</button>
                  </div>
                )}
              </div>

              <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '10px' }}>
                {notice.title}
              </h2>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '16px', whiteSpace: 'pre-wrap' }}>
                {notice.content}
              </p>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '10px', fontSize: '12px', color: 'var(--text-muted)' }}>
                <span>Published by: <strong>{notice.createdBy}</strong></span>
                <span>Date: {new Date(notice.date || notice.createdAt).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for Add / Edit Notice */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '550px' }}>
            <div className="modal-header">
              <h2 className="modal-title">{editing ? 'Modify Announcement' : 'Publish New Announcement'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Announcement Title</label>
                <input
                  className="form-input"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. End Semester Exam Timetable"
                  required
                />
              </div>

              <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    className="form-select"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value as any })}
                  >
                    <option value="General">General</option>
                    <option value="Exam">Exam</option>
                    <option value="Assignment">Assignment</option>
                    <option value="Event">Event</option>
                    <option value="Holiday">Holiday</option>
                    <option value="Placement">Placement</option>
                  </select>
                </div>
                <div className="form-group" style={{ display: 'flex', alignItems: 'center', height: '100%', paddingTop: '32px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
                    <input
                      type="checkbox"
                      checked={form.isImportant}
                      onChange={(e) => setForm({ ...form, isImportant: e.target.checked })}
                    />
                    Mark as Important (Pin & Highlight)
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Details / Content</label>
                <textarea
                  className="form-input"
                  style={{ minHeight: '150px', fontFamily: 'inherit', resize: 'vertical', padding: '12px' }}
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  placeholder="Write the full announcement contents here..."
                  required
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Publishing...' : editing ? 'Update Broadcast' : 'Publish Broadcast'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
