'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Fee, Student } from '@/types';
import Link from 'next/link';

export default function FeesPage() {
  const { user } = useAuth();
  const [fees, setFees] = useState<Fee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Stats state
  const [stats, setStats] = useState({
    totalCollected: 0,
    totalPending: 0,
    pendingStudents: 0,
    paidStudents: 0,
  });

  // Modal state for recording payments
  const [showModal, setShowModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('UPI');
  const [allStudents, setAllStudents] = useState<Student[]>([]);

  useEffect(() => {
    loadFeesData();
    if (user?.role !== 'student') {
      loadStudents();
    }
  }, [user]);

  const loadFeesData = async () => {
    setLoading(true);
    try {
      if (user?.role === 'student') {
        const studentId = user?.studentId;
        if (studentId) {
          const personalFee = await api.get<Fee>(`/fees/student/${studentId}`);
          setFees(personalFee ? [personalFee] : []);
        }
      } else {
        // Fetch all fees
        const query = statusFilter ? `?paymentStatus=${statusFilter}` : '';
        const allFees = await api.get<Fee[]>(`/fees${query}`);
        
        // Fetch stats
        const statsData = await api.get<any>('/fees/stats');
        
        setFees(allFees);
        setStats({
          totalCollected: statsData.totalCollected,
          totalPending: statsData.totalPending,
          pendingStudents: statsData.pendingStudents,
          paidStudents: statsData.paidStudents,
        });
      }
    } catch (error) {
      console.error('Error loading fees:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStudents = async () => {
    try {
      const data = await api.get<Student[]>('/students');
      setAllStudents(data);
    } catch (err) {
      console.error('Error loading students:', err);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !paymentAmount || Number(paymentAmount) <= 0) {
      alert('Please fill out all payment details.');
      return;
    }

    try {
      await api.post('/fees/payment', {
        student: selectedStudent,
        amount: Number(paymentAmount),
        paymentMethod,
      });
      setShowModal(false);
      setPaymentAmount('');
      setSelectedStudent('');
      loadFeesData();
    } catch (err: any) {
      alert(err.message || 'Failed to submit payment record');
    }
  };

  const handleSimulateOnlinePayment = async (studentId: string) => {
    const amountStr = prompt('Enter payment amount to simulate (₹):', '5000');
    if (!amountStr || isNaN(Number(amountStr)) || Number(amountStr) <= 0) return;
    
    try {
      setLoading(true);
      await api.post('/fees/payment', {
        student: studentId,
        amount: Number(amountStr),
        paymentMethod: 'Online Payment Sim',
      });
      alert(`Simulation Successful! We recorded a payment of ₹${amountStr}.`);
      loadFeesData();
    } catch (err: any) {
      alert(err.message || 'Online payment simulation failed');
      setLoading(false);
    }
  };

  // Filter fees based on search query in JS
  const filteredFees = fees.filter((f) => {
    if (!search) return true;
    const sName = (f.student as any)?.name || '';
    const sRoll = (f.student as any)?.rollNo || '';
    return (
      sName.toLowerCase().includes(search.toLowerCase()) ||
      sRoll.toLowerCase().includes(search.toLowerCase())
    );
  });

  // Render Admin Fee View
  const renderAdminView = () => {
    return (
      <div>
        {/* Fees Stats Grid */}
        <div className="stats-grid" style={{ marginBottom: '32px' }}>
          <div className="stat-card">
            <div className="stat-card-icon" style={{ background: 'rgba(16, 185, 129, 0.15)' }}>💰</div>
            <div className="stat-card-value">₹{stats.totalCollected.toLocaleString()}</div>
            <div className="stat-card-label">Total Fees Collected</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon" style={{ background: 'rgba(239, 68, 68, 0.15)' }}>💸</div>
            <div className="stat-card-value">₹{stats.totalPending.toLocaleString()}</div>
            <div className="stat-card-label">Total Fees Outstanding</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon" style={{ background: 'rgba(245, 158, 11, 0.15)' }}>⏳</div>
            <div className="stat-card-value">{stats.pendingStudents}</div>
            <div className="stat-card-label">Students with Balance</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon" style={{ background: 'rgba(99, 102, 241, 0.15)' }}>✅</div>
            <div className="stat-card-value">{stats.paidStudents}</div>
            <div className="stat-card-label">Fully Paid Students</div>
          </div>
        </div>

        <div className="table-container">
          <div className="table-header">
            <div className="table-title">Billing Registers ({filteredFees.length})</div>
            <div className="table-actions">
              <form onSubmit={handleSearchSubmit} className="search-input">
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
                style={{ width: '160px', padding: '0 12px' }}
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setLoading(true);
                }}
              >
                <option value="">All Statuses</option>
                <option value="Paid">Paid</option>
                <option value="Partially Paid">Partially Paid</option>
                <option value="Pending">Pending</option>
              </select>

              <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                💵 Record Payment
              </button>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Roll No</th>
                <th>Course</th>
                <th>Total Bill</th>
                <th>Amount Paid</th>
                <th>Outstanding</th>
                <th>Payment Status</th>
                <th>Last Tx Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredFees.map((fee) => (
                <tr key={fee._id}>
                  <td style={{ fontWeight: 600 }}>
                    <Link href={`/admin/students/${(fee.student as any)?._id}`} style={{ color: 'var(--primary-light)', textDecoration: 'none' }}>
                      {(fee.student as any)?.name || 'Unknown'}
                    </Link>
                  </td>
                  <td>{(fee.student as any)?.rollNo || 'N/A'}</td>
                  <td><span className="badge badge-info">{(fee.student as any)?.class || 'N/A'}</span></td>
                  <td>₹{fee.totalFee.toLocaleString()}</td>
                  <td style={{ color: 'var(--success-light)', fontWeight: 600 }}>₹{fee.paidFee.toLocaleString()}</td>
                  <td style={{ color: fee.remainingFee > 0 ? 'var(--danger-light)' : 'var(--text-secondary)', fontWeight: 600 }}>
                    ₹{fee.remainingFee.toLocaleString()}
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        fee.paymentStatus === 'Paid'
                          ? 'badge-success'
                          : fee.paymentStatus === 'Partially Paid'
                          ? 'badge-info'
                          : 'badge-warning'
                      }`}
                    >
                      {fee.paymentStatus}
                    </span>
                  </td>
                  <td>
                    {fee.paymentDate ? new Date(fee.paymentDate).toLocaleDateString() : 'No payments yet'}
                  </td>
                </tr>
              ))}
              {filteredFees.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px' }}>
                    No fee billing records found matching parameters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Record Payment Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="modal-title">Record Offline Payment</h2>
                <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
              </div>
              <form onSubmit={handleRecordPayment}>
                <div className="form-group">
                  <label className="form-label">Select Student</label>
                  <select
                    className="form-input"
                    style={{ width: '100%', background: 'var(--bg-input)', color: 'var(--text-primary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '12px 16px' }}
                    value={selectedStudent}
                    onChange={(e) => setSelectedStudent(e.target.value)}
                    required
                  >
                    <option value="">-- Choose Student --</option>
                    {allStudents.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.name} ({s.rollNo} - {s.class})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Payment Amount (₹)</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="Enter amount paid"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Payment Mode</label>
                  <select
                    className="form-input"
                    style={{ width: '100%', background: 'var(--bg-input)', color: 'var(--text-primary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '12px 16px' }}
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    required
                  >
                    <option value="UPI">UPI / QR Code</option>
                    <option value="Cash">Cash</option>
                    <option value="Card">Debit / Credit Card</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                  </select>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Submit Record</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render Student Fee View
  const renderStudentView = () => {
    const myFee = fees[0];
    if (!myFee) {
      return (
        <div className="empty-state">
          <div className="empty-state-icon">💰</div>
          <div className="empty-state-text">No Fee Record Available</div>
          <div className="empty-state-subtext">No billing record exists for your account at this moment.</div>
        </div>
      );
    }

    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px', alignItems: 'start' }}>
        {/* Left Card: Billing Summary */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
            💳 Tuition Fee Summary
          </h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Billed Semester</span>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Semester 1</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Total Fee Billed</span>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>₹{myFee.totalFee.toLocaleString()}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Amount Paid</span>
            <span style={{ fontWeight: 600, color: 'var(--success-light)' }}>₹{myFee.paidFee.toLocaleString()}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
            <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Outstanding Balance</span>
            <span style={{ fontWeight: 800, color: myFee.remainingFee > 0 ? 'var(--danger-light)' : 'var(--success-light)', fontSize: '15px' }}>
              ₹{myFee.remainingFee.toLocaleString()}
            </span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className={`badge ${myFee.paymentStatus === 'Paid' ? 'badge-success' : myFee.paymentStatus === 'Partially Paid' ? 'badge-info' : 'badge-warning'}`}>
              {myFee.paymentStatus}
            </span>
          </div>

          {myFee.remainingFee > 0 && (
            <button
              onClick={() => handleSimulateOnlinePayment(myFee.student?._id || myFee.student)}
              className="btn btn-primary"
              style={{ marginTop: '12px', justifyContent: 'center' }}
            >
              💳 Pay Online (Simulator)
            </button>
          )}
        </div>

        {/* Right Card: Transaction History */}
        <div className="card">
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>
            📜 Transaction History Log
          </h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', minWidth: '400px' }}>
              <thead>
                <tr>
                  <th>Transaction ID</th>
                  <th>Date & Time</th>
                  <th>Payment Mode</th>
                  <th>Amount Received</th>
                </tr>
              </thead>
              <tbody>
                {myFee.history.map((tx: any, idx) => (
                  <tr key={idx}>
                    <td style={{ fontFamily: 'monospace', fontSize: '12px' }}>TXN{new Date(tx.date).getTime().toString().slice(-8)}</td>
                    <td>{new Date(tx.date).toLocaleString()}</td>
                    <td>{tx.paymentMethod}</td>
                    <td style={{ fontWeight: 700, color: 'var(--success-light)' }}>₹{tx.amount.toLocaleString()}</td>
                  </tr>
                ))}
                {myFee.history.length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px' }}>
                      No transactions recorded.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  useEffect(() => {
    // If status filter changes, load again
    loadFeesData();
  }, [statusFilter]);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Fee Management</h1>
        <p className="page-subtitle">Track receipts, invoicing records, and balances</p>
      </div>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '40vh' }}>
          <div style={{ animation: 'pulse 1.5s infinite' }}>Loading Fee Details...</div>
        </div>
      ) : user?.role === 'student' ? (
        renderStudentView()
      ) : (
        renderAdminView()
      )}
    </div>
  );
}
