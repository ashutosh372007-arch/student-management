'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [role, setRole] = useState('admin');
  const [studentRollNo, setStudentRollNo] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login, register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isRegister) {
        await register(username, password, name, role, studentRollNo);
      } else {
        await login(username, password);
      }
      router.push('/admin/dashboard');
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-logo">
          <div className="login-logo-icon">SM</div>
          <h1 className="login-title">Student Management</h1>
          <p className="login-subtitle">
            {isRegister ? 'Create your admin account' : 'Sign in to your account'}
          </p>
        </div>

        {error && <div className="login-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Register As</label>
                <select
                  className="form-input"
                  style={{ width: '100%', background: 'var(--bg-input)', color: 'var(--text-primary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '12px 16px' }}
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  required
                >
                  <option value="admin">Administrator</option>
                  <option value="teacher">Teacher</option>
                  <option value="student">Student</option>
                  <option value="parent">Parent / Guardian</option>
                </select>
              </div>

              {role === 'parent' && (
                <div className="form-group">
                  <label className="form-label">Student Roll Number</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Enter student's Roll Number (e.g. S2026001)"
                    value={studentRollNo}
                    onChange={(e) => setStudentRollNo(e.target.value)}
                    required
                  />
                </div>
              )}
            </>
          )}

          <div className="form-group">
            <label className="form-label">Username</label>
            <input
              type="text"
              className="form-input"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary login-btn" disabled={loading}>
            {loading ? '⏳ Please wait...' : isRegister ? '📝 Create Account' : '🔐 Sign In'}
          </button>
        </form>

        {!isRegister && (
          <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--border)' }}>
            <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '12px', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              ⚡ Quick Demo 1-Click Sign In
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '11px', padding: '8px 4px', justifyContent: 'center' }}
                onClick={async () => {
                  setUsername('admin');
                  setPassword('admin123');
                  setLoading(true);
                  try {
                    await login('admin', 'admin123');
                    router.push('/admin/dashboard');
                  } catch (e: any) { setError(e.message); } finally { setLoading(false); }
                }}
              >
                👑 Admin
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '11px', padding: '8px 4px', justifyContent: 'center' }}
                onClick={async () => {
                  setUsername('T2026001');
                  setPassword('teacher123');
                  setLoading(true);
                  try {
                    await login('T2026001', 'teacher123');
                    router.push('/admin/dashboard');
                  } catch (e: any) { setError(e.message); } finally { setLoading(false); }
                }}
              >
                👩‍🏫 Teacher
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '11px', padding: '8px 4px', justifyContent: 'center' }}
                onClick={async () => {
                  setUsername('S2026001');
                  setPassword('student123');
                  setLoading(true);
                  try {
                    await login('S2026001', 'student123');
                    router.push('/admin/dashboard');
                  } catch (e: any) { setError(e.message); } finally { setLoading(false); }
                }}
              >
                🎓 Student
              </button>
            </div>
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <button
            onClick={() => { setIsRegister(!isRegister); setError(''); }}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--primary-light)',
              cursor: 'pointer',
              fontSize: '14px',
              fontFamily: 'inherit',
            }}
          >
            {isRegister ? '← Back to Sign In' : "Don't have an account? Register"}
          </button>
        </div>
      </div>
    </div>
  );
}
