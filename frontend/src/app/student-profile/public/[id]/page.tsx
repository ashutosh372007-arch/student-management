'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Student } from '@/types';

export default function PublicStudentProfilePage() {
  const { id } = useParams();
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      loadPublicProfile();
    }
  }, [id]);

  const loadPublicProfile = async () => {
    setLoading(true);
    setError('');
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${apiBase}/students/public/${id}`);
      if (!res.ok) {
        throw new Error('Student record not found or inactive');
      }
      const data = await res.json();
      setStudent(data);
    } catch (err: any) {
      setError(err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#0B1220', color: '#F8FAFC' }}>
        <div style={{ fontSize: '20px', fontWeight: 600, animation: 'pulse 1.5s infinite' }}>
          🔍 Verifying Digital Campus Record...
        </div>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#0B1220', padding: '20px', color: '#F8FAFC' }}>
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #EF4444', borderRadius: '12px', padding: '40px 24px', textAlign: 'center', maxWidth: '420px', width: '100%' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>❌</div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#F87171', marginBottom: '8px' }}>Verification Failed</h1>
          <p style={{ fontSize: '14px', color: '#94A3B8', lineHeight: '1.5' }}>
            This QR code does not point to an active student record in our campus management database.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#0B1220', padding: '20px', fontFamily: 'sans-serif' }}>
      <div style={{
        background: '#111C2E',
        border: '1px solid #243B5A',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '450px',
        padding: '30px 24px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.55)',
        textAlign: 'center',
        color: '#CBD5E1'
      }}>
        
        {/* Verification Status Header */}
        <div style={{
          background: 'rgba(16, 185, 129, 0.15)',
          color: '#34d399',
          border: '1px solid #10b981',
          borderRadius: '20px',
          padding: '6px 16px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '13px',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '1px',
          marginBottom: '24px'
        }}>
          <span>✓</span> Verified Campus Student
        </div>

        {/* Initials Avatar */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '90px',
            height: '90px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
            color: 'white',
            fontSize: '36px',
            fontWeight: 700,
            boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)'
          }}>
            {student.name.charAt(0)}
          </div>
        </div>

        {/* Student Details */}
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#f1f5f9', marginBottom: '6px' }}>{student.name}</h1>
        <div style={{ fontSize: '14px', color: '#818cf8', fontWeight: 600, marginBottom: '24px' }}>
          Roll Number: {student.rollNo}
        </div>

        {/* Profile Attributes Card */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '12px',
          padding: '16px',
          textAlign: 'left',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '13px' }}>
            <div>
              <span style={{ color: '#64748b', display: 'block', fontSize: '11px', textTransform: 'uppercase', marginBottom: '2px' }}>Class</span>
              <span style={{ color: '#f1f5f9', fontWeight: 600 }}>{student.class}</span>
            </div>
            <div>
              <span style={{ color: '#64748b', display: 'block', fontSize: '11px', textTransform: 'uppercase', marginBottom: '2px' }}>Section</span>
              <span style={{ color: '#f1f5f9', fontWeight: 600 }}>Section {student.section}</span>
            </div>
            <div>
              <span style={{ color: '#64748b', display: 'block', fontSize: '11px', textTransform: 'uppercase', marginBottom: '2px' }}>Admission Date</span>
              <span style={{ color: '#f1f5f9', fontWeight: 600 }}>
                {student.admissionDate ? new Date(student.admissionDate).toLocaleDateString() : 'N/A'}
              </span>
            </div>
            <div>
              <span style={{ color: '#64748b', display: 'block', fontSize: '11px', textTransform: 'uppercase', marginBottom: '2px' }}>Placement Ready</span>
              <span style={{ color: '#34d399', fontWeight: 600 }}>
                {student.placementScore >= 70 ? '✓ YES' : 'DEVELOPING'}
              </span>
            </div>
          </div>
        </div>

        {/* Skills subsection */}
        {student.skills && student.skills.length > 0 && (
          <div style={{ textAlign: 'left' }}>
            <h3 style={{ fontSize: '13px', fontWeight: 600, color: '#f1f5f9', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Core Technical Competencies
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {student.skills.map((skill: any, idx: number) => (
                <span
                  key={idx}
                  style={{
                    background: 'rgba(99, 102, 241, 0.1)',
                    color: '#818cf8',
                    border: '1px solid rgba(99, 102, 241, 0.3)',
                    borderRadius: '6px',
                    padding: '4px 10px',
                    fontSize: '12px',
                    fontWeight: 500,
                  }}
                >
                  {skill.name} • {skill.level}
                </span>
              ))}
            </div>
          </div>
        )}

        <hr style={{ border: 'none', borderTop: '1px solid rgba(255, 255, 255, 0.08)', margin: '24px 0 16px 0' }} />
        <div style={{ fontSize: '11px', color: '#64748b' }}>
          Official verification signature: EXCELSIOR CAMPUS ERP SYSTEM
        </div>

      </div>
    </div>
  );
}
