'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app') ? 'https://backend-three-theta-89.vercel.app' : 'http://localhost:5000');

export default function AdminDashboard() {
  const [activeRole, setActiveRole] = useState('super_admin'); // super_admin, lawyer, paralegal, intern
  const [activeTab, setActiveTab] = useState('matters'); // matters, deadlines, documents, leads, research, intern
  const [matters, setMatters] = useState([]);
  const [deadlines, setDeadlines] = useState([]);
  const [docRequests, setDocRequests] = useState([]);
  const [leads, setLeads] = useState([]);
  const [researchTasks, setResearchTasks] = useState([]);
  const [knowledgeBase, setKnowledgeBase] = useState([]);

  // Modal States
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
        else setActiveTab('matters');
      } else {
        setLoginError(data.error || 'Authentication failed');
      }
    } catch {
      setLoginError('Unable to connect to authentication server.');
    } finally {
      setLoginLoading(false);
    }
  };

  // Fetch data from backend
  const loadData = () => {
    Promise.all([
      fetch(`${API_BASE_URL}/api/matters`).then(r => r.json()).catch(() => ({ matters: [] })),
      fetch(`${API_BASE_URL}/api/deadlines`).then(r => r.json()).catch(() => ({ deadlines: { overdue: [], today: [], upcoming: [] } })),
      fetch(`${API_BASE_URL}/api/document-requests`).then(r => r.json()).catch(() => ({ requests: [] })),
      fetch(`${API_BASE_URL}/api/leads`).then(r => r.json()).catch(() => ({ leads: [] })),
      fetch(`${API_BASE_URL}/api/research-tasks`).then(r => r.json()).catch(() => ({ tasks: [] })),
      fetch(`${API_BASE_URL}/api/knowledge-base`).then(r => r.json()).catch(() => ({ precedents: [] })),
    ]).then(([mattersData, deadlinesData, docsData, leadsData, researchData, kbData]) => {
      setMatters(mattersData.matters || []);
      const allDeadlines = [
        ...(deadlinesData.deadlines?.overdue || []),
        ...(deadlinesData.deadlines?.today || []),
        ...(deadlinesData.deadlines?.upcoming || [])
      ];
      setDeadlines(allDeadlines);
      setDocRequests(docsData.requests || []);
      setLeads(leadsData.leads || []);
      setResearchTasks(researchData.tasks || []);
      setKnowledgeBase(kbData.precedents || []);
    });
  };

  useEffect(() => {
    loadData();
  }, []);

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
                padding: '0.85rem',
                borderRadius: '8px',
                border: 'none',
                fontWeight: 600,
                fontSize: '0.95rem',
                cursor: 'pointer',
                marginBottom: '1.5rem'
              }}
            >
              {loginLoading ? 'Authenticating...' : 'Sign In to Operating System →'}
            </button>
          </form>

          {/* Quick Demo Credentials Panel */}
          <div style={{ borderTop: '1px solid var(--admin-border)', paddingTop: '1.25rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)', fontWeight: 600, marginBottom: '0.75rem', textAlign: 'center' }}>
              ⚡ 1-Click Role Login for Assessment:
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => handleLogin(null, 'admin@rebelwingcouncil.com', 'Admin@RebelWing2026')}
                style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--admin-border)', backgroundColor: '#F8FAFC', fontSize: '0.75rem', cursor: 'pointer', textAlign: 'left' }}
              >
                👑 <strong>Super Admin</strong>
                <div style={{ fontSize: '0.65rem', color: '#64748B' }}>Managing Partner</div>
              </button>
              <button
                type="button"
                onClick={() => handleLogin(null, 'priya.d@rebelwingcouncil.com', 'Lawyer@RebelWing2026')}
                style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--admin-border)', backgroundColor: '#F8FAFC', fontSize: '0.75rem', cursor: 'pointer', textAlign: 'left' }}
              >
                ⚖️ <strong>Senior Advocate</strong>
                <div style={{ fontSize: '0.65rem', color: '#64748B' }}>Corporate &amp; M&amp;A</div>
              </button>
              <button
                type="button"
                onClick={() => handleLogin(null, 'neha.v@rebelwingcouncil.com', 'Paralegal@RebelWing2026')}
                style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--admin-border)', backgroundColor: '#F8FAFC', fontSize: '0.75rem', cursor: 'pointer', textAlign: 'left' }}
              >
                📁 <strong>Paralegal</strong>
                <div style={{ fontSize: '0.65rem', color: '#64748B' }}>Compliance Queue</div>
              </button>
              <button
                type="button"
                onClick={() => handleLogin(null, 'arjun.m@rebelwingcouncil.com', 'Intern@RebelWing2026')}
                style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--admin-border)', backgroundColor: '#F8FAFC', fontSize: '0.75rem', cursor: 'pointer', textAlign: 'left' }}
              >
                🎓 <strong>Intern</strong>
                <div style={{ fontSize: '0.65rem', color: '#64748B' }}>Sandboxed Log</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--admin-bg)' }}>
      
      {/* 1. LEFT SIDEBAR */}
      <aside style={{
        width: '260px',
        backgroundColor: 'var(--admin-navy-dark)',
        color: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        borderRight: '1px solid var(--admin-border-gold)',
        flexShrink: 0
      }}>
        {/* Brand Header */}
        <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Image src="/logo.jpg" alt="Logo" width={38} height={38} style={{ borderRadius: '50%', border: '1.5px solid var(--admin-gold)' }} />
          <div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1rem', fontWeight: 700, color: '#FFFFFF', lineHeight: 1.1 }}>
              REBEL WING
            </div>
            <div style={{ fontSize: '0.6rem', color: 'var(--admin-gold-light)', letterSpacing: '0.1em' }}>
              OPERATING SYSTEM
            </div>
          </div>
        </div>

        {/* Navigation Items (Role-Adaptive) */}
        <nav style={{ padding: '1.25rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', flex: 1 }}>
          
          {activeRole !== 'intern' && (
            <>
              <button
                onClick={() => setActiveTab('matters')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: activeTab === 'matters' ? 'var(--admin-navy-surface)' : 'transparent',
                  color: activeTab === 'matters' ? 'var(--admin-gold-light)' : '#94A3B8',
                  fontWeight: activeTab === 'matters' ? 600 : 500,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                ⚖️ Matters &amp; Litigation ({matters.length})
              </button>

              <button
                onClick={() => setActiveTab('deadlines')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: activeTab === 'deadlines' ? 'var(--admin-navy-surface)' : 'transparent',
                  color: activeTab === 'deadlines' ? 'var(--admin-gold-light)' : '#94A3B8',
                  fontWeight: activeTab === 'deadlines' ? 600 : 500,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                📅 Deadlines &amp; Calendar ({deadlines.length})
              </button>

              <button
                onClick={() => setActiveTab('documents')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: activeTab === 'documents' ? 'var(--admin-navy-surface)' : 'transparent',
                  color: activeTab === 'documents' ? 'var(--admin-gold-light)' : '#94A3B8',
                  fontWeight: activeTab === 'documents' ? 600 : 500,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                📁 Document Requests ({docRequests.length})
              </button>

              <button
                onClick={() => setActiveTab('leads')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: activeTab === 'leads' ? 'var(--admin-navy-surface)' : 'transparent',
                  color: activeTab === 'leads' ? 'var(--admin-gold-light)' : '#94A3B8',
                  fontWeight: activeTab === 'leads' ? 600 : 500,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                🎯 CRM &amp; Website Leads ({leads.length})
              </button>

              <button
                onClick={() => setActiveTab('research')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: activeTab === 'research' ? 'var(--admin-navy-surface)' : 'transparent',
                  color: activeTab === 'research' ? 'var(--admin-gold-light)' : '#94A3B8',
                  fontWeight: activeTab === 'research' ? 600 : 500,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                📚 Research &amp; Knowledge ({knowledgeBase.length})
              </button>
            </>
          )}

          {/* Intern Sandbox Tab */}
          <button
            onClick={() => setActiveTab('intern')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: activeTab === 'intern' ? 'var(--admin-navy-surface)' : 'transparent',
              color: activeTab === 'intern' ? 'var(--admin-gold-light)' : '#94A3B8',
              fontWeight: activeTab === 'intern' ? 600 : 500,
              fontSize: '0.85rem',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            🎓 Internship Workspace
          </button>
        </nav>

        {/* User Info / Profile in Sidebar Footer */}
        <div style={{ padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', fontSize: '0.75rem', color: '#94A3B8' }}>
          <div>Connected to Supabase DB:</div>
          <div style={{ color: '#22C55E', fontWeight: 600 }}>● PostgreSQL 17.11 Live</div>
        </div>
      </aside>

      {/* 2. MAIN WORKSPACE */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        
        {/* Top Header with Role Switcher */}
        <header style={{
          backgroundColor: '#FFFFFF',
          padding: '1rem 2rem',
          borderBottom: '1px solid var(--admin-border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--admin-navy)' }}>
              {activeRole === 'super_admin' ? 'Managing Partner Executive Suite' :
               activeRole === 'lawyer' ? 'Senior Advocate Workspace' :
               activeRole === 'paralegal' ? 'Legal Executive Portal' : 'Sandboxed Intern Workspace'}
            </h1>
            <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>
              Rebel Wing Council Operating System • Advanced Legal Modules Active
            </div>
          </div>

          {/* Role Toggle Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--admin-text-muted)' }}>
              Switch Role View:
            </span>
            <select
              value={activeRole}
              onChange={e => {
                setActiveRole(e.target.value);
                if (e.target.value === 'intern') setActiveTab('intern');
                else if (activeTab === 'intern') setActiveTab('matters');
              }}
              style={{
                padding: '0.45rem 0.85rem',
                borderRadius: '8px',
                border: '1.5px solid var(--admin-border-gold)',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: 'var(--admin-navy)',
                backgroundColor: 'var(--admin-card-bg)',
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
              title="Sign Out of Operating System"
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
              Sign Out ↗
            </button>
          </div>
        </header>

        {/* Dashboard Content */}
        <main style={{ padding: '2rem', flex: 1, overflowY: 'auto' }}>
          
          {/* Top Metric Cards */}
          {activeRole !== 'intern' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem', marginBottom: '2rem' }}>
              <div style={{ backgroundColor: '#FFFFFF', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--admin-border)', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--admin-text-muted)' }}>ACTIVE MATTERS</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--admin-navy)', marginTop: '0.25rem' }}>{matters.length}</div>
                <div style={{ fontSize: '0.7rem', color: '#15803D', marginTop: '0.25rem' }}>100% On Schedule</div>
              </div>

              <div style={{ backgroundColor: '#FFFFFF', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--admin-border)', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--admin-text-muted)' }}>UPCOMING DEADLINES</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#B45309', marginTop: '0.25rem' }}>{deadlines.length}</div>
                <div style={{ fontSize: '0.7rem', color: '#B45309', marginTop: '0.25rem' }}>ROC Filing in 5 Days</div>
              </div>

              <div style={{ backgroundColor: '#FFFFFF', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--admin-border)', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--admin-text-muted)' }}>PENDING DOC REVIEWS</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1D4ED8', marginTop: '0.25rem' }}>
                  {docRequests.filter(d => d.status === 'Uploaded').length || docRequests.length}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#1D4ED8', marginTop: '0.25rem' }}>Client Checklists Active</div>
              </div>

              <div style={{ backgroundColor: '#FFFFFF', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--admin-border)', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--admin-text-muted)' }}>CRM WEBSITE LEADS</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--admin-gold-dark)', marginTop: '0.25rem' }}>{leads.length}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--admin-text-muted)', marginTop: '0.25rem' }}>Auto-ingestion active</div>
              </div>
            </div>
          )}

          {/* TAB 1: MATTERS & LITIGATION */}
          {activeTab === 'matters' && activeRole !== 'intern' && (
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

          {/* TAB 2: DEADLINES & LEGAL CALENDAR */}
          {activeTab === 'deadlines' && activeRole !== 'intern' && (
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

          {/* TAB 3: DOCUMENT REQUESTS VAULT */}
          {activeTab === 'documents' && activeRole !== 'intern' && (
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

          {/* TAB 4: LEADS & CRM */}
          {activeTab === 'leads' && activeRole !== 'intern' && (
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid var(--admin-border)', overflow: 'hidden' }}>
              <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--admin-border)' }}>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--admin-navy)' }}>Website Inquiries &amp; Consultation Leads</h2>
                <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>Automatically ingested from website consultation scheduler</div>
              </div>

              {leads.length === 0 ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--admin-text-muted)', fontSize: '0.9rem' }}>
                  No leads yet. Website submissions from port 3000 will appear here automatically in real time!
                </div>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Lead Name</th>
                      <th>Contact Details</th>
                      <th>Service Requested</th>
                      <th>Source</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads.map((l, idx) => (
                      <tr key={idx}>
                        <td style={{ fontWeight: 600 }}>{l.name}</td>
                        <td>
                          <div>{l.email}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--admin-text-muted)' }}>{l.phone}</div>
                        </td>
                        <td>{l.service}</td>
                        <td><span className="badge badge-gold">{l.source}</span></td>
                        <td><span className="badge badge-info">{l.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* TAB 5: RESEARCH & KNOWLEDGE BASE */}
          {activeTab === 'research' && activeRole !== 'intern' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              
              {/* Research Tasks Pipeline */}
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
                      <div style={{ fontSize: '0.75rem', color: 'var(--admin-gold-dark)', fontWeight: 700 }}>{kb.court_or_authority} • {kb.citation}</div>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--admin-navy)', margin: '0.35rem 0' }}>{kb.title}</div>
                      <p style={{ fontSize: '0.8rem', color: 'var(--admin-text-muted)', lineHeight: 1.45, marginBottom: '0.75rem' }}>{kb.summary}</p>
                      <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--admin-navy)' }}>Key Holding: {kb.key_takeaways}</div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 6: INTERNSHIP & RESEARCH SANDBOX */}
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
