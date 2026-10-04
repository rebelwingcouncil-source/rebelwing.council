'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app') ? 'https://backend-three-theta-89.vercel.app' : 'http://localhost:5000');

export default function AdminDashboard() {
  const [activeRole, setActiveRole] = useState('super_admin'); // super_admin, lawyer, paralegal, intern
  const [activeTab, setActiveTab] = useState('consultations'); // consultations, jobs, internships, leads, matters, deadlines, documents, research, intern
  
  // Data States
  const [consultations, setConsultations] = useState([]);
  const [jobApplications, setJobApplications] = useState([]);
  const [internApplications, setInternApplications] = useState([]);
  const [leads, setLeads] = useState([]);
  const [matters, setMatters] = useState([]);
  const [deadlines, setDeadlines] = useState([]);
  const [docRequests, setDocRequests] = useState([]);
  const [researchTasks, setResearchTasks] = useState([]);
  const [knowledgeBase, setKnowledgeBase] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modal States
  const [selectedItem, setSelectedItem] = useState(null); // for viewing full submission details
  const [selectedType, setSelectedType] = useState(''); // 'consultation', 'job', 'internship', 'lead'

  const [isNewMatterOpen, setIsNewMatterOpen] = useState(false);
  const [newMatterTitle, setNewMatterTitle] = useState('');
  const [newMatterCategory, setNewMatterCategory] = useState('Corporate Restructuring');

  const [isNewResearchOpen, setIsNewResearchOpen] = useState(false);
  const [researchQuestion, setResearchQuestion] = useState('');
  const [researchAct, setResearchAct] = useState('Companies Act 2013 / NCLAT Precedents');

  // Intern Daily Log State
  const [internLogText, setInternLogText] = useState('');
  const [internHours, setInternHours] = useState('8');
  const [internLogSuccess, setInternLogSuccess] = useState(false);

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [currentUser, setCurrentUser] = useState({
    email: 'admin@rebelwingcouncil.com',
    full_name: 'Adv. Rajeshwar Sharma',
    role: 'super_admin',
    designation: 'Managing Partner & Senior Advocate'
  });
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const handleLogin = async (e, quickEmail, quickPassword) => {
    if (e) e.preventDefault();
    const emailToUse = quickEmail || loginEmail;
    const passToUse = quickPassword || loginPassword;
    setLoginLoading(true);
    setLoginError('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailToUse, password: passToUse })
      });
      const data = await res.json();
      if (data.success) {
        setIsAuthenticated(true);
        setCurrentUser(data.user);
        setActiveRole(data.user.role);
        if (data.user.role === 'intern') setActiveTab('intern');
        else setActiveTab('consultations');
      } else {
        setLoginError(data.error || 'Authentication failed');
      }
    } catch {
      setLoginError('Unable to connect to authentication server.');
    } finally {
      setLoginLoading(false);
    }
  };

  // Fetch all live data from backend
  const loadData = async () => {
    setIsRefreshing(true);
    try {
      const [
        consultsRes,
        jobsRes,
        internsRes,
        leadsRes,
        mattersRes,
        deadlinesRes,
        docsRes,
        researchRes,
        kbRes
      ] = await Promise.all([
        fetch(`${API_BASE_URL}/api/consultations`).then(r => r.json()).catch(() => ({ consultations: [] })),
        fetch(`${API_BASE_URL}/api/applications?type=job`).then(r => r.json()).catch(() => ({ applications: [] })),
        fetch(`${API_BASE_URL}/api/applications?type=internship`).then(r => r.json()).catch(() => ({ applications: [] })),
        fetch(`${API_BASE_URL}/api/leads`).then(r => r.json()).catch(() => ({ leads: [] })),
        fetch(`${API_BASE_URL}/api/matters`).then(r => r.json()).catch(() => ({ matters: [] })),
        fetch(`${API_BASE_URL}/api/deadlines`).then(r => r.json()).catch(() => ({ deadlines: { overdue: [], today: [], upcoming: [] } })),
        fetch(`${API_BASE_URL}/api/document-requests`).then(r => r.json()).catch(() => ({ requests: [] })),
        fetch(`${API_BASE_URL}/api/research-tasks`).then(r => r.json()).catch(() => ({ tasks: [] })),
        fetch(`${API_BASE_URL}/api/knowledge-base`).then(r => r.json()).catch(() => ({ precedents: [] })),
      ]);

      setConsultations(consultsRes.consultations || []);
      setJobApplications(jobsRes.applications || []);
      setInternApplications(internsRes.applications || []);
      setLeads(leadsRes.leads || []);
      setMatters(mattersRes.matters || []);
      
      const allDeadlines = [
        ...(deadlinesRes.deadlines?.overdue || []),
        ...(deadlinesRes.deadlines?.today || []),
        ...(deadlinesRes.deadlines?.upcoming || [])
      ];
      setDeadlines(allDeadlines);
      setDocRequests(docsRes.requests || []);
      setResearchTasks(researchRes.tasks || []);
      setKnowledgeBase(kbRes.precedents || []);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
    // Auto refresh every 30 seconds
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Update Status Handlers
  const handleUpdateConsultationStatus = async (id, status) => {
    try {
      await fetch(`${API_BASE_URL}/api/consultations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      loadData();
      if (selectedItem && selectedItem.id === id) {
        setSelectedItem(prev => ({ ...prev, status }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateApplicationStatus = async (id, status) => {
    try {
      await fetch(`${API_BASE_URL}/api/applications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      loadData();
      if (selectedItem && selectedItem.id === id) {
        setSelectedItem(prev => ({ ...prev, status }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateLeadStatus = async (id, status) => {
    try {
      await fetch(`${API_BASE_URL}/api/leads/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      loadData();
      if (selectedItem && selectedItem.id === id) {
        setSelectedItem(prev => ({ ...prev, status }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateDocStatus = async (id, status) => {
    try {
      await fetch(`${API_BASE_URL}/api/document-requests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  if (!isAuthenticated) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: 'var(--admin-navy-dark)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        backgroundImage: 'radial-gradient(circle at 50% 20%, rgba(212, 175, 55, 0.08), transparent 70%)'
      }}>
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '460px',
          padding: '2.5rem',
          boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
          border: '1.5px solid var(--admin-border-gold)'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <Image src="/logo.jpg" alt="Logo" width={64} height={64} style={{ borderRadius: '50%', border: '2px solid var(--admin-gold)', marginBottom: '0.75rem' }} />
            <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--admin-navy)', fontSize: '1.4rem', fontWeight: 700, margin: '0 0 0.25rem' }}>
              REBEL WING COUNCIL
            </h2>
            <div style={{ fontSize: '0.75rem', color: 'var(--admin-gold-dark)', fontWeight: 600, letterSpacing: '0.12em' }}>
              LAW FIRM OPERATING SYSTEM
            </div>
          </div>

          {loginError && (
            <div style={{ backgroundColor: '#FEE2E2', color: '#991B1B', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.25rem', fontSize: '0.85rem', textAlign: 'center' }}>
              {loginError}
            </div>
          )}

          <form onSubmit={e => handleLogin(e)}>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--admin-navy)', marginBottom: '0.35rem' }}>
                Firm Email Address
              </label>
              <input
                type="email"
                required
                placeholder="e.g. admin@rebelwingcouncil.com"
                value={loginEmail}
                onChange={e => setLoginEmail(e.target.value)}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--admin-border)', fontSize: '0.9rem' }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--admin-navy)', marginBottom: '0.35rem' }}>
                Secure Password
              </label>
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={loginPassword}
                onChange={e => setLoginPassword(e.target.value)}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--admin-border)', fontSize: '0.9rem' }}
              />
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              style={{
                width: '100%',
                backgroundColor: 'var(--admin-navy)',
                color: '#FFFFFF',
                border: '1px solid var(--admin-gold)',
                padding: '0.85rem',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.95rem',
                cursor: 'pointer'
              }}
            >
              {loginLoading ? 'Authenticating...' : 'Sign In to Council OS →'}
            </button>
          </form>

          {/* Quick Sign-In Buttons */}
          <div style={{ marginTop: '1.75rem', borderTop: '1px solid var(--admin-border)', paddingTop: '1.25rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)', textAlign: 'center', marginBottom: '0.75rem' }}>
              Quick Demo Access:
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={e => handleLogin(e, 'admin@rebelwingcouncil.com', 'Admin@RebelWing2026')}
                style={{ padding: '0.5rem', fontSize: '0.75rem', background: '#F8FAFC', border: '1px solid var(--admin-border)', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
              >
                Managing Partner
              </button>
              <button
                type="button"
                onClick={e => handleLogin(e, 'priya.d@rebelwingcouncil.com', 'Lawyer@RebelWing2026')}
                style={{ padding: '0.5rem', fontSize: '0.75rem', background: '#F8FAFC', border: '1px solid var(--admin-border)', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
              >
                Corporate Partner
              </button>
            </div>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--admin-bg)' }}>
      
      {/* ========================================================= */}
      {/* 1. SIDEBAR NAVIGATION */}
      {/* ========================================================= */}
      <aside style={{
        width: '275px',
        backgroundColor: 'var(--admin-navy-dark)',
        color: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        borderRight: '1px solid var(--admin-border-gold)',
        flexShrink: 0
      }}>
        {/* Brand Header */}
        <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <Image src="/logo.jpg" alt="Logo" width={42} height={42} style={{ borderRadius: '50%', border: '1.5px solid var(--admin-gold)' }} />
          <div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.05rem', fontWeight: 700, color: '#FFFFFF', lineHeight: 1.1 }}>
              REBEL WING
            </div>
            <div style={{ fontSize: '0.62rem', color: 'var(--admin-gold-light)', letterSpacing: '0.12em' }}>
              ADMIN OPERATING SYSTEM
            </div>
          </div>
        </div>

        {/* Section Label: User Submissions Hub */}
        <div style={{ padding: '1rem 1.25rem 0.35rem', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em', color: 'var(--admin-gold-light)', textTransform: 'uppercase' }}>
          User Website Ingestion
        </div>

        {/* Navigation Items (Submissions First) */}
        <nav style={{ padding: '0 0.75rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.3rem', flex: 1, overflowY: 'auto' }}>
          
          {/* Tab 1: Client Consultation Bookings */}
          <button
            onClick={() => setActiveTab('consultations')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: activeTab === 'consultations' ? 'var(--admin-navy-surface)' : 'transparent',
              color: activeTab === 'consultations' ? 'var(--admin-gold-light)' : '#CBD5E1',
              fontWeight: activeTab === 'consultations' ? 700 : 500,
              fontSize: '0.85rem',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              📋 Client Bookings
            </span>
            <span style={{
              backgroundColor: activeTab === 'consultations' ? 'var(--admin-gold)' : 'rgba(255,255,255,0.1)',
              color: activeTab === 'consultations' ? 'var(--admin-navy-dark)' : '#FFF',
              padding: '0.15rem 0.5rem',
              borderRadius: '999px',
              fontSize: '0.72rem',
              fontWeight: 700
            }}>
              {consultations.length}
            </span>
          </button>

          {/* Tab 2: ATS Job Applications */}
          <button
            onClick={() => setActiveTab('jobs')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: activeTab === 'jobs' ? 'var(--admin-navy-surface)' : 'transparent',
              color: activeTab === 'jobs' ? 'var(--admin-gold-light)' : '#CBD5E1',
              fontWeight: activeTab === 'jobs' ? 700 : 500,
              fontSize: '0.85rem',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              💼 Job Applications
            </span>
            <span style={{
              backgroundColor: activeTab === 'jobs' ? 'var(--admin-gold)' : 'rgba(255,255,255,0.1)',
              color: activeTab === 'jobs' ? 'var(--admin-navy-dark)' : '#FFF',
              padding: '0.15rem 0.5rem',
              borderRadius: '999px',
              fontSize: '0.72rem',
              fontWeight: 700
            }}>
              {jobApplications.length}
            </span>
          </button>

          {/* Tab 3: Internship ATS */}
          <button
            onClick={() => setActiveTab('internships')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: activeTab === 'internships' ? 'var(--admin-navy-surface)' : 'transparent',
              color: activeTab === 'internships' ? 'var(--admin-gold-light)' : '#CBD5E1',
              fontWeight: activeTab === 'internships' ? 700 : 500,
              fontSize: '0.85rem',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              🎓 Internship ATS
            </span>
            <span style={{
              backgroundColor: activeTab === 'internships' ? 'var(--admin-gold)' : 'rgba(255,255,255,0.1)',
              color: activeTab === 'internships' ? 'var(--admin-navy-dark)' : '#FFF',
              padding: '0.15rem 0.5rem',
              borderRadius: '999px',
              fontSize: '0.72rem',
              fontWeight: 700
            }}>
              {internApplications.length}
            </span>
          </button>

          {/* Tab 4: CRM Leads & Inquiries */}
          <button
            onClick={() => setActiveTab('leads')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: activeTab === 'leads' ? 'var(--admin-navy-surface)' : 'transparent',
              color: activeTab === 'leads' ? 'var(--admin-gold-light)' : '#CBD5E1',
              fontWeight: activeTab === 'leads' ? 700 : 500,
              fontSize: '0.85rem',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              🎯 CRM &amp; Inquiries
            </span>
            <span style={{
              backgroundColor: activeTab === 'leads' ? 'var(--admin-gold)' : 'rgba(255,255,255,0.1)',
              color: activeTab === 'leads' ? 'var(--admin-navy-dark)' : '#FFF',
              padding: '0.15rem 0.5rem',
              borderRadius: '999px',
              fontSize: '0.72rem',
              fontWeight: 700
            }}>
              {leads.length}
            </span>
          </button>

          {/* Section Label: Legal Practice Operations */}
          <div style={{ padding: '1.25rem 0.5rem 0.35rem', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>
            Practice Operations
          </div>

          <button
            onClick={() => setActiveTab('matters')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: activeTab === 'matters' ? 'var(--admin-navy-surface)' : 'transparent',
              color: activeTab === 'matters' ? 'var(--admin-gold-light)' : '#94A3B8',
              fontWeight: activeTab === 'matters' ? 700 : 500,
              fontSize: '0.85rem',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <span>⚖️ Active Matters</span>
            <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>{matters.length}</span>
          </button>

          <button
            onClick={() => setActiveTab('deadlines')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: activeTab === 'deadlines' ? 'var(--admin-navy-surface)' : 'transparent',
              color: activeTab === 'deadlines' ? 'var(--admin-gold-light)' : '#94A3B8',
              fontWeight: activeTab === 'deadlines' ? 700 : 500,
              fontSize: '0.85rem',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <span>📅 Deadlines &amp; Calendar</span>
            <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>{deadlines.length}</span>
          </button>

          <button
            onClick={() => setActiveTab('documents')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: activeTab === 'documents' ? 'var(--admin-navy-surface)' : 'transparent',
              color: activeTab === 'documents' ? 'var(--admin-gold-light)' : '#94A3B8',
              fontWeight: activeTab === 'documents' ? 700 : 500,
              fontSize: '0.85rem',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <span>📁 Client Documents</span>
            <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>{docRequests.length}</span>
          </button>

          <button
            onClick={() => setActiveTab('research')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: activeTab === 'research' ? 'var(--admin-navy-surface)' : 'transparent',
              color: activeTab === 'research' ? 'var(--admin-gold-light)' : '#94A3B8',
              fontWeight: activeTab === 'research' ? 700 : 500,
              fontSize: '0.85rem',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <span>📚 Research &amp; Precedents</span>
            <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>{knowledgeBase.length}</span>
          </button>

          <button
            onClick={() => setActiveTab('intern')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: activeTab === 'intern' ? 'var(--admin-navy-surface)' : 'transparent',
              color: activeTab === 'intern' ? 'var(--admin-gold-light)' : '#94A3B8',
              fontWeight: activeTab === 'intern' ? 700 : 500,
              fontSize: '0.85rem',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <span>🎓 Intern Daily Log</span>
          </button>
        </nav>

        {/* Sidebar Footer */}
        <div style={{ padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', fontSize: '0.75rem', color: '#94A3B8' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
            <span>Database:</span>
            <span style={{ color: '#22C55E', fontWeight: 600 }}>● PostgreSQL Live</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>Airtable Sync:</span>
            <a
              href="https://airtable.com/applCjQYUgSTHSXcg"
              target="_blank"
              rel="noreferrer"
              style={{ color: '#38BDF8', fontWeight: 600, textDecoration: 'none' }}
            >
              Base Live ↗
            </a>
          </div>
        </div>
      </aside>

      {/* ========================================================= */}
      {/* 2. MAIN WORKSPACE */}
      {/* ========================================================= */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        
        {/* Top Header */}
        <header style={{
          backgroundColor: '#FFFFFF',
          padding: '1rem 2rem',
          borderBottom: '1px solid var(--admin-border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <h1 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--admin-navy)', margin: 0 }}>
              {activeTab === 'consultations' ? '📋 Client Consultations & Appointment Requests' :
               activeTab === 'jobs' ? '💼 Legal Executive Job Applications (ATS)' :
               activeTab === 'internships' ? '🎓 Internship Applications & Candidates (ATS)' :
               activeTab === 'leads' ? '🎯 Website Leads & Contact Inquiries' :
               activeTab === 'matters' ? '⚖️ Active Legal Matters & Case Registry' :
               activeTab === 'deadlines' ? '📅 Statutory Deadlines & Calendar' :
               activeTab === 'documents' ? '📁 Client Document Checklists' :
               activeTab === 'research' ? '📚 Assigned Legal Research & Precedents' : '🎓 Intern Sandbox Workspace'}
            </h1>
            <div style={{ fontSize: '0.78rem', color: 'var(--admin-text-muted)', marginTop: '2px' }}>
              Live ingestion from User Portal &bull; PostgreSQL 17.11 Connected &bull; Real-time ATS sync
            </div>
          </div>

          {/* Quick Actions & Role Switcher */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            
            {/* Refresh Button */}
            <button
              onClick={loadData}
              disabled={isRefreshing}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.45rem 0.85rem',
                borderRadius: '8px',
                border: '1px solid var(--admin-border)',
                backgroundColor: '#FFFFFF',
                color: 'var(--admin-navy)',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
              title="Refresh all submissions from database"
            >
              <span>{isRefreshing ? '⏳' : '⚡'}</span>
              <span>{isRefreshing ? 'Refreshing...' : 'Refresh Live Data'}</span>
            </button>

            {/* Role Switcher */}
            <select
              value={activeRole}
              onChange={e => {
                setActiveRole(e.target.value);
                if (e.target.value === 'intern') setActiveTab('intern');
                else if (activeTab === 'intern') setActiveTab('consultations');
              }}
              style={{
                padding: '0.45rem 0.85rem',
                borderRadius: '8px',
                border: '1.5px solid var(--admin-border-gold)',
                fontSize: '0.82rem',
                fontWeight: 600,
                color: 'var(--admin-navy)',
                backgroundColor: '#FFFFFF',
                cursor: 'pointer'
              }}
            >
              <option value="super_admin">Adv. Rajeshwar Sharma (Managing Partner)</option>
              <option value="lawyer">Adv. Priya Deshmukh (Partner - Corporate)</option>
              <option value="paralegal">Neha Verma (Senior Legal Executive)</option>
              <option value="intern">Arjun Mehta (Research Intern)</option>
            </select>

            <button
              onClick={() => {
                setIsAuthenticated(false);
                setLoginError('');
              }}
              style={{
                padding: '0.45rem 0.85rem',
                borderRadius: '8px',
                border: '1px solid #FECACA',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: '#DC2626',
                backgroundColor: '#FEF2F2',
                cursor: 'pointer'
              }}
            >
              Sign Out
            </button>
          </div>
        </header>

        {/* Dashboard Body */}
        <main style={{ padding: '2rem', flex: 1, overflowY: 'auto' }}>
          
          {/* Top Metric Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem', marginBottom: '2rem' }}>
            
            <div
              onClick={() => setActiveTab('consultations')}
              style={{
                backgroundColor: '#FFFFFF',
                padding: '1.25rem',
                borderRadius: '12px',
                border: activeTab === 'consultations' ? '2px solid var(--admin-gold)' : '1px solid var(--admin-border)',
                boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                cursor: 'pointer'
              }}
            >
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--admin-text-muted)' }}>CLIENT CONSULTATIONS</div>
              <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--admin-navy)', marginTop: '0.25rem' }}>
                {consultations.length}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#16A34A', marginTop: '0.25rem', fontWeight: 600 }}>
                ● Real-time client bookings
              </div>
            </div>

            <div
              onClick={() => setActiveTab('jobs')}
              style={{
                backgroundColor: '#FFFFFF',
                padding: '1.25rem',
                borderRadius: '12px',
                border: activeTab === 'jobs' ? '2px solid var(--admin-gold)' : '1px solid var(--admin-border)',
                boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                cursor: 'pointer'
              }}
            >
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--admin-text-muted)' }}>JOB APPLICATIONS (ATS)</div>
              <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#B45309', marginTop: '0.25rem' }}>
                {jobApplications.length}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#B45309', marginTop: '0.25rem', fontWeight: 600 }}>
                ● Full-time legal candidates
              </div>
            </div>

            <div
              onClick={() => setActiveTab('internships')}
              style={{
                backgroundColor: '#FFFFFF',
                padding: '1.25rem',
                borderRadius: '12px',
                border: activeTab === 'internships' ? '2px solid var(--admin-gold)' : '1px solid var(--admin-border)',
                boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                cursor: 'pointer'
              }}
            >
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--admin-text-muted)' }}>INTERNSHIP CANDIDATES</div>
              <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#2563EB', marginTop: '0.25rem' }}>
                {internApplications.length}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#2563EB', marginTop: '0.25rem', fontWeight: 600 }}>
                ● University trainee profiles
              </div>
            </div>

            <div
              onClick={() => setActiveTab('leads')}
              style={{
                backgroundColor: '#FFFFFF',
                padding: '1.25rem',
                borderRadius: '12px',
                border: activeTab === 'leads' ? '2px solid var(--admin-gold)' : '1px solid var(--admin-border)',
                boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                cursor: 'pointer'
              }}
            >
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--admin-text-muted)' }}>TOTAL CRM LEADS &amp; MSGS</div>
              <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--admin-gold-dark)', marginTop: '0.25rem' }}>
                {leads.length}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--admin-text-muted)', marginTop: '0.25rem', fontWeight: 600 }}>
                ● Website &amp; contact form
              </div>
            </div>

          </div>

          {/* ========================================================= */}
          {/* TAB 1: CLIENT CONSULTATION BOOKINGS */}
          {/* ========================================================= */}
          {activeTab === 'consultations' && (
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid var(--admin-border)', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
              
              <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--admin-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--admin-navy)', margin: 0 }}>
                    Client Consultation Requests ({consultations.length})
                  </h2>
                  <div style={{ fontSize: '0.78rem', color: 'var(--admin-text-muted)', marginTop: '2px' }}>
                    Appointments booked by clients via user website with preferred date, time slot, mode, and matter notes.
                  </div>
                </div>

                <a
                  href="https://airtable.com/applCjQYUgSTHSXcg"
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    backgroundColor: '#0284C7',
                    color: '#FFFFFF',
                    padding: '0.45rem 0.9rem',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem'
                  }}
                >
                  ⚡ Open Airtable CRM ↗
                </a>
              </div>

              {consultations.length === 0 ? (
                <div style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--admin-text-muted)' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📋</div>
                  <div style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--admin-navy)' }}>No consultation requests yet</div>
                  <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
                    Submissions from the user website consultation modal will instantly appear here with full date, time, and client notes.
                  </p>
                </div>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Client Name</th>
                      <th>Contact Details</th>
                      <th>Practice Area</th>
                      <th>Scheduled Slot</th>
                      <th>Mode</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {consultations.map((c, idx) => (
                      <tr key={idx}>
                        <td>
                          <div style={{ fontWeight: 700, color: 'var(--admin-navy)' }}>{c.client_name}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--admin-text-muted)' }}>
                            Submitted: {new Date(c.created_at || Date.now()).toLocaleDateString()}
                          </div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{c.email}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--admin-text-muted)' }}>{c.phone}</div>
                        </td>
                        <td>
                          <span className="badge badge-gold">{c.practice_area || 'General Legal Advice'}</span>
                        </td>
                        <td>
                          <div style={{ fontWeight: 700, color: 'var(--admin-navy)' }}>
                            📅 {c.consultation_date ? new Date(c.consultation_date).toLocaleDateString() : 'TBD'}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--admin-text-muted)' }}>
                            ⏰ {c.time_slot}
                          </div>
                        </td>
                        <td>
                          <span className="badge badge-info">{c.mode}</span>
                        </td>
                        <td>
                          <select
                            value={c.status || 'Scheduled'}
                            onChange={e => handleUpdateConsultationStatus(c.id, e.target.value)}
                            style={{
                              padding: '0.3rem 0.5rem',
                              borderRadius: '6px',
                              border: '1px solid var(--admin-border)',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              backgroundColor: c.status === 'Completed' ? '#DCFCE7' : c.status === 'Confirmed' ? '#DBEAFE' : '#FEF3C7',
                              color: c.status === 'Completed' ? '#15803D' : c.status === 'Confirmed' ? '#1D4ED8' : '#B45309',
                              cursor: 'pointer'
                            }}
                          >
                            <option value="Scheduled">Scheduled</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td>
                          <button
                            onClick={() => {
                              setSelectedItem(c);
                              setSelectedType('consultation');
                            }}
                            style={{
                              padding: '0.35rem 0.75rem',
                              backgroundColor: 'var(--admin-navy)',
                              color: '#FFFFFF',
                              border: 'none',
                              borderRadius: '6px',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              cursor: 'pointer'
                            }}
                          >
                            View Details 🔍
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 2: JOB APPLICATIONS (ATS) */}
          {/* ========================================================= */}
          {activeTab === 'jobs' && (
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid var(--admin-border)', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
              
              <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--admin-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--admin-navy)', margin: 0 }}>
                    Legal Executive Job Applications ({jobApplications.length})
                  </h2>
                  <div style={{ fontSize: '0.78rem', color: 'var(--admin-text-muted)', marginTop: '2px' }}>
                    Applicants submitted through website ATS with Bar Council registration and practice experience.
                  </div>
                </div>
              </div>

              {jobApplications.length === 0 ? (
                <div style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--admin-text-muted)' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>💼</div>
                  <div style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--admin-navy)' }}>No job applications yet</div>
                  <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
                    Lawyers applying on the website ATS under Full-Time Legal Executive will appear here automatically.
                  </p>
                </div>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Candidate Name</th>
                      <th>Contact Details</th>
                      <th>Role Applied</th>
                      <th>Bar Council / Qualification</th>
                      <th>Experience / Notes</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobApplications.map((app, idx) => (
                      <tr key={idx}>
                        <td>
                          <div style={{ fontWeight: 700, color: 'var(--admin-navy)' }}>{app.name}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--admin-text-muted)' }}>
                            {new Date(app.created_at || Date.now()).toLocaleDateString()}
                          </div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{app.email}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--admin-text-muted)' }}>{app.phone}</div>
                        </td>
                        <td>
                          <span className="badge badge-gold">{app.role}</span>
                        </td>
                        <td style={{ fontWeight: 600, color: 'var(--admin-navy)' }}>
                          {app.qualification || 'Bar Enrolled'}
                        </td>
                        <td>
                          <div style={{ maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.8rem' }}>
                            {app.resume_notes || app.experience || 'Submitted via ATS'}
                          </div>
                        </td>
                        <td>
                          <select
                            value={app.status || 'New'}
                            onChange={e => handleUpdateApplicationStatus(app.id, e.target.value)}
                            style={{
                              padding: '0.3rem 0.5rem',
                              borderRadius: '6px',
                              border: '1px solid var(--admin-border)',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              backgroundColor: app.status === 'Shortlisted' ? '#DCFCE7' : app.status === 'Interview Scheduled' ? '#DBEAFE' : app.status === 'Rejected' ? '#FEE2E2' : '#FEF3C7',
                              color: app.status === 'Shortlisted' ? '#15803D' : app.status === 'Interview Scheduled' ? '#1D4ED8' : app.status === 'Rejected' ? '#B91C1C' : '#B45309',
                              cursor: 'pointer'
                            }}
                          >
                            <option value="New">New</option>
                            <option value="Under Review">Under Review</option>
                            <option value="Shortlisted">Shortlisted</option>
                            <option value="Interview Scheduled">Interview Scheduled</option>
                            <option value="Hired">Hired</option>
                            <option value="Rejected">Rejected</option>
                          </select>
                        </td>
                        <td>
                          <button
                            onClick={() => {
                              setSelectedItem(app);
                              setSelectedType('job');
                            }}
                            style={{
                              padding: '0.35rem 0.75rem',
                              backgroundColor: 'var(--admin-navy)',
                              color: '#FFFFFF',
                              border: 'none',
                              borderRadius: '6px',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              cursor: 'pointer'
                            }}
                          >
                            Inspect Candidate 🔍
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 3: INTERNSHIP APPLICATIONS (ATS) */}
          {/* ========================================================= */}
          {activeTab === 'internships' && (
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid var(--admin-border)', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
              
              <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--admin-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--admin-navy)', margin: 0 }}>
                    Internship Program Applications ({internApplications.length})
                  </h2>
                  <div style={{ fontSize: '0.78rem', color: 'var(--admin-text-muted)', marginTop: '2px' }}>
                    Law students and graduates applying for mentored internship positions at Rebel Wing Council.
                  </div>
                </div>
              </div>

              {internApplications.length === 0 ? (
                <div style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--admin-text-muted)' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🎓</div>
                  <div style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--admin-navy)' }}>No internship applications yet</div>
                  <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
                    Law school candidates applying under the Internship Program will be automatically collected here.
                  </p>
                </div>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Intern Candidate</th>
                      <th>Contact Details</th>
                      <th>University / Law College</th>
                      <th>Application Notes</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {internApplications.map((intern, idx) => (
                      <tr key={idx}>
                        <td>
                          <div style={{ fontWeight: 700, color: 'var(--admin-navy)' }}>{intern.name}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--admin-text-muted)' }}>
                            {new Date(intern.created_at || Date.now()).toLocaleDateString()}
                          </div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{intern.email}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--admin-text-muted)' }}>{intern.phone}</div>
                        </td>
                        <td style={{ fontWeight: 600, color: 'var(--admin-navy)' }}>
                          {intern.qualification || 'Law Student'}
                        </td>
                        <td>
                          <div style={{ maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.8rem' }}>
                            {intern.resume_notes || intern.experience || 'Mentorship Application'}
                          </div>
                        </td>
                        <td>
                          <select
                            value={intern.status || 'New'}
                            onChange={e => handleUpdateApplicationStatus(intern.id, e.target.value)}
                            style={{
                              padding: '0.3rem 0.5rem',
                              borderRadius: '6px',
                              border: '1px solid var(--admin-border)',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              backgroundColor: intern.status === 'Shortlisted' ? '#DCFCE7' : intern.status === 'Interview Scheduled' ? '#DBEAFE' : intern.status === 'Rejected' ? '#FEE2E2' : '#FEF3C7',
                              color: intern.status === 'Shortlisted' ? '#15803D' : intern.status === 'Interview Scheduled' ? '#1D4ED8' : intern.status === 'Rejected' ? '#B91C1C' : '#B45309',
                              cursor: 'pointer'
                            }}
                          >
                            <option value="New">New</option>
                            <option value="Under Review">Under Review</option>
                            <option value="Shortlisted">Shortlisted</option>
                            <option value="Interview Scheduled">Interview Scheduled</option>
                            <option value="Selected">Selected</option>
                            <option value="Rejected">Rejected</option>
                          </select>
                        </td>
                        <td>
                          <button
                            onClick={() => {
                              setSelectedItem(intern);
                              setSelectedType('internship');
                            }}
                            style={{
                              padding: '0.35rem 0.75rem',
                              backgroundColor: 'var(--admin-navy)',
                              color: '#FFFFFF',
                              border: 'none',
                              borderRadius: '6px',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              cursor: 'pointer'
                            }}
                          >
                            Inspect Candidate 🔍
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 4: CRM LEADS & WEBSITE INQUIRIES */}
          {/* ========================================================= */}
          {activeTab === 'leads' && (
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid var(--admin-border)', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
              
              <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--admin-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--admin-navy)', margin: 0 }}>
                    CRM Website Leads &amp; Direct Messages ({leads.length})
                  </h2>
                  <div style={{ fontSize: '0.78rem', color: 'var(--admin-text-muted)', marginTop: '2px' }}>
                    All user inquiries submitted through contact forms, consultation requests, or AI triage.
                  </div>
                </div>

                <a
                  href="https://airtable.com/applCjQYUgSTHSXcg"
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    backgroundColor: '#0284C7',
                    color: '#FFFFFF',
                    padding: '0.45rem 0.9rem',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem'
                  }}
                >
                  ⚡ Open in Airtable CRM ↗
                </a>
              </div>

              {leads.length === 0 ? (
                <div style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--admin-text-muted)' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🎯</div>
                  <div style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--admin-navy)' }}>No CRM leads recorded yet</div>
                  <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
                    Any message entered on the website contact form or consultation scheduler will populate here in real-time.
                  </p>
                </div>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Lead Name</th>
                      <th>Contact Details</th>
                      <th>Service / Subject</th>
                      <th>Message Details</th>
                      <th>Source</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads.map((l, idx) => (
                      <tr key={idx}>
                        <td>
                          <div style={{ fontWeight: 700, color: 'var(--admin-navy)' }}>{l.name}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--admin-text-muted)' }}>
                            {new Date(l.created_at || Date.now()).toLocaleDateString()}
                          </div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{l.email}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--admin-text-muted)' }}>{l.phone}</div>
                        </td>
                        <td>
                          <span className="badge badge-gold">{l.service || 'General Consultation'}</span>
                        </td>
                        <td>
                          <div style={{ maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.8rem' }}>
                            {l.message || 'No details provided'}
                          </div>
                        </td>
                        <td>
                          <span className="badge badge-info">{l.source}</span>
                        </td>
                        <td>
                          <select
                            value={l.status || 'New'}
                            onChange={e => handleUpdateLeadStatus(l.id, e.target.value)}
                            style={{
                              padding: '0.3rem 0.5rem',
                              borderRadius: '6px',
                              border: '1px solid var(--admin-border)',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              backgroundColor: l.status === 'Converted' ? '#DCFCE7' : l.status === 'Contacted' ? '#DBEAFE' : '#FEF3C7',
                              color: l.status === 'Converted' ? '#15803D' : l.status === 'Contacted' ? '#1D4ED8' : '#B45309',
                              cursor: 'pointer'
                            }}
                          >
                            <option value="New">New</option>
                            <option value="Contacted">Contacted</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Converted">Converted</option>
                            <option value="Disqualified">Disqualified</option>
                          </select>
                        </td>
                        <td>
                          <button
                            onClick={() => {
                              setSelectedItem(l);
                              setSelectedType('lead');
                            }}
                            style={{
                              padding: '0.35rem 0.75rem',
                              backgroundColor: 'var(--admin-navy)',
                              color: '#FFFFFF',
                              border: 'none',
                              borderRadius: '6px',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              cursor: 'pointer'
                            }}
                          >
                            View Message 🔍
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 5: ACTIVE MATTERS & CASE REGISTRY */}
          {/* ========================================================= */}
          {activeTab === 'matters' && (
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid var(--admin-border)', overflow: 'hidden' }}>
              <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--admin-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--admin-navy)' }}>Active Matters &amp; Case Registry</h2>
                  <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>Central repository of legal proceedings and corporate mandates</div>
                </div>
                <button
                  onClick={() => setIsNewMatterOpen(true)}
                  style={{
                    backgroundColor: 'var(--admin-navy)',
                    color: '#FFFFFF',
                    border: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  + New Matter
                </button>
              </div>

              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Matter ID</th>
                    <th>Case Title</th>
                    <th>Client</th>
                    <th>Lead Advocate</th>
                    <th>Priority</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {matters.map((m, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: 700, color: 'var(--admin-navy)' }}>{m.matter_id}</td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{m.title}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--admin-text-muted)' }}>{m.category}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{m.client_name || 'Acme Holdings'}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--admin-text-muted)' }}>{m.organization_name || m.client_email}</div>
                      </td>
                      <td>{m.lawyer_name || 'Adv. Priya Deshmukh'}</td>
                      <td>
                        <span className={`badge ${m.priority === 'High' ? 'badge-urgent' : 'badge-gold'}`}>
                          {m.priority}
                        </span>
                      </td>
                      <td>
                        <span className="badge badge-active">
                          ● {m.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 6: DEADLINES & LEGAL CALENDAR */}
          {/* ========================================================= */}
          {activeTab === 'deadlines' && (
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid var(--admin-border)', overflow: 'hidden' }}>
              <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--admin-border)' }}>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--admin-navy)' }}>Legal Calendar &amp; Statutory Deadlines</h2>
                <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>Tracking court hearings, ROC compliance, and regulatory renewal dates</div>
              </div>

              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Deadline Title</th>
                    <th>Matter</th>
                    <th>Deadline Type</th>
                    <th>Due Date</th>
                    <th>Assigned Advocate</th>
                    <th>Urgency</th>
                  </tr>
                </thead>
                <tbody>
                  {deadlines.map((d, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: 600 }}>📅 {d.title}</td>
                      <td style={{ color: 'var(--admin-navy)', fontWeight: 600 }}>{d.code || 'RWC-2026-0001'}</td>
                      <td><span className="badge badge-info">{d.deadline_type}</span></td>
                      <td style={{ fontWeight: 700 }}>{new Date(d.due_date).toLocaleDateString()}</td>
                      <td>{d.lawyer_name || 'Adv. Priya Deshmukh'}</td>
                      <td><span className="badge badge-warning">Due in 5 Days</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 7: DOCUMENT REQUESTS VAULT */}
          {/* ========================================================= */}
          {activeTab === 'documents' && (
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid var(--admin-border)', overflow: 'hidden' }}>
              <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--admin-border)' }}>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--admin-navy)' }}>Client Document Checklists &amp; Approvals</h2>
                <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>Direct digital document collection reducing scattered WhatsApp messages</div>
              </div>

              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Document Name</th>
                    <th>Matter</th>
                    <th>Client</th>
                    <th>Current Status</th>
                    <th>Staff Action</th>
                  </tr>
                </thead>
                <tbody>
                  {docRequests.map((r, idx) => (
                    <tr key={idx}>
                      <td>
                        <div style={{ fontWeight: 600 }}>📄 {r.document_name}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--admin-text-muted)' }}>{r.instructions}</div>
                      </td>
                      <td style={{ fontWeight: 600 }}>{r.code || 'RWC-2026-0001'}</td>
                      <td>{r.client_name || 'Aditi Mehra'}</td>
                      <td>
                        <span className={`badge ${r.status === 'Approved' ? 'badge-active' : r.status === 'Uploaded' ? 'badge-info' : 'badge-warning'}`}>
                          {r.status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            onClick={() => handleUpdateDocStatus(r.id, 'Approved')}
                            style={{ backgroundColor: '#15803D', color: '#FFF', border: 'none', padding: '0.3rem 0.6rem', borderRadius: '4px', fontSize: '0.7rem', cursor: 'pointer' }}
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleUpdateDocStatus(r.id, 'Rejected')}
                            style={{ backgroundColor: '#B91C1C', color: '#FFF', border: 'none', padding: '0.3rem 0.6rem', borderRadius: '4px', fontSize: '0.7rem', cursor: 'pointer' }}
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 8: RESEARCH & KNOWLEDGE BASE */}
          {/* ========================================================= */}
          {activeTab === 'research' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid var(--admin-border)', overflow: 'hidden' }}>
                <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--admin-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--admin-navy)' }}>Assigned Legal Research Tasks</h2>
                    <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>Questions delegated to associates and legal interns</div>
                  </div>
                  <button
                    onClick={() => setIsNewResearchOpen(true)}
                    style={{ backgroundColor: 'var(--admin-navy)', color: '#FFF', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
                  >
                    + Assign Research Task
                  </button>
                </div>

                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Research Mandate</th>
                      <th>Forum / Authority</th>
                      <th>Assigned Researcher</th>
                      <th>Deadline</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {researchTasks.map((t, idx) => (
                      <tr key={idx}>
                        <td>
                          <div style={{ fontWeight: 600 }}>{t.research_question}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--admin-text-muted)' }}>Relevant Statutes: {t.relevant_legislation}</div>
                        </td>
                        <td>{t.jurisdiction}</td>
                        <td>{t.assigned_to_name || 'Arjun Mehta (Intern)'}</td>
                        <td style={{ fontWeight: 700 }}>{new Date(t.deadline).toLocaleDateString()}</td>
                        <td><span className="badge badge-warning">{t.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Precedents Knowledge Library */}
              <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid var(--admin-border)', padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', color: 'var(--admin-navy)', marginBottom: '1rem' }}>
                  🏛️ Firm Knowledge Base &amp; Landmark Precedents
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                  {knowledgeBase.map((kb, i) => (
                    <div key={i} style={{ border: '1px solid var(--admin-border)', borderRadius: '10px', padding: '1.25rem', backgroundColor: 'var(--admin-bg)' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--admin-gold-dark)', fontWeight: 700 }}>{kb.court_or_authority} &bull; {kb.citation}</div>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--admin-navy)', margin: '0.35rem 0' }}>{kb.title}</div>
                      <p style={{ fontSize: '0.8rem', color: 'var(--admin-text-muted)', lineHeight: 1.45, marginBottom: '0.75rem' }}>{kb.summary}</p>
                      <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--admin-navy)' }}>Key Holding: {kb.key_takeaways}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 9: INTERN WORKSPACE */}
          {/* ========================================================= */}
          {activeTab === 'intern' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '2rem' }}>
              <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', padding: '1.75rem', border: '1px solid var(--admin-border)' }}>
                <div style={{ color: 'var(--admin-gold-dark)', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em' }}>
                  INTERN DAILY WORK UPDATE
                </div>
                <h2 style={{ fontSize: '1.3rem', color: 'var(--admin-navy)', margin: '0.35rem 0 1.25rem' }}>
                  Log Today&apos;s Legal Research &amp; Tasks
                </h2>

                {internLogSuccess && (
                  <div style={{ backgroundColor: '#DCFCE7', color: '#166534', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem' }}>
                    ✓ Work update recorded and sent to mentoring advocate!
                  </div>
                )}

                <form onSubmit={async (e) => {
                  e.preventDefault();
                  try {
                    await fetch(`${API_BASE_URL}/api/intern/daily-updates`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ hours_logged: internHours, tasks_completed: internLogText })
                    });
                    setInternLogSuccess(true);
                    setInternLogText('');
                    setTimeout(() => setInternLogSuccess(false), 4000);
                  } catch (err) {
                    console.error('Intern update error:', err);
                  }
                }}>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Hours Logged Today</label>
                    <input
                      type="number"
                      step="0.5"
                      value={internHours}
                      onChange={e => setInternHours(e.target.value)}
                      style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--admin-border)' }}
                    />
                  </div>

                  <div style={{ marginBottom: '1.25rem' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Tasks Completed &amp; Authorities Researched *</label>
                    <textarea
                      required
                      rows={5}
                      placeholder="e.g. Researched Section 241/242 of Companies Act regarding oppression and mismanagement. Drafted case law brief on recent NCLAT rulings..."
                      value={internLogText}
                      onChange={e => setInternLogText(e.target.value)}
                      style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--admin-border)' }}
                    />
                  </div>

                  <button
                    type="submit"
                    style={{
                      backgroundColor: 'var(--admin-navy)',
                      color: '#FFFFFF',
                      border: 'none',
                      padding: '0.75rem 1.5rem',
                      borderRadius: '8px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Submit Daily Update &rarr;
                  </button>
                </form>
              </div>

              <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', padding: '1.75rem', border: '1px solid var(--admin-border)' }}>
                <div style={{ color: 'var(--admin-gold-dark)', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em' }}>
                  ASSIGNED PROJECTS
                </div>
                <h3 style={{ fontSize: '1.1rem', color: 'var(--admin-navy)', margin: '0.35rem 0 1rem' }}>
                  Current Research Mandate
                </h3>

                <div style={{ backgroundColor: '#F8FAFC', padding: '1rem', borderRadius: '10px', border: '1px solid var(--admin-border)', marginBottom: '1rem' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--admin-navy)' }}>
                    Corporate Restructuring: Minority Shareholder Protections
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--admin-text-muted)', marginTop: '0.25rem' }}>
                    Mentor: Adv. Priya Deshmukh (Partner)
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#15803D', marginTop: '0.5rem', fontWeight: 600 }}>
                    Deadline: Due in 3 Days
                  </div>
                </div>

                <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)', lineHeight: 1.5 }}>
                  🛡️ <strong>Sandbox Security Active:</strong> Intern profiles have strictly restricted access. Unrelated client matters and financial records are automatically shielded as per the SRS.
                </div>
              </div>
            </div>
          )}

        </main>

      </div>

      {/* ========================================================= */}
      {/* MODAL: FULL DETAIL SUBMISSION INSPECTION */}
      {/* ========================================================= */}
      {selectedItem && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '1.5rem'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            maxWidth: '620px',
            width: '100%',
            padding: '2.5rem',
            position: 'relative',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <button
              onClick={() => setSelectedItem(null)}
              style={{
                position: 'absolute',
                top: '1.25rem',
                right: '1.25rem',
                background: 'transparent',
                border: 'none',
                fontSize: '1.4rem',
                cursor: 'pointer',
                color: 'var(--admin-text-muted)'
              }}
            >
              ✕
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '1.5rem' }}>
                {selectedType === 'consultation' ? '📋' : selectedType === 'job' ? '💼' : selectedType === 'internship' ? '🎓' : '🎯'}
              </span>
              <div style={{ fontSize: '0.8rem', color: 'var(--admin-gold-dark)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                {selectedType === 'consultation' ? 'CLIENT CONSULTATION REQUEST' :
                 selectedType === 'job' ? 'JOB APPLICATION (ATS)' :
                 selectedType === 'internship' ? 'INTERNSHIP APPLICATION (ATS)' : 'CRM WEBSITE INQUIRY'}
              </div>
            </div>

            <h2 style={{ fontSize: '1.6rem', color: 'var(--admin-navy)', margin: '0 0 1.25rem' }}>
              {selectedItem.client_name || selectedItem.name}
            </h2>

            {/* Contact Action Bar */}
            <div style={{
              display: 'flex',
              gap: '1rem',
              backgroundColor: '#F8FAFC',
              padding: '1rem 1.25rem',
              borderRadius: '10px',
              border: '1px solid var(--admin-border)',
              marginBottom: '1.5rem',
              alignItems: 'center',
              flexWrap: 'wrap'
            }}>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--admin-text-muted)' }}>Email Address:</div>
                <a href={`mailto:${selectedItem.email}`} style={{ fontWeight: 700, color: 'var(--admin-navy)', fontSize: '0.9rem' }}>
                  {selectedItem.email}
                </a>
              </div>
              <div style={{ height: '30px', width: '1px', backgroundColor: 'var(--admin-border)' }} />
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--admin-text-muted)' }}>Phone / Mobile:</div>
                <a href={`tel:${selectedItem.phone}`} style={{ fontWeight: 700, color: 'var(--admin-navy)', fontSize: '0.9rem' }}>
                  {selectedItem.phone}
                </a>
              </div>
              <div style={{ marginLeft: 'auto' }}>
                <a
                  href={`https://wa.me/${(selectedItem.phone || '').replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    backgroundColor: '#16A34A',
                    color: '#FFFFFF',
                    padding: '0.4rem 0.8rem',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  💬 WhatsApp
                </a>
              </div>
            </div>

            {/* Submission Detailed Fields */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
              
              {selectedType === 'consultation' && (
                <>
                  <div style={{ backgroundColor: '#F8FAFC', padding: '0.85rem', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--admin-text-muted)' }}>Practice Area:</div>
                    <div style={{ fontWeight: 700, color: 'var(--admin-navy)' }}>{selectedItem.practice_area}</div>
                  </div>
                  <div style={{ backgroundColor: '#F8FAFC', padding: '0.85rem', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--admin-text-muted)' }}>Consultation Mode:</div>
                    <div style={{ fontWeight: 700, color: 'var(--admin-navy)' }}>{selectedItem.mode}</div>
                  </div>
                  <div style={{ backgroundColor: '#F8FAFC', padding: '0.85rem', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--admin-text-muted)' }}>Preferred Date:</div>
                    <div style={{ fontWeight: 700, color: 'var(--admin-navy)' }}>
                      {selectedItem.consultation_date ? new Date(selectedItem.consultation_date).toLocaleDateString() : 'N/A'}
                    </div>
                  </div>
                  <div style={{ backgroundColor: '#F8FAFC', padding: '0.85rem', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--admin-text-muted)' }}>Preferred Time Slot:</div>
                    <div style={{ fontWeight: 700, color: 'var(--admin-navy)' }}>{selectedItem.time_slot}</div>
                  </div>
                </>
              )}

              {(selectedType === 'job' || selectedType === 'internship') && (
                <>
                  <div style={{ backgroundColor: '#F8FAFC', padding: '0.85rem', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--admin-text-muted)' }}>Position / Track:</div>
                    <div style={{ fontWeight: 700, color: 'var(--admin-navy)' }}>{selectedItem.role}</div>
                  </div>
                  <div style={{ backgroundColor: '#F8FAFC', padding: '0.85rem', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--admin-text-muted)' }}>Qualification / Roll No:</div>
                    <div style={{ fontWeight: 700, color: 'var(--admin-navy)' }}>{selectedItem.qualification || 'N/A'}</div>
                  </div>
                </>
              )}

              {selectedType === 'lead' && (
                <>
                  <div style={{ backgroundColor: '#F8FAFC', padding: '0.85rem', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--admin-text-muted)' }}>Subject / Service:</div>
                    <div style={{ fontWeight: 700, color: 'var(--admin-navy)' }}>{selectedItem.service}</div>
                  </div>
                  <div style={{ backgroundColor: '#F8FAFC', padding: '0.85rem', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--admin-text-muted)' }}>Source Channel:</div>
                    <div style={{ fontWeight: 700, color: 'var(--admin-navy)' }}>{selectedItem.source}</div>
                  </div>
                </>
              )}

            </div>

            {/* Matter Summary or Application Notes */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--admin-navy)', marginBottom: '0.4rem' }}>
                Full Notes / Message Details:
              </div>
              <div style={{
                backgroundColor: '#F8FAFC',
                padding: '1.25rem',
                borderRadius: '8px',
                border: '1px solid var(--admin-border)',
                fontSize: '0.88rem',
                lineHeight: 1.6,
                color: 'var(--admin-text-main)',
                whiteSpace: 'pre-wrap'
              }}>
                {selectedItem.notes || selectedItem.message || selectedItem.resume_notes || 'No extra notes provided by user.'}
              </div>
            </div>

            {/* Status Update & Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--admin-border)', paddingTop: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>Current Status:</span>
                <span className="badge badge-gold">{selectedItem.status || 'New'}</span>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => setSelectedItem(null)}
                  style={{
                    padding: '0.5rem 1rem',
                    border: '1px solid var(--admin-border)',
                    backgroundColor: 'transparent',
                    borderRadius: '6px',
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                  }}
                >
                  Close
                </button>

                {selectedType === 'consultation' && (
                  <button
                    onClick={() => {
                      handleUpdateConsultationStatus(selectedItem.id, 'Confirmed');
                      setSelectedItem(null);
                    }}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: '#16A34A',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Confirm Consultation ✓
                  </button>
                )}

                {(selectedType === 'job' || selectedType === 'internship') && (
                  <button
                    onClick={() => {
                      handleUpdateApplicationStatus(selectedItem.id, 'Shortlisted');
                      setSelectedItem(null);
                    }}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: 'var(--admin-navy)',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Shortlist Candidate ✓
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Modal: New Matter */}
      {isNewMatterOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ backgroundColor: '#FFFFFF', padding: '2rem', borderRadius: '16px', maxWidth: '480px', width: '100%' }}>
            <h3 style={{ color: 'var(--admin-navy)', marginBottom: '1rem' }}>Create New Legal Matter</h3>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Matter Title</label>
              <input
                type="text"
                placeholder="e.g. Trademark Infringement Defense"
                value={newMatterTitle}
                onChange={e => setNewMatterTitle(e.target.value)}
                style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--admin-border)' }}
              />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Category</label>
              <input
                type="text"
                value={newMatterCategory}
                onChange={e => setNewMatterCategory(e.target.value)}
                style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--admin-border)' }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button onClick={() => setIsNewMatterOpen(false)} style={{ padding: '0.5rem 1rem', border: '1px solid var(--admin-border)', background: 'transparent', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
              <button
                onClick={async () => {
                  if (newMatterTitle) {
                    try {
                      await fetch(`${API_BASE_URL}/api/matters`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ title: newMatterTitle, category: newMatterCategory, priority: 'Normal' })
                      });
                      loadData();
                    } catch (err) {
                      console.error('Error creating matter:', err);
                    }
                    setIsNewMatterOpen(false);
                    setNewMatterTitle('');
                  }
                }}
                style={{ padding: '0.5rem 1rem', backgroundColor: 'var(--admin-navy)', color: '#FFF', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
              >
                Create Matter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Assign Research */}
      {isNewResearchOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ backgroundColor: '#FFFFFF', padding: '2rem', borderRadius: '16px', maxWidth: '500px', width: '100%' }}>
            <h3 style={{ color: 'var(--admin-navy)', marginBottom: '1rem' }}>Assign Legal Research Topic</h3>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Research Question / Issue *</label>
              <textarea
                rows={3}
                placeholder="e.g. Scope of Section 9 arbitration interim reliefs prior to constitution of tribunal..."
                value={researchQuestion}
                onChange={e => setResearchQuestion(e.target.value)}
                style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--admin-border)' }}
              />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Relevant Legislation</label>
              <input
                type="text"
                value={researchAct}
                onChange={e => setResearchAct(e.target.value)}
                style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--admin-border)' }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button onClick={() => setIsNewResearchOpen(false)} style={{ padding: '0.5rem 1rem', border: '1px solid var(--admin-border)', background: 'transparent', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
              <button
                onClick={async () => {
                  if (researchQuestion) {
                    try {
                      await fetch(`${API_BASE_URL}/api/research-tasks`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          research_question: researchQuestion,
                          relevant_legislation: researchAct,
                          jurisdiction: 'High Court of Delhi'
                        })
                      });
                      loadData();
                    } catch (err) {
                      console.error('Error assigning research task:', err);
                    }
                    setIsNewResearchOpen(false);
                    setResearchQuestion('');
                  }
                }}
                style={{ padding: '0.5rem 1rem', backgroundColor: 'var(--admin-navy)', color: '#FFF', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
              >
                Assign Task
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
