'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { AuditLog } from '@/types';
import Link from 'next/link';

export default function AuditLogsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAdmin) {
      loadLogs();
    }
  }, [isAdmin]);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await api.get<AuditLog[]>('/audit-logs');
      setLogs(data);
    } catch (err) {
      console.error('Error loading audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="empty-state" style={{ minHeight: '60vh' }}>
        <div className="empty-state-icon">🚫</div>
        <div className="empty-state-text">Access Denied</div>
        <div className="empty-state-subtext">You must be an administrator to view system audit logs.</div>
        <Link href="/admin/dashboard" className="btn btn-primary" style={{ marginTop: '20px' }}>
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">System Activity & Audit Logs</h1>
        <p className="page-subtitle">Historical records of system modifications, grade entries, notice creation, and logins</p>
      </div>

      <div className="table-container">
        <div className="table-header">
          <div className="table-title">Activity Trail (Last 100 actions)</div>
          <button className="btn btn-secondary btn-sm" onClick={loadLogs}>🔄 Refresh Logs</button>
        </div>

        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '30vh' }}>
            <div style={{ animation: 'pulse 1.5s infinite', fontSize: '16px' }}>Loading audit trail...</div>
          </div>
        ) : logs.length === 0 ? (
          <div className="empty-state" style={{ minHeight: '30vh' }}>
            <div className="empty-state-icon">📋</div>
            <div className="empty-state-text">No activity logged yet</div>
            <div className="empty-state-subtext">System modifications and logins will trigger log entries.</div>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Operator (Role)</th>
                <th>Modification / Action Description</th>
                <th>Affected Student</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log._id}>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                    {new Date(log.timestamp).toLocaleString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </td>
                  <td>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{log.username}</span>
                    <span className="badge badge-info" style={{ marginLeft: '8px', fontSize: '10px', textTransform: 'capitalize' }}>
                      {log.role}
                    </span>
                  </td>
                  <td style={{ fontWeight: 500 }}>{log.action}</td>
                  <td>
                    {log.targetStudentId ? (
                      <Link
                        href={`/admin/students/${log.targetStudentId}`}
                        style={{ color: 'var(--primary-light)', textDecoration: 'none', fontWeight: 600 }}
                      >
                        {log.targetStudentName || 'View Profile'}
                      </Link>
                    ) : log.targetStudentName ? (
                      <span style={{ color: 'var(--text-secondary)' }}>{log.targetStudentName}</span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
