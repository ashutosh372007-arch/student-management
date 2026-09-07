'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Certificate, Student } from '@/types';

const emptyCertificateForm = {
  studentId: '',
  course: '',
  achievement: '',
  collegeName: 'Excel Campus Academy',
};

export default function CertificatesPage() {
  const { user } = useAuth();
  const canGenerate = user?.role === 'admin' || user?.role === 'teacher';

  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyCertificateForm);
  const [submitting, setSubmitting] = useState(false);

  // Selected certificate for preview modal
  const [previewCert, setPreviewCert] = useState<Certificate | null>(null);

  useEffect(() => {
    loadCertificates();
    if (canGenerate) {
      loadStudents();
    }
  }, [user]);

  const loadCertificates = async () => {
    setLoading(true);
    try {
      const data = await api.get<Certificate[]>('/certificates');
      setCertificates(data);
    } catch (err) {
      console.error('Error loading certificates:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadStudents = async () => {
    try {
      const data = await api.get<Student[]>('/students');
      setStudents(data);
    } catch (err) {
      console.error('Error loading students list:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.studentId) {
      alert('Please select a student');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/certificates', form);
      setShowModal(false);
      setForm(emptyCertificateForm);
      loadCertificates();
    } catch (err: any) {
      alert(err.message || 'Error generating certificate');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      {/* Print Stylesheet Overrides for standalone certificate print */}
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          .sidebar, .page-header, .no-print, button, .btn {
            display: none !important;
          }
          .main-content {
            margin-left: 0 !important;
            padding: 0 !important;
          }
        }
      `}</style>

      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Campus Certificates & Achievements</h1>
          <p className="page-subtitle">
            {canGenerate
              ? 'Generate and manage official student academic achievements and event certificates'
              : 'Official certificate verification registry for your academic records'}
          </p>
        </div>
        {canGenerate && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            + Generate Certificate
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '40vh' }}>
          <div style={{ animation: 'pulse 1.5s infinite', fontSize: '16px' }}>Loading certificates...</div>
        </div>
      ) : certificates.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📜</div>
          <div className="empty-state-text">No certificates found</div>
          <div className="empty-state-subtext">Generated accomplishments will appear here.</div>
        </div>
      ) : (
        <div className="table-container">
          <div className="table-header">
            <div className="table-title">Issued Achievements ({certificates.length})</div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Certificate ID</th>
                <th>Student Name</th>
                <th>Course / Event</th>
                <th>Achievement Category</th>
                <th>Date Issued</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {certificates.map((cert) => (
                <tr key={cert._id}>
                  <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{cert.certificateId}</td>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{cert.studentName}</td>
                  <td>{cert.course}</td>
                  <td><span className="badge badge-info">{cert.achievement}</span></td>
                  <td>{new Date(cert.date || cert.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button className="btn btn-secondary btn-sm" onClick={() => setPreviewCert(cert)}>
                      🔍 View & Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal 1: Generate Certificate (Admin/Teacher only) */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '550px' }}>
            <div className="modal-header">
              <h2 className="modal-title">Generate Official Student Certificate</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Select Student</label>
                <select
                  className="form-select"
                  value={form.studentId}
                  onChange={(e) => setForm({ ...form, studentId: e.target.value })}
                  required
                >
                  <option value="">-- Choose Student --</option>
                  {students.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name} ({s.rollNo}) - {s.class}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Course / Event Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Advanced Java Web Development Course"
                  value={form.course}
                  onChange={(e) => setForm({ ...form, course: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Recognition Achievement</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Outstanding Performance, Successful Completion, First Rank"
                  value={form.achievement}
                  onChange={(e) => setForm({ ...form, achievement: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Issuing College Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={form.collegeName}
                  onChange={(e) => setForm({ ...form, collegeName: e.target.value })}
                  required
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Generating...' : 'Issue Certificate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Certificate Document Viewer */}
      {previewCert && (
        <div className="modal-overlay" onClick={() => setPreviewCert(null)} style={{ zIndex: 1100 }}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '850px', background: 'white', padding: '30px' }}>
            <div className="modal-header no-print">
              <h2 className="modal-title" style={{ color: '#1e293b' }}>Official Certificate Document</h2>
              <button className="modal-close" style={{ color: '#1e293b' }} onClick={() => setPreviewCert(null)}>×</button>
            </div>
            
            <div className="certificate-preview-container">
              <div className="certificate-card">
                <div className="certificate-border-accent"></div>
                
                <div>
                  <div className="certificate-header">{previewCert.collegeName}</div>
                  <div className="certificate-subheader">Certificate of Achievement</div>
                </div>

                <div className="certificate-text-present">This is proudly presented to</div>
                <div className="certificate-name">{previewCert.studentName}</div>
                
                <div className="certificate-achievement">
                  For outstanding accomplishment and successful participation in <span style={{ fontWeight: 'bold' }}>{previewCert.course}</span>, specifically recognized for <span style={{ fontWeight: 'bold', color: '#b45309' }}>{previewCert.achievement}</span>.
                </div>

                <div className="certificate-footer">
                  <div className="certificate-sig">
                    <span className="certificate-sig-img">Dr. J. Arnold</span>
                    <span>Dean of Academics</span>
                  </div>
                  <div className="certificate-seal">
                    Official Seal
                  </div>
                  <div className="certificate-sig">
                    <span className="certificate-sig-img">{previewCert.generatedBy}</span>
                    <span>Authorized Signature</span>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', fontSize: '11px', color: '#94a3b8', fontFamily: 'monospace' }}>
                  <span>Issue Date: {new Date(previewCert.date || previewCert.createdAt).toLocaleDateString()}</span>
                  <span>ID: {previewCert.certificateId}</span>
                </div>

              </div>
            </div>

            <div className="modal-footer no-print" style={{ borderTop: '1px solid #e2e8f0', marginTop: '20px', paddingTop: '15px' }}>
              <button className="btn btn-secondary" style={{ color: '#1e293b', border: '1px solid #cbd5e1' }} onClick={() => setPreviewCert(null)}>Close</button>
              <button className="btn btn-primary" onClick={() => window.print()}>🖨️ Print / Download PDF</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
