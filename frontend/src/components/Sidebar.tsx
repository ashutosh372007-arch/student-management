'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isLight, setIsLight] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('theme') === 'light';
    setIsLight(saved);
    document.body.classList.toggle('light-mode', saved);
  }, []);

  const toggleTheme = () => {
    const newVal = !isLight;
    setIsLight(newVal);
    localStorage.setItem('theme', newVal ? 'light' : 'dark');
    document.body.classList.toggle('light-mode', newVal);
  };

  const getNavItems = () => {
    const role = user?.role || 'admin';
    
    if (role === 'student') {
      return [
        { href: '/admin/dashboard', icon: '📊', label: 'My Dashboard' },
        { href: `/admin/students/${user?.studentId || 'me'}`, icon: '👤', label: 'My Profile' },
        { href: '/admin/attendance', icon: '✅', label: 'My Attendance' },
        { href: '/admin/results', icon: '📝', label: 'My Results' },
        { href: '/admin/assignments', icon: '📚', label: 'My Assignments' },
        { href: '/admin/fees', icon: '💰', label: 'My Fees' },
        { href: '/admin/notices', icon: '📢', label: 'Campus Notices' },
        { href: '/admin/certificates', icon: '📜', label: 'My Certificates' },
        { href: '/admin/notifications', icon: '🔔', label: 'Notifications' },
      ];
    }

    if (role === 'parent') {
      return [
        { href: '/admin/dashboard', icon: '📊', label: "My Child's Dashboard" },
        { href: `/admin/students/${user?.studentId || 'me'}`, icon: '👤', label: "My Child's Profile" },
        { href: '/admin/attendance', icon: '✅', label: "My Child's Attendance" },
        { href: '/admin/results', icon: '📝', label: "My Child's Results" },
        { href: '/admin/assignments', icon: '📚', label: "My Child's Tasks" },
        { href: '/admin/fees', icon: '💰', label: "My Child's Fees" },
        { href: '/admin/notices', icon: '📢', label: 'Campus Notices' },
        { href: '/admin/notifications', icon: '🔔', label: 'Alert Center' },
      ];
    }

    if (role === 'teacher') {
      return [
        { href: '/admin/dashboard', icon: '📊', label: 'Dashboard' },
        { href: '/admin/students', icon: '🎓', label: 'Students' },
        { href: '/admin/attendance', icon: '✅', label: 'Attendance' },
        { href: '/admin/timetable', icon: '📅', label: 'Timetable' },
        { href: '/admin/assignments', icon: '📚', label: 'Assignments' },
        { href: '/admin/results', icon: '📝', label: 'Results' },
        { href: '/admin/notices', icon: '📢', label: 'Notice Board' },
        { href: '/admin/certificates', icon: '📜', label: 'Certificates' },
        { href: '/admin/notifications', icon: '🔔', label: 'Notifications' },
      ];
    }

    // Admin
    return [
      { href: '/admin/dashboard', icon: '📊', label: 'Dashboard' },
      { href: '/admin/students', icon: '🎓', label: 'Students' },
      { href: '/admin/teachers', icon: '👨‍🏫', label: 'Teachers' },
      { href: '/admin/classes', icon: '🏫', label: 'Classes' },
      { href: '/admin/timetable', icon: '📅', label: 'Timetable' },
      { href: '/admin/attendance', icon: '✅', label: 'Attendance' },
      { href: '/admin/fees', icon: '💰', label: 'Fees' },
      { href: '/admin/results', icon: '📝', label: 'Results' },
      { href: '/admin/assignments', icon: '📚', label: 'Assignments' },
      { href: '/admin/notices', icon: '📢', label: 'Notice Board' },
      { href: '/admin/certificates', icon: '📜', label: 'Certificates' },
      { href: '/admin/audit-logs', icon: '📋', label: 'Audit Logs' },
      { href: '/admin/notifications', icon: '🔔', label: 'Notifications' },
    ];
  };

  const navItems = getNavItems();

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">SM</div>
        <span className="sidebar-logo-text">Student Mgmt</span>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`sidebar-link ${pathname === item.href ? 'active' : ''}`}
          >
            <span className="sidebar-link-icon">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 16px 16px 16px', borderBottom: '1px solid var(--border)', marginBottom: '8px' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Light Mode</span>
          <button
            onClick={toggleTheme}
            style={{
              background: isLight ? 'var(--primary)' : 'var(--bg-input)',
              border: '1px solid var(--border)',
              borderRadius: '20px',
              width: '44px',
              height: '24px',
              position: 'relative',
              cursor: 'pointer',
              transition: 'var(--transition-fast)',
              padding: 0,
            }}
          >
            <div
              style={{
                width: '18px',
                height: '18px',
                background: 'white',
                borderRadius: '50%',
                position: 'absolute',
                top: '2px',
                left: isLight ? '22px' : '2px',
                transition: 'var(--transition-fast)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '10px',
              }}
            >
              {isLight ? '☀️' : '🌙'}
            </div>
          </button>
        </div>

        <div style={{ padding: '12px 16px', marginBottom: '8px' }}>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
            {user?.name || 'User'}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
            {user?.role || 'Role'}
          </div>
        </div>
        
        <button
          onClick={logout}
          className="sidebar-link"
          style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '14px', textAlign: 'left' }}
        >
          <span className="sidebar-link-icon">🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
