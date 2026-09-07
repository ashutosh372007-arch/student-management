'use client';

import React, { useState, useEffect } from 'react';
import { Teacher } from '@/types';
import api from '@/lib/api';

const emptyTeacher = {
  name: '', employeeId: '', subject: '', qualification: '',
  contact: '', email: '', gender: 'Male' as 'Male' | 'Female' | 'Other', address: '',
};

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Teacher | null>(null);
  const [form, setForm] = useState(emptyTeacher);

  useEffect(() => { loadTeachers(); }, []);

  const loadTeachers = async () => {
    try {
      const data = await api.get<Teacher[]>(`/teachers${search ? `?search=${search}` : ''}`);
      setTeachers(data);
    } catch (error) {
      console.error('Error loading teachers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); loadTeachers(); };

  const openAdd = () => { setEditing(null); setForm(emptyTeacher); setShowModal(true); };

  const openEdit = (teacher: Teacher) => {
    setEditing(teacher);
    setForm({
      name: teacher.name, employeeId: teacher.employeeId, subject: teacher.subject,
      qualification: teacher.qualification, contact: teacher.contact, email: teacher.email,
      gender: teacher.gender, address: teacher.address,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/teachers/${editing._id}`, form);
      } else {
        await api.post('/teachers', form);
      }
      setShowModal(false);
      loadTeachers();
    } catch (error: any) {
      alert(error.message || 'Error saving teacher');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this teacher?')) return;
    try {
      await api.delete(`/teachers/${id}`);
      loadTeachers();
    } catch (error: any) {
      alert(error.message || 'Error deleting teacher');
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Teachers</h1>
        <p className="page-subtitle">Manage teacher records and assignments</p>
      </div>

      <div className="table-container">
        <div className="table-header">
          <div className="table-title">All Teachers ({teachers.length})</div>
          <div className="table-actions">
            <form onSubmit={handleSearch} className="search-input">
              <input type="text" className="form-input" placeholder="Search teachers..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </form>
            <button className="btn btn-primary" onClick={openAdd}>+ Add Teacher</button>
          </div>
        </div>

        {loading ? (
          <div className="empty-state"><div style={{ animation: 'pulse 1.5s infinite' }}>Loading...</div></div>
        ) : teachers.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">👨‍🏫</div>
            <div className="empty-state-text">No teachers found</div>
            <div className="empty-state-subtext">Add your first teacher to get started</div>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Employee ID</th>
                <th>Subject</th>
                <th>Qualification</th>
                <th>Monthly Salary</th>
                <th>Contact</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {teachers.map((teacher) => (
                <tr key={teacher._id}>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{teacher.name}</td>
                  <td>{teacher.employeeId}</td>
                  <td><span className="badge badge-info">{teacher.subject}</span></td>
                  <td>{teacher.qualification}</td>
                  <td style={{ fontWeight: 700, color: 'var(--success-light)' }}>
                    ₹{(teacher.salary || 50000).toLocaleString()}
                  </td>
                  <td>{teacher.contact}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => openEdit(teacher)}>✏️</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(teacher._id)}>🗑️</button>
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
              <h2 className="modal-title">{editing ? 'Edit Teacher' : 'Add New Teacher'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Employee ID</label>
                  <input className="form-input" value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value })} required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Subject</label>
                  <input className="form-input" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Qualification</label>
                  <input className="form-input" value={form.qualification} onChange={(e) => setForm({ ...form, qualification: e.target.value })} required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Contact</label>
                  <input className="form-input" value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input type="email" className="form-input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Gender</label>
                  <select className="form-select" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value as any })}>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Address</label>
                  <input className="form-input" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editing ? 'Update' : 'Add'} Teacher</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
