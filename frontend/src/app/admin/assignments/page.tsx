'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Assignment, Submission, Student } from '@/types';

export default function AssignmentsPage() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  // Active assignment in teacher's view to see submissions
  const [activeAssignment, setActiveAssignment] = useState<Assignment | null>(null);

  // Modal: Create Assignment
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [className, setClassName] = useState('Class 10');
  const [section, setSection] = useState('A');
  const [subject, setSubject] = useState('Mathematics');
  const [dueDate, setDueDate] = useState('');

  // Modal: Grade Submission
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [activeSubmission, setActiveSubmission] = useState<Submission | null>(null);
  const [score, setScore] = useState('');
  const [grade, setGrade] = useState('A');
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    loadInitialData();
  }, [user]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      if (user?.role === 'student') {
        // Load student assignments/submissions directly
        const studentSubmissions = await api.get<Submission[]>(`/assignments/submissions?studentId=${user?.studentId}`);
        setSubmissions(studentSubmissions);
      } else {
        // Load all assignments
        const list = await api.get<Assignment[]>('/assignments');
        setAssignments(list);
        if (list.length > 0) {
          handleSelectAssignment(list[0]);
        }
      }
    } catch (err) {
      console.error('Error loading assignments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAssignment = async (assignment: Assignment) => {
    setActiveAssignment(assignment);
    try {
      const subs = await api.get<Submission[]>(`/assignments/submissions?assignmentId=${assignment._id}`);
      setSubmissions(subs);
    } catch (err) {
      console.error('Error loading submissions:', err);
    }
  };

  const handleAddAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !dueDate) {
      alert('Please fill out all required fields.');
      return;
    }

    try {
      const newAssign = await api.post<Assignment>('/assignments', {
        title,
        description,
        class: className,
        section,
        subject,
        dueDate,
      });

      setShowAddModal(false);
      setTitle('');
      setDescription('');
      setDueDate('');
      
      // Reload assignments list
      const list = await api.get<Assignment[]>('/assignments');
      setAssignments(list);
      
      // Select the newly created assignment
      const found = list.find((a) => a.title === title) || list[0];
      if (found) {
        handleSelectAssignment(found);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to create assignment');
    }
  };

  const handleOpenGrade = (sub: Submission) => {
    setActiveSubmission(sub);
    setScore(sub.score ? String(sub.score) : '');
    setGrade(sub.grade || 'A');
    setFeedback(sub.feedback || '');
    setShowGradeModal(true);
  };

  const handleGradeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSubmission || !score) {
      alert('Please enter a grade score.');
      return;
    }

    try {
      await api.put(`/assignments/submissions/${activeSubmission._id}/grade`, {
        score: Number(score),
        grade,
        feedback,
      });

      setShowGradeModal(false);
      
      // Reload submissions for active assignment
      if (activeAssignment) {
        handleSelectAssignment(activeAssignment);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to submit grading details');
    }
  };

  const handleStudentSubmit = async (submissionId: string) => {
    if (!confirm('Are you sure you want to submit this assignment?')) return;
    try {
      setLoading(true);
      await api.post(`/assignments/submissions/${submissionId}/submit`, {});
      alert('Assignment submitted successfully!');
      
      // Reload submissions
      const studentSubmissions = await api.get<Submission[]>(`/assignments/submissions?studentId=${user?.studentId}`);
      setSubmissions(studentSubmissions);
    } catch (err: any) {
      alert(err.message || 'Assignment submission failed');
    } finally {
      setLoading(false);
    }
  };

  const renderTeacherView = () => {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2.2fr', gap: '24px', alignItems: 'start' }}>
        {/* Left Column: Assignments list */}
        <div className="card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '8px', borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontWeight: 700, fontSize: '15px' }}>Task Registry</span>
            <button className="btn btn-primary btn-sm" onClick={() => setShowAddModal(true)}>
              + Create
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {assignments.map((a) => (
              <div
                key={a._id}
                onClick={() => handleSelectAssignment(a)}
                style={{
                  padding: '12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)',
                  background: activeAssignment?._id === a._id ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                  cursor: 'pointer',
                  borderColor: activeAssignment?._id === a._id ? 'var(--primary)' : 'var(--border)',
                }}
              >
                <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)' }}>{a.title}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  {a.subject} • {a.class}-{a.section}
                </div>
              </div>
            ))}
            {assignments.length === 0 && (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px', padding: '24px' }}>
                No assignments recorded.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Submissions for active assignment */}
        {activeAssignment ? (
          <div className="card">
            <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '16px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {activeAssignment.title}
                  </h3>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    Subject: {activeAssignment.subject} | Target: {activeAssignment.class}-{activeAssignment.section}
                  </span>
                </div>
                <span className="badge badge-info" style={{ padding: '6px 12px' }}>
                  Due: {new Date(activeAssignment.dueDate).toLocaleDateString()}
                </span>
              </div>
              {activeAssignment.description && (
                <p style={{ marginTop: '12px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                  {activeAssignment.description}
                </p>
              )}
            </div>

            <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px', color: 'var(--text-primary)' }}>
              Submissions Log ({submissions.length})
            </h4>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Roll No</th>
                    <th>Status</th>
                    <th>Submitted At</th>
                    <th>Grading Score</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((sub) => (
                    <tr key={sub._id}>
                      <td style={{ fontWeight: 500 }}>{sub.studentName}</td>
                      <td>{sub.rollNo}</td>
                      <td>
                        <span
                          className={`badge ${
                            sub.status === 'Evaluated'
                              ? 'badge-success'
                              : sub.status === 'Submitted'
                              ? 'badge-info'
                              : sub.status === 'Late'
                              ? 'badge-danger'
                              : 'badge-warning'
                          }`}
                        >
                          {sub.status}
                        </span>
                      </td>
                      <td style={{ fontSize: '12px' }}>
                        {sub.submittedAt ? new Date(sub.submittedAt).toLocaleString() : '—'}
                      </td>
                      <td style={{ fontWeight: 600 }}>
                        {sub.status === 'Evaluated' ? `${sub.score}/100 (${sub.grade})` : '—'}
                      </td>
                      <td>
                        {(sub.status === 'Submitted' || sub.status === 'Late' || sub.status === 'Evaluated') ? (
                          <button className="btn btn-secondary btn-sm" onClick={() => handleOpenGrade(sub)}>
                            ✏️ Grade
                          </button>
                        ) : (
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Pending submit</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px', color: 'var(--text-muted)' }}>
            Select or create an assignment to view student grading registry.
          </div>
        )}

        {/* Modal: Create Assignment */}
        {showAddModal && (
          <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
              <div className="modal-header">
                <h2 className="modal-title">Create Class Assignment</h2>
                <button className="modal-close" onClick={() => setShowAddModal(false)}>×</button>
              </div>
              <form onSubmit={handleAddAssignment}>
                <div className="form-group">
                  <label className="form-label">Assignment Title</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Vectors Exercise 1"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Description / Instructions</label>
                  <textarea
                    className="form-input"
                    rows={3}
                    placeholder="Write detailed student tasks..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    style={{ resize: 'vertical', fontFamily: 'inherit' }}
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Class</label>
                    <select
                      className="form-input"
                      style={{ width: '100%', background: 'var(--bg-input)', color: 'var(--text-primary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '12px 16px' }}
                      value={className}
                      onChange={(e) => setClassName(e.target.value)}
                    >
                      <option value="Class 10">Class 10</option>
                      <option value="Class 11">Class 11</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Section</label>
                    <input
                      type="text"
                      className="form-input"
                      value={section}
                      onChange={(e) => setSection(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Subject</label>
                    <input
                      type="text"
                      className="form-input"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Due Date & Time</label>
                    <input
                      type="datetime-local"
                      className="form-input"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Publish Task</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Grade Submission */}
        {showGradeModal && activeSubmission && (
          <div className="modal-overlay" onClick={() => setShowGradeModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '450px' }}>
              <div className="modal-header">
                <h2 className="modal-title">Evaluate Submission</h2>
                <button className="modal-close" onClick={() => setShowGradeModal(false)}>×</button>
              </div>
              <form onSubmit={handleGradeSubmit}>
                <div style={{ marginBottom: '16px', fontSize: '13px' }}>
                  <div style={{ color: 'var(--text-muted)' }}>Student Name</div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
                    {activeSubmission.studentName} ({activeSubmission.rollNo})
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Score (Out of 100)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      className="form-input"
                      value={score}
                      onChange={(e) => setScore(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Letter Grade</label>
                    <select
                      className="form-input"
                      style={{ width: '100%', background: 'var(--bg-input)', color: 'var(--text-primary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '12px 16px' }}
                      value={grade}
                      onChange={(e) => setGrade(e.target.value)}
                    >
                      <option value="A+">A+</option>
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="C">C</option>
                      <option value="D">D</option>
                      <option value="F">F</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Teacher Feedback Remarks</label>
                  <textarea
                    className="form-input"
                    rows={3}
                    placeholder="Enter submission feedback..."
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    style={{ resize: 'none', fontFamily: 'inherit' }}
                  />
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowGradeModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Submit Grade</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderStudentView = () => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {submissions.map((sub: any) => (
          <div key={sub._id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {sub.assignment?.title || 'Assignment Task'}
                </h3>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Subject: {sub.assignment?.subject} | Teacher: {sub.assignment?.teacher || 'N/A'}
                </span>
              </div>
              <span className={`badge ${sub.status === 'Evaluated' ? 'badge-success' : sub.status === 'Submitted' ? 'badge-info' : sub.status === 'Late' ? 'badge-danger' : 'badge-warning'}`}>
                {sub.status}
              </span>
            </div>

            {sub.assignment?.description && (
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                {sub.assignment.description}
              </p>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', background: 'var(--bg-glass)', borderRadius: 'var(--radius-sm)', padding: '12px' }}>
              <span style={{ color: 'var(--text-muted)' }}>
                🚨 Due Date: {sub.assignment?.dueDate ? new Date(sub.assignment.dueDate).toLocaleString() : 'N/A'}
              </span>
              {sub.submittedAt && (
                <span style={{ color: 'var(--text-secondary)' }}>
                  📤 Submitted: {new Date(sub.submittedAt).toLocaleString()}
                </span>
              )}
            </div>

            {/* Grading feedback section */}
            {sub.status === 'Evaluated' && (
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
                <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--primary-light)', marginBottom: '6px' }}>
                  📝 Grade Evaluation Feedback
                </div>
                <div style={{ display: 'flex', gap: '20px', marginBottom: '8px' }}>
                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Score</span>
                    <div style={{ fontWeight: 800, fontSize: '18px', color: 'var(--text-primary)', marginTop: '2px' }}>
                      {sub.score} / 100
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Letter Grade</span>
                    <div style={{ fontWeight: 800, fontSize: '18px', color: 'var(--success-light)', marginTop: '2px' }}>
                      {sub.grade}
                    </div>
                  </div>
                </div>
                {sub.feedback && (
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', background: 'var(--bg-glass)', borderRadius: 'var(--radius-sm)', padding: '8px 12px' }}>
                    &quot;{sub.feedback}&quot;
                  </p>
                )}
              </div>
            )}

            {/* Submit Action */}
            {sub.status === 'Pending' && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
                <button className="btn btn-primary" onClick={() => handleStudentSubmit(sub._id)}>
                  📤 Submit Assignment (Simulator)
                </button>
              </div>
            )}
          </div>
        ))}
        {submissions.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">📚</div>
            <div className="empty-state-text">No Assignments Assigned</div>
            <div className="empty-state-subtext">You have no pending or graded assignments for your course.</div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Assignment Tracker</h1>
        <p className="page-subtitle">Manage class assignments, grading records, and tasks</p>
      </div>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '40vh' }}>
          <div style={{ animation: 'pulse 1.5s infinite' }}>Loading Tasks...</div>
        </div>
      ) : user?.role === 'student' ? (
        renderStudentView()
      ) : (
        renderTeacherView()
      )}
    </div>
  );
}
