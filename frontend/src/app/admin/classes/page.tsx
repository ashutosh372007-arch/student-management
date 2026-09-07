'use client';

import React, { useState, useEffect } from 'react';
import { Class } from '@/types';
import api from '@/lib/api';

const emptyClass = { name: '', section: '', classTeacher: '', studentCount: 0 };

export default function ClassesPage() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Class | null>(null);
  const [form, setForm] = useState(emptyClass);

  useEffect(() => { loadClasses(); }, []);

  const loadClasses = async () => {
    try {
      const data = await api.get<Class[]>('/classes');
      setClasses(data);
    } catch (error) {
      console.error('Error loading classes:', error);
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => { setEditing(null); setForm(emptyClass); setShowModal(true); };

  const openEdit = (cls: Class) => {
    setEditing(cls);
    setForm({ name: cls.name, section: cls.section, classTeacher: cls.classTeacher, studentCount: cls.studentCount });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/classes/${editing._id}`, form);
      } else {
        await api.post('/classes', form);
      }
      setShowModal(false);
      loadClasses();
    } catch (error: any) {
      alert(error.message || 'Error saving class');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this class?')) return;
    try {
      await api.delete(`/classes/${id}`);
      loadClasses();
    } catch (error: any) {
      alert(error.message || 'Error deleting class');
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Classes</h1>
        <p className="page-subtitle">Manage class sections and assignments</p>
      </div>

      <div className="table-container">
        <div className="table-header">
          <div className="table-title">All Classes ({classes.length})</div>
          <button className="btn btn-primary" onClick={openAdd}>+ Add Class</button>
        </div>

        {loading ? (
          <div className="empty-state"><div style={{ animation: 'pulse 1.5s infinite' }}>Loading...</div></div>
        ) : classes.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🏫</div>
            <div className="empty-state-text">No classes found</div>
            <div className="empty-state-subtext">Add your first class to get started</div>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Class Name</th>
                <th>Section</th>
                <th>Class Teacher</th>
                <th>Students</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {classes.map((cls) => (
                <tr key={cls._id}>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{cls.name}</td>
                  <td><span className="badge badge-info">{cls.section}</span></td>
                  <td>{cls.classTeacher}</td>
                  <td>{cls.studentCount}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => openEdit(cls)}>✏️</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(cls._id)}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{editing ? 'Edit Class' : 'Add New Class'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Class Name</label>
                  <input className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="e.g. Class 10" />
                </div>
                <div className="form-group">
                  <label className="form-label">Section</label>
                  <input className="form-input" value={form.section} onChange={(e) => setForm({ ...form, section: e.target.value })} required placeholder="e.g. A" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Class Teacher</label>
                  <input className="form-input" value={form.classTeacher} onChange={(e) => setForm({ ...form, classTeacher: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Student Count</label>
                  <input type="number" className="form-input" value={form.studentCount} onChange={(e) => setForm({ ...form, studentCount: parseInt(e.target.value) || 0 })} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editing ? 'Update' : 'Add'} Class</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
