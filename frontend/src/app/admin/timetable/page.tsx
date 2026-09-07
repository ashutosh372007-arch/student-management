'use client';

import React, { useState, useEffect } from 'react';
import { Timetable, Period } from '@/types';
import api from '@/lib/api';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const emptyPeriod: Period = { subject: '', teacher: '', startTime: '', endTime: '' };

export default function TimetablePage() {
  const [timetables, setTimetables] = useState<Timetable[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formDay, setFormDay] = useState('Monday');
  const [formPeriods, setFormPeriods] = useState<Period[]>([{ ...emptyPeriod }]);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    if (selectedClass && selectedSection) {
      loadTimetable();
    }
  }, [selectedClass, selectedSection]);

  const loadTimetable = async () => {
    setLoading(true);
    try {
      const data = await api.get<Timetable[]>(`/timetable?class=${selectedClass}&section=${selectedSection}`);
      setTimetables(data);
    } catch (error) {
      console.error('Error loading timetable:', error);
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setEditingId(null);
    setFormDay('Monday');
    setFormPeriods([{ ...emptyPeriod }]);
    setShowModal(true);
  };

  const openEdit = (tt: Timetable) => {
    setEditingId(tt._id);
    setFormDay(tt.day);
    setFormPeriods(tt.periods.length > 0 ? [...tt.periods] : [{ ...emptyPeriod }]);
    setShowModal(true);
  };

  const addPeriod = () => setFormPeriods([...formPeriods, { ...emptyPeriod }]);

  const removePeriod = (index: number) => {
    if (formPeriods.length > 1) {
      setFormPeriods(formPeriods.filter((_, i) => i !== index));
    }
  };

  const updatePeriod = (index: number, field: keyof Period, value: string) => {
    const updated = [...formPeriods];
    updated[index] = { ...updated[index], [field]: value };
    setFormPeriods(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        class: selectedClass,
        section: selectedSection,
        day: formDay,
        periods: formPeriods,
      };
      if (editingId) {
        await api.put(`/timetable/${editingId}`, data);
      } else {
        await api.post('/timetable', data);
      }
      setShowModal(false);
      loadTimetable();
    } catch (error: any) {
      alert(error.message || 'Error saving timetable');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this timetable entry?')) return;
    try {
      await api.delete(`/timetable/${id}`);
      loadTimetable();
    } catch (error: any) {
      alert(error.message || 'Error deleting timetable');
    }
  };

  const getDayTimetable = (day: string) => timetables.find((t) => t.day === day);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Timetable</h1>
        <p className="page-subtitle">View and manage class schedules</p>
      </div>

      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Class</label>
            <input className="form-input" value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} placeholder="e.g. 10" style={{ width: '150px' }} />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Section</label>
            <input className="form-input" value={selectedSection} onChange={(e) => setSelectedSection(e.target.value)} placeholder="e.g. A" style={{ width: '150px' }} />
          </div>
          {selectedClass && selectedSection && (
            <button className="btn btn-primary" onClick={openAdd}>+ Add Day Schedule</button>
          )}
        </div>
      </div>

      {!selectedClass || !selectedSection ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">📅</div>
            <div className="empty-state-text">Select a class and section</div>
            <div className="empty-state-subtext">Enter the class and section above to view the timetable</div>
          </div>
        </div>
      ) : loading ? (
        <div className="card">
          <div className="empty-state"><div style={{ animation: 'pulse 1.5s infinite' }}>Loading...</div></div>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {days.map((day) => {
            const tt = getDayTimetable(day);
            return (
              <div key={day} style={{ borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', background: 'var(--bg-glass)' }}>
                  <span style={{ fontWeight: 700, fontSize: '15px' }}>{day}</span>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {tt && (
                      <>
                        <button className="btn btn-secondary btn-sm" onClick={() => openEdit(tt)}>✏️</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(tt._id)}>🗑️</button>
                      </>
                    )}
                  </div>
                </div>
                {tt && tt.periods.length > 0 ? (
                  <div style={{ display: 'flex', overflowX: 'auto' }}>
                    {tt.periods.map((period, i) => (
                      <div key={i} style={{ flex: '1', minWidth: '140px', padding: '14px 20px', borderRight: '1px solid var(--border)' }}>
                        <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)', marginBottom: '4px' }}>
                          {period.subject}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{period.teacher}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                          {period.startTime} - {period.endTime}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ padding: '14px 24px', fontSize: '13px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                    No schedule set
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{editingId ? 'Edit Schedule' : 'Add Schedule'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Day</label>
                <select className="form-select" value={formDay} onChange={(e) => setFormDay(e.target.value)}>
                  {days.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <label className="form-label" style={{ marginBottom: 0 }}>Periods</label>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={addPeriod}>+ Add Period</button>
                </div>
                {formPeriods.map((period, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 100px 100px auto', gap: '8px', marginBottom: '8px', alignItems: 'end' }}>
                    <input className="form-input" placeholder="Subject" value={period.subject} onChange={(e) => updatePeriod(i, 'subject', e.target.value)} required />
                    <input className="form-input" placeholder="Teacher" value={period.teacher} onChange={(e) => updatePeriod(i, 'teacher', e.target.value)} required />
                    <input type="time" className="form-input" value={period.startTime} onChange={(e) => updatePeriod(i, 'startTime', e.target.value)} required />
                    <input type="time" className="form-input" value={period.endTime} onChange={(e) => updatePeriod(i, 'endTime', e.target.value)} required />
                    <button type="button" className="btn btn-danger btn-sm btn-icon" onClick={() => removePeriod(i)} disabled={formPeriods.length === 1}>×</button>
                  </div>
                ))}
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editingId ? 'Update' : 'Add'} Schedule</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
