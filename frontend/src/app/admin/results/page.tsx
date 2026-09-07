'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Result, Student, SubjectMark } from '@/types';
import Link from 'next/link';

export default function ResultsPage() {
  const { user } = useAuth();
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [semesterFilter, setSemesterFilter] = useState('');

  // Add / Edit form state
  const [showModal, setShowModal] = useState(false);
  const [editingResult, setEditingResult] = useState<Result | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedStudentClass, setSelectedStudentClass] = useState('');
  const [semester, setSemester] = useState('Semester 1');
  const [remarks, setRemarks] = useState('');
  
  // Marks input state
  const [subjectMarksInput, setSubjectMarksInput] = useState<Record<string, number>>({});

  useEffect(() => {
    loadResultsData();
    if (user?.role !== 'student') {
      loadStudents();
    }
  }, [user]);

  const loadResultsData = async () => {
    setLoading(true);
    try {
      if (user?.role === 'student') {
        const studentId = user?.studentId;
        if (studentId) {
          const data = await api.get<Result[]>(`/results/student/${studentId}`);
          setResults(data);
        }
      } else {
        // Fetch all results
        const query = semesterFilter ? `?semester=${semesterFilter}` : '';
        const data = await api.get<Result[]>(`/results${query}`);
        setResults(data);
      }
    } catch (err) {
      console.error('Error loading results:', err);
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

  const handleStudentChange = (studentId: string) => {
    setSelectedStudent(studentId);
    const student = students.find((s) => s._id === studentId);
    if (student) {
      setSelectedStudentClass(student.class);
      // Initialize marks inputs to 0
      const subs = getSubjectsForClass(student.class);
      const initialMarks: Record<string, number> = {};
      subs.forEach((sub) => {
        initialMarks[sub] = 0;
      });
      setSubjectMarksInput(initialMarks);
    }
  };

  const getSubjectsForClass = (className: string) => {
    return className === 'Class 10'
      ? ['Mathematics', 'Physics', 'Chemistry', 'English', 'Computer Science']
      : ['Physics', 'Chemistry', 'Mathematics', 'Creative Writing', 'Economics'];
  };

  const handleOpenAdd = () => {
    setEditingResult(null);
    setSelectedStudent('');
    setSelectedStudentClass('');
    setSemester('Semester 1');
    setRemarks('');
    setSubjectMarksInput({});
    setShowModal(true);
  };

  const handleOpenEdit = (res: Result) => {
    setEditingResult(res);
    setSelectedStudent((res.student as any)?._id || res.student);
    setSelectedStudentClass(res.class);
    setSemester(res.semester);
    setRemarks(res.remarks || '');
    
    // Map current marks
    const marks: Record<string, number> = {};
    res.subjectMarks.forEach((sm) => {
      marks[sm.subject] = sm.marksObtained;
    });
    setSubjectMarksInput(marks);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) {
      alert('Please select a student.');
      return;
    }

    const marksPayload: SubjectMark[] = Object.keys(subjectMarksInput).map((sub) => ({
      subject: sub,
      marksObtained: Number(subjectMarksInput[sub]),
      maxMarks: 100,
    }));

    try {
      if (editingResult) {
        await api.put(`/results/${editingResult._id}`, {
          subjectMarks: marksPayload,
          remarks,
        });
      } else {
        await api.post('/results', {
          student: selectedStudent,
          semester,
          subjectMarks: marksPayload,
          remarks,
        });
      }
      setShowModal(false);
      loadResultsData();
    } catch (err: any) {
      alert(err.message || 'Failed to submit result card');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this result record?')) return;
    try {
      await api.delete(`/results/${id}`);
      loadResultsData();
    } catch (err: any) {
      alert(err.message || 'Error deleting result');
    }
  };

  // Filter results by search query in JS
  const filteredResults = results.filter((r) => {
    if (!search) return true;
    const name = (r.student as any)?.name || '';
    const roll = (r.student as any)?.rollNo || '';
    return (
      name.toLowerCase().includes(search.toLowerCase()) ||
      roll.toLowerCase().includes(search.toLowerCase())
    );
  });

  const renderAdminView = () => {
    return (
      <div>
        <div className="table-container">
          <div className="table-header">
            <div className="table-title">Student Semester Marks ({filteredResults.length})</div>
            <div className="table-actions">
              <form onSubmit={(e) => e.preventDefault()} className="search-input">
                <input
                  type="text"
                  className="form-input"
                  placeholder="Search student or roll no..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </form>

              <select
                className="form-input"
                style={{ width: '150px' }}
                value={semesterFilter}
                onChange={(e) => {
                  setSemesterFilter(e.target.value);
                  setLoading(true);
                }}
              >
                <option value="">All Semesters</option>
                <option value="Semester 1">Semester 1</option>
                <option value="Semester 2">Semester 2</option>
              </select>

              <button className="btn btn-primary" onClick={handleOpenAdd}>
                + Enter Marks
              </button>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Roll No</th>
                <th>Course</th>
                <th>Semester</th>
                <th>Percentage</th>
                <th>Final Grade</th>
                <th>SGPA / GPA</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredResults.map((res) => (
                <tr key={res._id}>
                  <td style={{ fontWeight: 600 }}>
                    <Link href={`/admin/students/${(res.student as any)?._id || res.student}`} style={{ color: 'var(--primary-light)', textDecoration: 'none' }}>
                      {(res.student as any)?.name || 'Unknown'}
                    </Link>
                  </td>
                  <td>{(res.student as any)?.rollNo || 'N/A'}</td>
                  <td><span className="badge badge-info">{res.class}</span></td>
                  <td>{res.semester}</td>
                  <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{res.percentage}%</td>
                  <td>
                    <span className={`badge ${res.grade === 'F' ? 'badge-danger' : 'badge-success'}`}>
                      {res.grade}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600 }}>{res.gpa.toFixed(1)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => handleOpenEdit(res)}>✏️</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(res._id)}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredResults.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px' }}>
                    No semester result card records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Enter Marks Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
              <div className="modal-header">
                <h2 className="modal-title">{editingResult ? 'Edit Marks Sheet' : 'Record Student Semester Marks'}</h2>
                <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Student</label>
                    <select
                      className="form-input"
                      style={{ width: '100%', background: 'var(--bg-input)', color: 'var(--text-primary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '12px 16px' }}
                      value={selectedStudent}
                      onChange={(e) => handleStudentChange(e.target.value)}
                      disabled={!!editingResult}
                      required
                    >
                      <option value="">-- Choose Student --</option>
                      {students.map((s) => (
                        <option key={s._id} value={s._id}>
                          {s.name} ({s.rollNo} - {s.class})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Semester</label>
                    <select
                      className="form-input"
                      style={{ width: '100%', background: 'var(--bg-input)', color: 'var(--text-primary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '12px 16px' }}
                      value={semester}
                      onChange={(e) => setSemester(e.target.value)}
                      disabled={!!editingResult}
                      required
                    >
                      <option value="Semester 1">Semester 1</option>
                      <option value="Semester 2">Semester 2</option>
                      <option value="Semester 3">Semester 3</option>
                    </select>
                  </div>
                </div>

                {selectedStudentClass && (
                  <div style={{ marginTop: '20px', padding: '16px', background: 'var(--bg-glass)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                    <h4 style={{ marginBottom: '12px', fontSize: '14px', color: 'var(--primary-light)' }}>
                      Subject Marks (Max 100 per Subject)
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {getSubjectsForClass(selectedStudentClass).map((sub) => (
                        <div key={sub} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{sub}</span>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            className="form-input"
                            style={{ width: '100px', textAlign: 'center' }}
                            value={subjectMarksInput[sub] !== undefined ? subjectMarksInput[sub] : 0}
                            onChange={(e) =>
                              setSubjectMarksInput({
                                ...subjectMarksInput,
                                [sub]: Math.min(100, Math.max(0, Number(e.target.value))),
                              })
                            }
                            required
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="form-group" style={{ marginTop: '16px' }}>
                  <label className="form-label">Teacher Remarks</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Excellent progress"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                  />
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">{editingResult ? 'Update' : 'Submit'} Results</button>
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {results.map((res) => (
          <div key={res._id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>{res.semester} Result Report</h3>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Class: {res.class} | Section: {res.section}</span>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <Link href={`/admin/students/${user?.studentId || 'me'}`} className="btn btn-secondary btn-sm" style={{ padding: '8px 12px' }}>
                  🖨️ Print Detailed Report Card
                </Link>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th>Subject Name</th>
                    <th>Max Marks</th>
                    <th>Marks Scored</th>
                    <th>Grade</th>
                    <th>Standing</th>
                  </tr>
                </thead>
                <tbody>
                  {res.subjectMarks.map((sm, idx) => {
                    const pct = (sm.marksObtained / sm.maxMarks) * 100;
                    let subGrade = 'F';
                    let badgeClass = 'badge-danger';
                    if (pct >= 90) { subGrade = 'A+'; badgeClass = 'badge-success'; }
                    else if (pct >= 80) { subGrade = 'A'; badgeClass = 'badge-success'; }
                    else if (pct >= 70) { subGrade = 'B'; badgeClass = 'badge-success'; }
                    else if (pct >= 60) { subGrade = 'C'; badgeClass = 'badge-info'; }
                    else if (pct >= 50) { subGrade = 'D'; badgeClass = 'badge-warning'; }

                    return (
                      <tr key={idx}>
                        <td style={{ fontWeight: 500 }}>{sm.subject}</td>
                        <td>{sm.maxMarks}</td>
                        <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{sm.marksObtained}</td>
                        <td><span className={`badge ${badgeClass}`}>{subGrade}</span></td>
                        <td>{pct >= 50 ? 'Passed' : 'Needs Improvement'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr 1fr',
                gap: '12px',
                padding: '16px',
                background: 'var(--bg-glass)',
                borderRadius: 'var(--radius-md)',
                marginTop: '8px',
                textAlign: 'center',
              }}
            >
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Total Scored</div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
                  {res.totalMarks} / {res.subjectMarks.length * 100}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Percentage</div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--primary-light)', marginTop: '2px' }}>
                  {res.percentage}%
                </div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>GPA / SGPA</div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--accent-light)', marginTop: '2px' }}>
                  {res.gpa.toFixed(1)} / 10.0
                </div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Overall Grade</div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: res.grade === 'F' ? 'var(--danger-light)' : 'var(--success-light)', marginTop: '2px' }}>
                  Grade {res.grade}
                </div>
              </div>
            </div>

            {res.remarks && (
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', padding: '0 8px' }}>
                <span style={{ fontWeight: 600 }}>Teacher Remarks:</span> {res.remarks}
              </div>
            )}
          </div>
        ))}
        {results.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">📝</div>
            <div className="empty-state-text">No Results Published Yet</div>
            <div className="empty-state-subtext">Your academic results cards are not uploaded to the student portal yet.</div>
          </div>
        )}
      </div>
    );
  };

  useEffect(() => {
    loadResultsData();
  }, [semesterFilter]);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Result Management</h1>
        <p className="page-subtitle">Track academic performance registers and report cards</p>
      </div>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '40vh' }}>
          <div style={{ animation: 'pulse 1.5s infinite' }}>Loading Results...</div>
        </div>
      ) : user?.role === 'student' ? (
        renderStudentView()
      ) : (
        renderAdminView()
      )}
    </div>
  );
}
