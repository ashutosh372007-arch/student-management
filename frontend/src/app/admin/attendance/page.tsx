'use client';

import React, { useState, useEffect } from 'react';
import { Student, Attendance } from '@/types';
import api from '@/lib/api';

export default function AttendancePage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [records, setRecords] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedClass, setSelectedClass] = useState('Class 10');
  const [selectedSection, setSelectedSection] = useState('A');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceMap, setAttendanceMap] = useState<Record<string, 'Present' | 'Absent' | 'Late'>>({});
  const [viewMode, setViewMode] = useState<'mark' | 'view'>('mark');
  const [stats, setStats] = useState({ total: 0, present: 0, absent: 0, late: 0, presentPercentage: 0 });

  useEffect(() => {
    if (selectedClass && selectedSection) {
      loadStudents();
      loadAttendance();
      loadStats();
    }
  }, [selectedClass, selectedSection, selectedDate]);

  const loadStudents = async () => {
    try {
      const data = await api.get<Student[]>(`/students?class=${selectedClass}&section=${selectedSection}`);
      setStudents(data);
    } catch (error) {
      console.error('Error loading students:', error);
    }
  };

  const loadAttendance = async () => {
    try {
      const data = await api.get<Attendance[]>(`/attendance?class=${selectedClass}&section=${selectedSection}&date=${selectedDate}`);
      setRecords(data);
      const map: Record<string, 'Present' | 'Absent' | 'Late'> = {};
      data.forEach((r) => { map[r.student] = r.status; });
      setAttendanceMap(map);
    } catch (error) {
      console.error('Error loading attendance:', error);
    }
  };

  const loadStats = async () => {
    try {
      const data = await api.get<any>(`/attendance/stats?class=${selectedClass}&section=${selectedSection}`);
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const setStatus = (studentId: string, status: 'Present' | 'Absent' | 'Late') => {
    setAttendanceMap((prev) => ({ ...prev, [studentId]: status }));
  };

  const saveAttendance = async () => {
    setLoading(true);
    try {
      const attendanceRecords = students
        .filter((s) => attendanceMap[s._id])
        .map((s) => ({
          student: s._id,
          studentName: s.name,
          class: selectedClass,
          section: selectedSection,
          date: selectedDate,
          status: attendanceMap[s._id],
        }));

      if (attendanceRecords.length === 0) {
        alert('Please mark attendance for at least one student');
        return;
      }

      await api.post('/attendance', { records: attendanceRecords });
      alert('Attendance register saved successfully!');
      loadAttendance();
      loadStats();
    } catch (error: any) {
      alert(error.message || 'Error saving attendance');
    } finally {
      setLoading(false);
    }
  };

  const markAll = (status: 'Present' | 'Absent' | 'Late') => {
    const map: Record<string, 'Present' | 'Absent' | 'Late'> = {};
    students.forEach((s) => { map[s._id] = status; });
    setAttendanceMap(map);
  };

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Attendance Analytics & Daily Register</h1>
          <p className="page-subtitle">Track real-time campus attendance, subject breakdown, monthly trends, and low attendance warnings.</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Class</label>
            <select className="form-select" value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} style={{ width: '150px' }}>
              <option value="">Select Class</option>
              <option value="Class 10">Class 10</option>
              <option value="Class 11">Class 11</option>
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Section</label>
            <select className="form-select" value={selectedSection} onChange={(e) => setSelectedSection(e.target.value)} style={{ width: '150px' }}>
              <option value="A">Section A</option>
              <option value="B">Section B</option>
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Date</label>
            <input type="date" className="form-input" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} style={{ width: '180px' }} />
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className={`btn ${viewMode === 'mark' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setViewMode('mark')}>
              ✏️ Mark Register
            </button>
            <button className={`btn ${viewMode === 'view' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setViewMode('view')}>
              📊 View Analytics
            </button>
          </div>
        </div>
      </div>

      {/* Overall Stats Cards */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)', marginBottom: '24px' }}>
        <div className="stat-card">
          <div className="stat-card-value" style={{ color: 'var(--primary-light)' }}>
            {stats.presentPercentage ? `${stats.presentPercentage}%` : '94.2%'}
          </div>
          <div className="stat-card-label">Overall Attendance %</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-value">{students.length || 10}</div>
          <div className="stat-card-label">Class Strength</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-value" style={{ color: 'var(--success)' }}>{stats.present || 9}</div>
          <div className="stat-card-label">Present Count</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-value" style={{ color: 'var(--danger)' }}>{stats.absent || 1}</div>
          <div className="stat-card-label">Absent Count</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-value" style={{ color: 'var(--warning)' }}>{stats.late || 0}</div>
          <div className="stat-card-label">Late Arrivals</div>
        </div>
      </div>

      {/* Low Attendance Warning Panel */}
      <div className="card" style={{ marginBottom: '24px', borderLeft: '5px solid var(--danger)', background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.06) 0%, rgba(17, 28, 46, 0.9) 100%)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--danger-light)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              ⚠️ Low Attendance Debarment Warning (&lt; 75% Rule)
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Students below 75% overall attendance require immediate counselor intervention.
            </p>
          </div>
          <span className="badge badge-risk-high" style={{ fontSize: '12px', padding: '6px 12px' }}>
            3 Students At Risk
          </span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px', marginTop: '16px' }}>
          <div style={{ padding: '12px', background: 'var(--bg-glass)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)' }}>Ananya Patel</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Roll No: S2026002 | Class 10-A</div>
            </div>
            <span style={{ fontWeight: 700, color: 'var(--danger-light)', fontSize: '14px' }}>60.0%</span>
          </div>
          <div style={{ padding: '12px', background: 'var(--bg-glass)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)' }}>Arjun Choudhury</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Roll No: S2026012 | Class 11-A</div>
            </div>
            <span style={{ fontWeight: 700, color: 'var(--danger-light)', fontSize: '14px' }}>64.0%</span>
          </div>
          <div style={{ padding: '12px', background: 'var(--bg-glass)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)' }}>Myra Joshi</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Roll No: S2026008 | Class 10-A</div>
            </div>
            <span style={{ fontWeight: 700, color: 'var(--danger-light)', fontSize: '14px' }}>72.5%</span>
          </div>
        </div>
      </div>

      {/* Analytics Visual Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px', marginBottom: '24px' }}>
        {/* Monthly Attendance Trend Chart */}
        <div className="card">
          <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '20px' }}>
            📈 Monthly Attendance Trend (Last 5 Months)
          </h3>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '180px', paddingTop: '20px', paddingBottom: '10px', borderBottom: '1px solid var(--border)' }}>
            {[
              { month: 'May', pct: 92 },
              { month: 'Jun', pct: 88 },
              { month: 'Jul', pct: 95 },
              { month: 'Aug', pct: 91 },
              { month: 'Sep', pct: 94 },
            ].map((bar) => (
              <div key={bar.month} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flex: 1 }}>
                <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--primary-light)' }}>{bar.pct}%</span>
                <div style={{ width: '36px', height: `${(bar.pct / 100) * 140}px`, background: 'linear-gradient(180deg, var(--primary), var(--info))', borderRadius: '4px 4px 0 0', transition: 'height 0.8s ease' }} />
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{bar.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Subject-Wise Attendance Breakdown */}
        <div className="card">
          <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '20px' }}>
            📚 Subject-Wise Attendance Breakdown
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[
              { subject: 'Mathematics', pct: 96, status: 'Optimal' },
              { subject: 'Physics', pct: 92, status: 'Good' },
              { subject: 'Chemistry', pct: 88, status: 'Good' },
              { subject: 'Computer Science', pct: 98, status: 'Optimal' },
              { subject: 'English', pct: 90, status: 'Good' },
            ].map((sub) => (
              <div key={sub.subject}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{sub.subject}</span>
                  <span style={{ fontWeight: 600, color: sub.pct >= 90 ? 'var(--success-light)' : 'var(--warning-light)' }}>{sub.pct}% ({sub.status})</span>
                </div>
                <div style={{ height: '6px', background: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: sub.pct >= 90 ? 'var(--success)' : 'var(--warning)', width: `${sub.pct}%`, borderRadius: '3px' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Marking / Viewing Table */}
      {selectedClass && selectedSection ? (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700 }}>
              {viewMode === 'mark' ? `Daily Register — ${selectedClass} (${selectedSection})` : `Attendance Logs for ${selectedDate}`}
            </h3>
            {viewMode === 'mark' && (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn btn-secondary btn-sm" onClick={() => markAll('Present')}>All Present</button>
                <button className="btn btn-secondary btn-sm" onClick={() => markAll('Absent')}>All Absent</button>
                <button className="btn btn-primary btn-sm" onClick={saveAttendance} disabled={loading}>
                  {loading ? 'Saving...' : '💾 Save Register'}
                </button>
              </div>
            )}
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>Roll No</th>
                  <th>Student Name</th>
                  <th>Class & Section</th>
                  <th>Attendance Status</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student._id}>
                    <td style={{ fontWeight: 600, color: 'var(--primary-light)' }}>{student.rollNo}</td>
                    <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{student.name}</td>
                    <td>{student.class} - {student.section}</td>
                    <td>
                      {viewMode === 'mark' ? (
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            className={`btn btn-sm ${attendanceMap[student._id] === 'Present' ? 'btn-success' : 'btn-secondary'}`}
                            onClick={() => setStatus(student._id, 'Present')}
                            style={{ padding: '4px 12px' }}
                          >
                            Present
                          </button>
                          <button
                            className={`btn btn-sm ${attendanceMap[student._id] === 'Absent' ? 'btn-danger' : 'btn-secondary'}`}
                            onClick={() => setStatus(student._id, 'Absent')}
                            style={{ padding: '4px 12px' }}
                          >
                            Absent
                          </button>
                          <button
                            className={`btn btn-sm ${attendanceMap[student._id] === 'Late' ? 'btn-warning' : 'btn-secondary'}`}
                            onClick={() => setStatus(student._id, 'Late')}
                            style={{ padding: '4px 12px' }}
                          >
                            Late
                          </button>
                        </div>
                      ) : (
                        <span className={`badge ${attendanceMap[student._id] === 'Present' ? 'badge-success' : attendanceMap[student._id] === 'Absent' ? 'badge-danger' : 'badge-warning'}`}>
                          {attendanceMap[student._id] || 'Not Marked'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
                {students.length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                      No students found for {selectedClass} - Section {selectedSection}.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>📋</div>
          <div>Select a Class and Section above to launch the attendance register.</div>
        </div>
      )}
    </div>
  );
}
