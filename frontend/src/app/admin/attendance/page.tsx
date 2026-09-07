'use client';

import React, { useState, useEffect } from 'react';
import { Student, Attendance } from '@/types';
import api from '@/lib/api';

export default function AttendancePage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [records, setRecords] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
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
      alert('Attendance saved successfully!');
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
      <div className="page-header">
        <h1 className="page-title">Attendance</h1>
        <p className="page-subtitle">Mark and view student attendance records</p>
      </div>

      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Class</label>
            <input className="form-input" value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} placeholder="e.g. 10" style={{ width: '120px' }} />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Section</label>
            <input className="form-input" value={selectedSection} onChange={(e) => setSelectedSection(e.target.value)} placeholder="e.g. A" style={{ width: '120px' }} />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Date</label>
            <input type="date" className="form-input" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} style={{ width: '180px' }} />
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className={`btn ${viewMode === 'mark' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setViewMode('mark')}>
              ✏️ Mark
            </button>
            <button className={`btn ${viewMode === 'view' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setViewMode('view')}>
              📊 View
            </button>
          </div>
        </div>
      </div>

      {selectedClass && selectedSection && (
        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
          <div className="stat-card">
            <div className="stat-card-value">{stats.total}</div>
            <div className="stat-card-label">Total Records</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-value" style={{ color: 'var(--success)' }}>{stats.present}</div>
            <div className="stat-card-label">Present</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-value" style={{ color: 'var(--danger)' }}>{stats.absent}</div>
            <div className="stat-card-label">Absent</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-value" style={{ color: 'var(--warning)' }}>{stats.late}</div>
            <div className="stat-card-label">Late</div>
          </div>
        </div>
      )}

      {!selectedClass || !selectedSection ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">✅</div>
            <div className="empty-state-text">Select a class and section</div>
            <div className="empty-state-subtext">Enter class and section above to mark or view attendance</div>
          </div>
        </div>
      ) : viewMode === 'mark' ? (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Mark Attendance — {selectedDate}</h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn btn-success btn-sm" onClick={() => markAll('Present')}>All Present</button>
              <button className="btn btn-danger btn-sm" onClick={() => markAll('Absent')}>All Absent</button>
            </div>
          </div>

          {students.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-text">No students found in this class</div>
            </div>
          ) : (
            <>
              {students.map((student) => (
                <div key={student._id} className="attendance-grid">
                  <div>
                    <div className="attendance-student-name">{student.name}</div>
                    <div className="attendance-student-roll">Roll: {student.rollNo}</div>
                  </div>
                  <div className="attendance-actions">
                    <button
                      className={`attendance-btn ${attendanceMap[student._id] === 'Present' ? 'present' : ''}`}
                      onClick={() => setStatus(student._id, 'Present')}
                    >Present</button>
                    <button
                      className={`attendance-btn ${attendanceMap[student._id] === 'Absent' ? 'absent' : ''}`}
                      onClick={() => setStatus(student._id, 'Absent')}
                    >Absent</button>
                    <button
                      className={`attendance-btn ${attendanceMap[student._id] === 'Late' ? 'late' : ''}`}
                      onClick={() => setStatus(student._id, 'Late')}
                    >Late</button>
                  </div>
                </div>
              ))}
              <div style={{ marginTop: '24px', textAlign: 'right' }}>
                <button className="btn btn-primary" onClick={saveAttendance} disabled={loading}>
                  {loading ? '⏳ Saving...' : '💾 Save Attendance'}
                </button>
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="table-container">
          <div className="table-header">
            <div className="table-title">Attendance Records</div>
          </div>
          {records.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-text">No attendance records for this date</div>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Class</th>
                  <th>Section</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr key={record._id}>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{record.studentName}</td>
                    <td>{record.class}</td>
                    <td>{record.section}</td>
                    <td>
                      <span className={`badge ${
                        record.status === 'Present' ? 'badge-success' :
                        record.status === 'Absent' ? 'badge-danger' : 'badge-warning'
                      }`}>
                        {record.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
