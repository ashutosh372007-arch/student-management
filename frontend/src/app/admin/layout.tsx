'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Sidebar from '@/components/Sidebar';
import api from '@/lib/api';
import { Student } from '@/types';
import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Student[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      const delayDebounceFn = setTimeout(() => {
        performSearch();
      }, 300);
      return () => clearTimeout(delayDebounceFn);
    } else {
      setSearchResults([]);
      setShowDropdown(false);
    }
  }, [searchQuery]);

  const performSearch = async () => {
    try {
      const data = await api.get<Student[]>(`/students?search=${encodeURIComponent(searchQuery)}`);
      setSearchResults(data);
      setShowDropdown(data.length > 0);
    } catch (err) {
      console.error('Global search failed:', err);
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ fontSize: '24px', animation: 'pulse 1.5s infinite' }}>Loading...</div>
      </div>
    );
  }

  if (!user) return null;

  const showSearch = user.role === 'admin' || user.role === 'teacher';

  return (
    <div className="app-layout">
      <Sidebar />
      <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, minHeight: '100vh' }}>
        {/* Top Header Navigation Bar */}
        <header className="no-print" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 24px',
          background: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          backdropFilter: 'blur(8px)'
        }}>
          <div>
            {showSearch ? (
              <div className="global-search-container" ref={dropdownRef}>
                <div className="global-search-bar">
                  <span>🔍</span>
                  <input
                    type="text"
                    className="global-search-input"
                    placeholder="Global Search (Name, Roll No, Email...)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setShowDropdown(searchResults.length > 0)}
                  />
                </div>
                {showDropdown && (
                  <div className="global-search-results-dropdown">
                    {searchResults.map((s) => (
                      <Link
                        key={s._id}
                        href={`/admin/students/${s._id}`}
                        className="global-search-item"
                        onClick={() => {
                          setSearchQuery('');
                          setShowDropdown(false);
                        }}
                      >
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)' }}>{s.name}</span>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Roll: {s.rollNo} | {s.class} - {s.section}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--primary-light)' }}>
                ✨ Excelsior Academic Campus Portal
              </span>
            )}
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Session: <strong>2026-27</strong>
            </span>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--primary), var(--accent))',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              fontWeight: 700
            }}>
              {user.name.charAt(0)}
            </div>
          </div>
        </header>
        
        <main className="main-content" style={{ flexGrow: 1, padding: '24px' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
