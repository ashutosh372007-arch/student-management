'use client';

import React, { useState, useEffect } from 'react';
import { Student } from '@/types';
import api from '@/lib/api';
import Link from 'next/link';

const emptyStudent = {
  name: '', rollNo: '', class: '', section: '', gender: 'Male' as 'Male' | 'Female' | 'Other',
  dateOfBirth: '', contact: '', parentName: '', parentContact: '',
  address: '', email: '',
};

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Student | null>(null);
  const [form, setForm] = useState(emptyStudent);

  useEffect(() => { loadStudents(); }, []);

  const loadStudents = async () => {
    try {
      const data = await api.get<Student[]>(`/students${search ? `?search=${search}` : ''}`);
      setStudents(data);
    } catch (error) {
      console.error('Error loading students:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadStudents();
  };

  const openAdd = () => {
    setEditing(null);
    setForm(emptyStudent);
    setShowModal(true);
  };

  const openEdit = (student: Student) => {
    setEditing(student);
    setForm({
      name: student.name, rollNo: student.rollNo, class: student.class,
      section: student.section, gender: student.gender, dateOfBirth: student.dateOfBirth?.split('T')[0] || '',
      contact: student.contact, parentName: student.parentName, parentContact: student.parentContact,
      address: student.address, email: student.email,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/students/${editing._id}`, form);
      } else {
        await api.post('/students', form);
      }
      setShowModal(false);
      loadStudents();
    } catch (error: any) {
      alert(error.message || 'Error saving student');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this student?')) return;
    try {
      await api.delete(`/students/${id}`);
      loadStudents();
    } catch (error: any) {
      alert(error.message || 'Error deleting student');
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Students</h1>
        <p className="page-subtitle">Manage student records and information</p>
      </div>

      <div className="table-container">
        <div className="table-header">
          <div className="table-title">All Students ({students.length})</div>
          <div className="table-actions">
            <form onSubmit={handleSearch} className="search-input">
              <input
                type="text"
                className="form-input"
                placeholder="Search students..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </form>
            <button className="btn btn-primary" onClick={openAdd}>+ Add Student</button>
          </div>
        </div>

        {loading ? (
          <div className="empty-state"><div style={{ animation: 'pulse 1.5s infinite' }}>Loading...</div></div>
        ) : students.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🎓</div>
            <div className="empty-state-text">No students found</div>
            <div className="empty-state-subtext">Add your first student to get started</div>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Roll No</th>
                <th>Class</th>
                <th>Section</th>
                <th>Gender</th>
                <th>Contact</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student._id}>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                    <Link href={`/admin/students/${student._id}`} style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-primary)', textDecoration: 'none' }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '14px',
                        fontWeight: 700,
                        boxShadow: 'var(--shadow-sm)'
                      }}>
                        {student.name.charAt(0)}
                      </div>
                      <span style={{ color: 'var(--primary-light)' }}>{student.name}</span>
                    </Link>
                  </td>
                  <td>{student.rollNo}</td>
                  <td><span className="badge badge-info">{student.class}</span></td>
                  <td>{student.section}</td>
                  <td>{student.gender}</td>
                  <td>{student.contact}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => openEdit(student)}>✏️</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(student._id)}>🗑️</button>
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
              <h2 className="modal-title">{editing ? 'Edit Student' : 'Add New Student'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Roll Number</label>
                  <input className="form-input" value={form.rollNo} onChange={(e) => setForm({ ...form, rollNo: e.target.value })} required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Class</label>
                  <input className="form-input" value={form.class} onChange={(e) => setForm({ ...form, class: e.target.value })} required placeholder="e.g. 10" />
                </div>
                <div className="form-group">
                  <label className="form-label">Section</label>
                  <input className="form-input" value={form.section} onChange={(e) => setForm({ ...form, section: e.target.value })} required placeholder="e.g. A" />
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
                  <label className="form-label">Date of Birth</label>
                  <input type="date" className="form-input" value={form.dateOfBirth} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} required />
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
                  <label className="form-label">Parent Name</label>
                  <input className="form-input" value={form.parentName} onChange={(e) => setForm({ ...form, parentName: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Parent Contact</label>
                  <input className="form-input" value={form.parentContact} onChange={(e) => setForm({ ...form, parentContact: e.target.value })} required />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Address</label>
                <input className="form-input" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editing ? 'Update' : 'Add'} Student</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
