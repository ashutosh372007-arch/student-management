'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Student, PerformanceAnalysis, Submission, Fee, Skill, Project, Certification, Certificate } from '@/types';
import Link from 'next/link';

export default function StudentProfilePage() {
  const { user } = useAuth();
  const { id } = useParams();
  const router = useRouter();

  // If user is a student or parent, enforce their own studentId
  const studentId = (user?.role === 'student' || user?.role === 'parent') ? user?.studentId : id;

  const [student, setStudent] = useState<Student | null>(null);
  const [analysis, setAnalysis] = useState<PerformanceAnalysis | null>(null);
  const [fee, setFee] = useState<Fee | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  // Skills tracker modal states
  const [showSkillModal, setShowSkillModal] = useState(false);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [aptitudeScore, setAptitudeScore] = useState(0);
  const [communicationScore, setCommunicationScore] = useState(0);
  const [savingSkills, setSavingSkills] = useState(false);

  // New Skill/Project/Cert inputs
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillLevel, setNewSkillLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Beginner');
  const [newProjTitle, setNewProjTitle] = useState('');
  const [newProjDesc, setNewProjDesc] = useState('');
  const [newCertName, setNewCertName] = useState('');
  const [newCertOrg, setNewCertOrg] = useState('');

  // Selected certificate for preview modal
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);

  useEffect(() => {
    if (studentId) {
      loadStudentData();
    }
  }, [studentId]);

  const loadStudentData = async () => {
    setLoading(true);
    try {
      const [studentData, analysisData, feeData, submissionsData, certsData] = await Promise.allSettled([
        api.get<Student>(`/students/${studentId}`),
        api.get<PerformanceAnalysis>(`/analysis/student/${studentId}`),
        api.get<Fee>(`/fees/student/${studentId}`),
        api.get<Submission[]>(`/assignments/submissions?studentId=${studentId}`),
        api.get<Certificate[]>(`/certificates/student/${studentId}`),
      ]);

      if (studentData.status === 'fulfilled') {
        const studentObj = studentData.value;
        setStudent(studentObj);
        setSkills(studentObj.skills || []);
        setProjects(studentObj.projects || []);
        setCertifications(studentObj.certifications || []);
        setAptitudeScore(studentObj.aptitudeScore || 0);
        setCommunicationScore(studentObj.communicationScore || 0);
      }
      if (analysisData.status === 'fulfilled') setAnalysis(analysisData.value);
      if (feeData.status === 'fulfilled') setFee(feeData.value);
      if (submissionsData.status === 'fulfilled') setSubmissions(submissionsData.value);
      if (certsData.status === 'fulfilled') setCertificates(certsData.value);
    } catch (err) {
      console.error('Error loading student profile details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSaveSkills = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSkills(true);
    try {
      const updatedData = {
        skills,
        projects,
        certifications,
        aptitudeScore,
        communicationScore,
      };
      const response = await api.put<Student>(`/students/${studentId}/skills`, updatedData);
      setStudent(response);
      setShowSkillModal(false);
      // Reload stats and recommendations
      const analysisData = await api.get<PerformanceAnalysis>(`/analysis/student/${studentId}`);
      setAnalysis(analysisData);
    } catch (err: any) {
      alert(err.message || 'Error updating skills');
    } finally {
      setSavingSkills(false);
    }
  };

  const addSkill = () => {
    if (!newSkillName.trim()) return;
    if (skills.some(s => s.name.toLowerCase() === newSkillName.trim().toLowerCase())) {
      alert('Skill already added');
      return;
    }
    setSkills([...skills, { name: newSkillName.trim(), level: newSkillLevel }]);
    setNewSkillName('');
  };

  const removeSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const addProject = () => {
    if (!newProjTitle.trim() || !newProjDesc.trim()) return;
    setProjects([...projects, { title: newProjTitle.trim(), description: newProjDesc.trim() }]);
    setNewProjTitle('');
    setNewProjDesc('');
  };

  const removeProject = (index: number) => {
    setProjects(projects.filter((_, i) => i !== index));
  };

  const addCert = () => {
    if (!newCertName.trim() || !newCertOrg.trim()) return;
    setCertifications([...certifications, { name: newCertName.trim(), issuingOrganization: newCertOrg.trim(), date: new Date().toISOString() }]);
    setNewCertName('');
    setNewCertOrg('');
  };

  const removeCert = (index: number) => {
    setCertifications(certifications.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
        <div className="empty-state">
          <div style={{ animation: 'pulse 1.5s infinite', fontSize: '20px' }}>Loading Student profile...</div>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">👤</div>
        <div className="empty-state-text">Student Profile Not Found</div>
        <div className="empty-state-subtext">No record exists matching this ID.</div>
        <Link href="/admin/students" className="btn btn-primary" style={{ marginTop: '20px' }}>
          Back to Students
        </Link>
      </div>
    );
  }

  // Construct URL for public scanning
  let qrCodeBaseUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=160x160&margin=8&data=';
  const publicProfileUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/student-profile/public/${student._id}`
    : `http://localhost:3000/student-profile/public/${student._id}`;
  const qrCodeUrl = qrCodeBaseUrl + encodeURIComponent(publicProfileUrl);

  // Download QR code logic
  const handleDownloadQR = async () => {
    try {
      const response = await fetch(qrCodeUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${student.name.replace(/\s+/g, '_')}_QR_Code.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download QR code:', err);
    }
  };

  // Placement readiness breakdown
  const placementScore = student.placementScore || 0;
  const isPlacementReady = placementScore >= 70;

  // Compute suggestions based on score and missing elements
  const placementSuggestions: string[] = [];
  if (placementScore < 85) {
    if (!skills.some(s => s.name.toLowerCase().includes('dsa') || s.name.toLowerCase().includes('data structure'))) {
      placementSuggestions.push('Improve Data Structures & Algorithms (DSA) proficiency.');
    }
    if (projects.length < 3) {
      placementSuggestions.push('Add more personal projects (aim for at least 3 high-quality builds).');
    }
    if (certifications.length < 2) {
      placementSuggestions.push('Complete professional certifications (e.g. Java, AWS, Google Cloud).');
    }
    if ((student.aptitudeScore || 0) < 75) {
      placementSuggestions.push('Practice daily quantitative and logical reasoning tests to boost Aptitude Score.');
    }
    if ((student.communicationScore || 0) < 80) {
      placementSuggestions.push('Participate in group discussions and mock interviews to improve Communication skills.');
    }
    if (placementSuggestions.length === 0 && placementScore < 70) {
      placementSuggestions.push('Consistent revisions and practical skill projects are recommended.');
    }
  } else {
    placementSuggestions.push('Excellent profile readiness! Ready to share portfolio with corporate placement partners.');
  }

  // Risk reasons helper
  const riskLevel = student.riskLevel || 'LOW RISK';
  const riskReasons = student.riskReasons || [];

  return (
    <div className="profile-container">
      {/* Print Stylesheet Overrides */}
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          .sidebar, .page-header, .no-print, button, .btn {
            display: none !important;
          }
          .main-content {
            margin-left: 0 !important;
            padding: 0 !important;
          }
          .card {
            background: white !important;
            border: 1px solid #ddd !important;
            color: black !important;
            box-shadow: none !important;
            break-inside: avoid;
            margin-bottom: 20px !important;
          }
          .text-muted, var(--text-secondary), var(--text-muted) {
            color: #555 !important;
          }
          .badge {
            border: 1px solid #555 !important;
            color: black !important;
            background: white !important;
          }
          .print-header {
            display: block !important;
            text-align: center;
            margin-bottom: 30px;
          }
          .print-header h1 {
            font-size: 26px;
            margin-bottom: 5px;
          }
        }
        .print-header {
          display: none;
        }
      `}</style>

      {/* Printable Header Layout */}
      <div className="print-header">
        <h1>EXCELSIOR ACADEMIC CAMPUS</h1>
        <h3>Official Student Digital Academic Dossier</h3>
        <p>Generated on: {new Date().toLocaleDateString()} | Semester: Semester 1</p>
        <hr style={{ margin: '15px 0', border: '1px solid #ddd' }} />
      </div>

      <div className="page-header no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">{student.name}&apos;s Digital Profile</h1>
          <p className="page-subtitle">Real-time placement evaluation, technical skills and risk metrics</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          {user?.role !== 'student' && user?.role !== 'parent' && (
            <button onClick={() => router.push('/admin/students')} className="btn btn-secondary">
              ← Back to List
            </button>
          )}
          <button onClick={handlePrint} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            🖨️ Print Student Dossier
          </button>
        </div>
      </div>

      {/* Grid Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.8fr', gap: '24px', alignItems: 'start' }}>
        
        {/* Left Column: Digital Card, Skills, Projects, Certs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Student Digital Identity Card */}
          <div className="card" style={{ padding: '24px 20px', textAlign: 'center', background: 'linear-gradient(135deg, var(--bg-secondary) 0%, rgba(99,102,241,0.08) 100%)', border: '1px solid var(--primary-glow)' }}>
            <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--text-muted)', fontWeight: 600 }}>CAMPUS STUDENT ID</span>
            <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0 16px 0' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '90px', height: '90px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--accent))', color: 'white', fontSize: '36px', fontWeight: 700, boxShadow: 'var(--shadow-md)' }}>
                {student.name.charAt(0)}
              </div>
            </div>
            
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>{student.name}</h2>
            <div style={{ fontSize: '13px', color: 'var(--primary-light)', fontWeight: 600 }}>
              Roll No: {student.rollNo}
            </div>
            
            {/* Unique QR Code Student ID */}
            <div className="no-print" style={{ margin: '20px auto 12px auto', background: 'white', padding: '10px', borderRadius: 'var(--radius-sm)', width: '180px', display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: 'var(--shadow-sm)' }}>
              <img src={qrCodeUrl} alt="Student Profile QR ID" style={{ width: '160px', height: '160px' }} />
              <div style={{ fontSize: '10px', color: '#64748b', marginTop: '6px' }}>Scan to Verify ID</div>
            </div>
            
            {/* Printable QR Code section */}
            <div className="print-only" style={{ display: 'none', margin: '15px auto', background: 'white', padding: '5px', border: '1px solid #ddd', width: '130px', flexDirection: 'column', alignItems: 'center' }}>
              <img src={qrCodeUrl} alt="Student Profile QR ID" style={{ width: '120px', height: '120px' }} />
            </div>

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }} className="no-print">
              <button className="btn btn-secondary btn-sm" onClick={handleDownloadQR}>
                📥 Save QR Image
              </button>
              <button className="btn btn-secondary btn-sm" onClick={() => window.open(publicProfileUrl, '_blank')}>
                🔗 Open Scan Link
              </button>
            </div>
          </div>

          {/* Student Skill Tracker */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700 }}>
                🛠️ Technical & Soft Skills
              </h3>
              {(user?.role === 'admin' || user?.role === 'student') && (
                <button className="btn btn-secondary btn-sm no-print" onClick={() => setShowSkillModal(true)}>
                  ⚙️ Manage Profile
                </button>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {skills.map((skill, idx) => {
                const pct = skill.level === 'Advanced' ? 90 : skill.level === 'Intermediate' ? 65 : 35;
                const skillClass = skill.level === 'Advanced' ? 'skill-advanced' : skill.level === 'Intermediate' ? 'skill-intermediate' : 'skill-beginner';
                return (
                  <div key={idx} className="skill-item-container">
                    <div className="skill-header">
                      <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{skill.name}</span>
                      <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>{skill.level}</span>
                    </div>
                    <div className="skill-bar-outer">
                      <div className={`skill-bar-inner ${skillClass}`} style={{ width: `${pct}%` }}></div>
                    </div>
                  </div>
                );
              })}
              {skills.length === 0 && (
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', padding: '12px' }}>
                  No skills entered. Add technical skills to calculate Placement Readiness.
                </div>
              )}
            </div>
          </div>

          {/* Projects tracker list */}
          <div className="card">
            <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '16px' }}>
              🚀 Featured Projects
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {projects.map((proj, idx) => (
                <div key={idx} style={{ padding: '12px', background: 'var(--bg-glass)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                  <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)', marginBottom: '4px' }}>{proj.title}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>{proj.description}</div>
                </div>
              ))}
              {projects.length === 0 && (
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', padding: '12px' }}>
                  No projects added yet.
                </div>
              )}
            </div>
          </div>

          {/* Certifications Tracker */}
          <div className="card">
            <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '16px' }}>
              📜 Professional Certifications
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {certifications.map((cert, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'var(--bg-glass)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)' }}>{cert.name}</div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Issued by: {cert.issuingOrganization}</span>
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{new Date(cert.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })}</span>
                </div>
              ))}
              {certifications.length === 0 && (
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', padding: '12px' }}>
                  No certifications listed.
                </div>
              )}
            </div>
          </div>

          {/* Personal Information */}
          <div className="card">
            <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
              📋 Administrative Details
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Registered Email</span>
                <div style={{ color: 'var(--text-primary)', fontWeight: 500, marginTop: '2px' }}>{student.email}</div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Personal Contact</span>
                <div style={{ color: 'var(--text-primary)', fontWeight: 500, marginTop: '2px' }}>{student.contact}</div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Date of Birth</span>
                <div style={{ color: 'var(--text-primary)', fontWeight: 500, marginTop: '2px' }}>
                  {student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : 'N/A'}
                </div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Parent / Guardian</span>
                <div style={{ color: 'var(--text-primary)', fontWeight: 500, marginTop: '2px' }}>{student.parentName} ({student.parentContact})</div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Residential Address</span>
                <div style={{ color: 'var(--text-primary)', fontWeight: 500, marginTop: '2px' }}>{student.address}</div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Placement Score, Risk Predictor, Marks, Attendance, Achievements */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Dual Gauges Section: Risk Predictor & Placement readiness */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            
            {/* Student Risk Level Predictor */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderLeft: riskLevel === 'HIGH RISK' ? '5px solid var(--danger)' : riskLevel === 'MEDIUM RISK' ? '5px solid var(--warning)' : '5px solid var(--success)' }}>
              <div>
                <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', fontWeight: 600 }}>DIAGNOSTIC SYSTEM</span>
                <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '8px 0' }}>Student Risk Assessment</h3>
                
                <span className={`badge ${riskLevel === 'HIGH RISK' ? 'badge-risk-high' : riskLevel === 'MEDIUM RISK' ? 'badge-risk-medium' : 'badge-risk-low'}`} style={{ fontSize: '12px', display: 'inline-block', margin: '4px 0 12px 0' }}>
                  {riskLevel}
                </span>

                {riskReasons.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-primary)' }}>Risk Factors Detected:</div>
                    {riskReasons.map((reason, idx) => (
                      <div key={idx} style={{ fontSize: '11px', color: 'var(--danger-light)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span>•</span>
                        <span>{reason}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontSize: '11px', color: 'var(--success-light)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span>✓</span>
                    <span>No risk factors detected. Attendance & grades are stable.</span>
                  </div>
                )}
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '12px' }}>
                Calculated from live attendance, marks, and pending assignments ratio.
              </div>
            </div>

            {/* Placement Readiness Score */}
            <div className="card" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div style={{ position: 'relative', width: '90px', height: '90px' }}>
                <svg width="90" height="90" viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx="60" cy="60" r="50" fill="transparent" stroke="var(--border)" strokeWidth="8" />
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    fill="transparent"
                    stroke="var(--accent)"
                    strokeWidth="8"
                    strokeDasharray={2 * Math.PI * 50}
                    strokeDashoffset={2 * Math.PI * 50 - (placementScore / 100) * 2 * Math.PI * 50}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 1s ease' }}
                  />
                </svg>
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontWeight: 800, fontSize: '18px' }}>
                  {placementScore}%
                </div>
              </div>
              <div>
                <span style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>PLACEMENT SCORE</span>
                <h3 style={{ fontSize: '14px', fontWeight: 700, margin: '4px 0' }}>Job Eligibility</h3>
                <span className={`badge ${isPlacementReady ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '11px' }}>
                  {isPlacementReady ? 'Job Ready' : 'Needs Work'}
                </span>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>Target threshold: 70% min</div>
              </div>
            </div>

          </div>

          {/* Placement Suggestions Card */}
          <div className="card" style={{ background: 'linear-gradient(135deg, var(--bg-secondary) 0%, rgba(6,182,212,0.06) 100%)', border: '1px solid rgba(6,182,212,0.2)' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '12px', color: 'var(--accent-light)' }}>
              💼 Placement Readiness Recommendations
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {placementSuggestions.map((suggestion, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '8px', fontSize: '12px', color: 'var(--text-secondary)', alignItems: 'center' }}>
                  <span>🚀</span>
                  <span>{suggestion}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Academic Analyzer Stats */}
          {analysis && (
            <div className="card">
              <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '16px' }}>
                📊 Semester performance analytics
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '20px' }}>
                <div style={{ background: 'var(--bg-glass)', borderRadius: 'var(--radius-sm)', padding: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--success-light)' }}>{analysis.metrics.attendance}%</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>Attendance</div>
                </div>
                <div style={{ background: 'var(--bg-glass)', borderRadius: 'var(--radius-sm)', padding: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--primary-light)' }}>{analysis.metrics.marks}%</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>GPA Average</div>
                </div>
                <div style={{ background: 'var(--bg-glass)', borderRadius: 'var(--radius-sm)', padding: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--accent-light)' }}>{analysis.metrics.assignments}%</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>Assignments</div>
                </div>
              </div>

              {/* Subject Marks */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>Subject Averages:</span>
                {analysis.subjectWiseMarks.map((sm) => (
                  <div key={sm.subject}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>{sm.subject}</span>
                      <span style={{ fontWeight: 600 }}>{sm.average}%</span>
                    </div>
                    <div style={{ height: '6px', background: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          background: sm.average >= 75 ? 'var(--success)' : sm.average >= 50 ? 'var(--primary)' : 'var(--danger)',
                          width: `${sm.average}%`,
                          borderRadius: '3px',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Official Certificates / Achievements */}
          <div className="card">
            <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '16px' }}>
              📜 Generated Achievements & Certificates ({certificates.length})
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {certificates.map((cert) => (
                <div
                  key={cert._id}
                  style={{
                    padding: '12px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border)',
                    background: 'var(--bg-glass)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <span style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)', display: 'block' }}>{cert.achievement}</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{cert.course} | ID: {cert.certificateId}</span>
                  </div>
                  <button className="btn btn-secondary btn-sm no-print" onClick={() => setSelectedCert(cert)}>
                    🔍 View Certificate
                  </button>
                </div>
              ))}
              {certificates.length === 0 && (
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', padding: '16px' }}>
                  No official certificates generated for this student.
                </div>
              )}
            </div>
          </div>

          {/* Assignment Tracker */}
          <div className="card">
            <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '16px' }}>
              📚 Classroom Assignment Status
            </h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', minWidth: '400px' }}>
                <thead>
                  <tr>
                    <th>Assignment</th>
                    <th>Subject</th>
                    <th>Status</th>
                    <th>Grade / Score</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((sub: any) => (
                    <tr key={sub._id}>
                      <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                        {sub.assignment?.title || 'Class Assignment'}
                      </td>
                      <td>{sub.assignment?.subject || 'General'}</td>
                      <td>
                        <span className={`badge ${sub.status === 'Evaluated' ? 'badge-success' : sub.status === 'Submitted' ? 'badge-info' : sub.status === 'Late' ? 'badge-danger' : 'badge-warning'}`}>
                          {sub.status}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600 }}>
                        {sub.status === 'Evaluated' ? `${sub.score}/100 (${sub.grade})` : '—'}
                      </td>
                    </tr>
                  ))}
                  {submissions.length === 0 && (
                    <tr>
                      <td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '16px' }}>
                        No assignments allocated yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Fee Billing details */}
          <div className="card">
            <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '16px' }}>
              💰 Fee Transaction Summary
            </h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Payment Status</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                  <span className={`badge ${fee?.paymentStatus === 'Paid' ? 'badge-success' : 'badge-warning'}`}>
                    {fee ? fee.paymentStatus : 'Unbilled'}
                  </span>
                  <span style={{ fontSize: '13px', fontWeight: 600 }}>
                    Remaining Due: ₹{fee ? fee.remainingFee.toLocaleString('en-IN') : '0'}
                  </span>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Total Billed Fee</span>
                <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>
                  ₹{fee ? fee.totalFee.toLocaleString('en-IN') : '0'}
                </div>
              </div>
            </div>
            
            {fee && fee.history && fee.history.length > 0 && (
              <div>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '8px' }}>
                  Payment Logs:
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {fee.history.map((tx, idx) => (
                    <div key={idx} style={{ padding: '10px 12px', background: 'var(--bg-glass)', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                      <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                        Paid ₹{tx.amount.toLocaleString('en-IN')} ({tx.paymentMethod})
                      </span>
                      <span style={{ color: 'var(--text-muted)' }}>
                        {new Date(tx.date).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* 1. Skills / Profile Manager Modal */}
      {showSkillModal && (
        <div className="modal-overlay" onClick={() => setShowSkillModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px', width: '100%' }}>
            <div className="modal-header">
              <h2 className="modal-title">Upgrade Technical & Professional Profile</h2>
              <button className="modal-close" onClick={() => setShowSkillModal(false)}>×</button>
            </div>
            <form onSubmit={handleSaveSkills}>
              <div style={{ maxHeight: '420px', overflowY: 'auto', paddingRight: '6px' }}>
                
                {/* Aptitude & Communication scores */}
                <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Aptitude Practice Score (0-100)</label>
                    <input type="number" min="0" max="100" className="form-input" value={aptitudeScore} onChange={(e) => setAptitudeScore(Number(e.target.value))} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Communication Score (0-100)</label>
                    <input type="number" min="0" max="100" className="form-input" value={communicationScore} onChange={(e) => setCommunicationScore(Number(e.target.value))} required />
                  </div>
                </div>

                <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '16px 0' }} />

                {/* Skills Section */}
                <div style={{ marginBottom: '16px' }}>
                  <label className="form-label" style={{ fontWeight: 'bold' }}>Skills Tracker</label>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                    <input type="text" placeholder="e.g. Java, Python, SQL" className="form-input" value={newSkillName} onChange={(e) => setNewSkillName(e.target.value)} />
                    <select className="form-select" value={newSkillLevel} onChange={(e) => setNewSkillLevel(e.target.value as any)} style={{ width: '140px' }}>
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                    <button type="button" className="btn btn-primary btn-sm" onClick={addSkill}>Add</button>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {skills.map((skill, idx) => (
                      <span key={idx} className="badge badge-info" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {skill.name} ({skill.level})
                        <button type="button" onClick={() => removeSkill(idx)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '12px', padding: 0 }}>×</button>
                      </span>
                    ))}
                  </div>
                </div>

                <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '16px 0' }} />

                {/* Projects Section */}
                <div style={{ marginBottom: '16px' }}>
                  <label className="form-label" style={{ fontWeight: 'bold' }}>Featured Projects</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '8px' }}>
                    <input type="text" placeholder="Project Title" className="form-input" value={newProjTitle} onChange={(e) => setNewProjTitle(e.target.value)} />
                    <input type="text" placeholder="Brief Description" className="form-input" value={newProjDesc} onChange={(e) => setNewProjDesc(e.target.value)} />
                    <button type="button" className="btn btn-primary btn-sm" style={{ alignSelf: 'flex-end' }} onClick={addProject}>Add Project</button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {projects.map((proj, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 12px', background: 'var(--bg-glass)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                        <span style={{ fontSize: '12px' }}>{proj.title}</span>
                        <button type="button" className="btn btn-danger btn-sm" onClick={() => removeProject(idx)}>🗑️</button>
                      </div>
                    ))}
                  </div>
                </div>

                <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '16px 0' }} />

                {/* Certifications Section */}
                <div style={{ marginBottom: '16px' }}>
                  <label className="form-label" style={{ fontWeight: 'bold' }}>Certifications</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '8px' }}>
                    <input type="text" placeholder="Certification Name" className="form-input" value={newCertName} onChange={(e) => setNewCertName(e.target.value)} />
                    <input type="text" placeholder="Issuing Organization" className="form-input" value={newCertOrg} onChange={(e) => setNewCertOrg(e.target.value)} />
                    <button type="button" className="btn btn-primary btn-sm" style={{ alignSelf: 'flex-end' }} onClick={addCert}>Add Certificate</button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {certifications.map((cert, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 12px', background: 'var(--bg-glass)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                        <span style={{ fontSize: '12px' }}>{cert.name} ({cert.issuingOrganization})</span>
                        <button type="button" className="btn btn-danger btn-sm" onClick={() => removeCert(idx)}>🗑️</button>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowSkillModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={savingSkills}>
                  {savingSkills ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Certificate Viewer Modal */}
      {selectedCert && (
        <div className="modal-overlay" onClick={() => setSelectedCert(null)} style={{ zIndex: 1100 }}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '850px', background: 'white', padding: '30px' }}>
            <div className="modal-header no-print">
              <h2 className="modal-title" style={{ color: '#1e293b' }}>Certificate Document Viewer</h2>
              <button className="modal-close" style={{ color: '#1e293b' }} onClick={() => setSelectedCert(null)}>×</button>
            </div>
            
            {/* The Certificate UI itself */}
            <div className="certificate-preview-container">
              <div className="certificate-card" id="printable-certificate-card">
                <div className="certificate-border-accent"></div>
                
                <div>
                  <div className="certificate-header">{selectedCert.collegeName}</div>
                  <div className="certificate-subheader">Certificate of Achievement</div>
                </div>

                <div className="certificate-text-present">This is proudly presented to</div>
                <div className="certificate-name">{selectedCert.studentName}</div>
                
                <div className="certificate-achievement">
                  For outstanding accomplishment and successful participation in <span style={{ fontWeight: 'bold' }}>{selectedCert.course}</span>, specifically recognized for <span style={{ fontWeight: 'bold', color: '#b45309' }}>{selectedCert.achievement}</span>.
                </div>

                <div className="certificate-footer">
                  <div className="certificate-sig">
                    <span className="certificate-sig-img">Dr. J. Arnold</span>
                    <span>Dean of Academics</span>
                  </div>
                  <div className="certificate-seal">
                    Official Seal
                  </div>
                  <div className="certificate-sig">
                    <span className="certificate-sig-img">{selectedCert.generatedBy}</span>
                    <span>Authorized Signature</span>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', fontSize: '11px', color: '#94a3b8', fontFamily: 'monospace' }}>
                  <span>Issue Date: {new Date(selectedCert.date).toLocaleDateString()}</span>
                  <span>ID: {selectedCert.certificateId}</span>
                </div>

              </div>
            </div>

            <div className="modal-footer no-print" style={{ borderTop: '1px solid #e2e8f0', marginTop: '20px', paddingTop: '15px' }}>
              <button className="btn btn-secondary" style={{ color: '#1e293b', border: '1px solid #cbd5e1' }} onClick={() => setSelectedCert(null)}>Close</button>
              <button className="btn btn-primary" onClick={() => window.print()}>🖨️ Print / Download PDF</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
