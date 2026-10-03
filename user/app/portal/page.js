'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function ClientPortal() {
  const [matterData, setMatterData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [docRequests, setDocRequests] = useState([]);
  const [uploadSuccess, setUploadSuccess] = useState('');

  useEffect(() => {
    // Fetch live matter RWC-2026-0001 from backend
    fetch('http://localhost:5000/api/matters/RWC-2026-0001')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setMatterData(data);
          setDocRequests(data.document_requests || []);
        }
      })
      .catch(err => console.error('Portal fetch error:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleSimulateUpload = async (reqId) => {
    try {
      await fetch(`http://localhost:5000/api/document-requests/${reqId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Uploaded' })
      });
      setDocRequests(prev => prev.map(r => r.id === reqId ? { ...r, status: 'Uploaded' } : r));
      setUploadSuccess('Document successfully uploaded and sent for legal review!');
      setTimeout(() => setUploadSuccess(''), 4000);
    } catch {
      setDocRequests(prev => prev.map(r => r.id === reqId ? { ...r, status: 'Uploaded' } : r));
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', display: 'flex', flexDirection: 'column' }}>
      
      {/* Top Navbar */}
      <header style={{
        backgroundColor: 'var(--primary-navy)',
        color: '#FFFFFF',
        padding: '1rem 0',
        borderBottom: '1px solid var(--border-gold)'
      }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <Image src="/logo.jpg" alt="Logo" width={44} height={44} style={{ borderRadius: '50%', border: '1.5px solid var(--gold-light)' }} />
            <div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.15rem', fontWeight: 700, color: '#FFFFFF' }}>
                REBEL WING COUNCIL
              </div>
              <div style={{ fontSize: '0.65rem', color: 'var(--gold-light)', letterSpacing: '0.1em' }}>
                SECURE CLIENT SERVICE PORTAL
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Aditi Mehra</div>
              <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Acme Holdings India Pvt Ltd</div>
            </div>
            <Link href="/" style={{ fontSize: '0.85rem', color: 'var(--gold-light)', border: '1px solid var(--border-gold)', padding: '0.4rem 0.85rem', borderRadius: '9999px' }}>
              &larr; Back to Website
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="container" style={{ padding: '2.5rem 1.5rem', flex: 1, maxWidth: '1100px' }}>
        
        {/* Welcome Banner */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          padding: '2rem',
          boxShadow: 'var(--shadow-sm)',
          border: '1px solid var(--border-light)',
          marginBottom: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem'
        }}>
          <div>
            <div style={{ color: 'var(--gold-dark)', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.1em' }}>
              CLIENT DASHBOARD
            </div>
            <h1 style={{ fontSize: '1.75rem', color: 'var(--primary-navy)', margin: '0.35rem 0' }}>
              Welcome back, Aditi
            </h1>
            <p style={{ color: 'var(--text-slate)', fontSize: '0.95rem' }}>
              Track real-time progress on your legal matters, view upcoming deadlines, and upload requested documents.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={() => alert('New Service Request triggered for Acme Holdings')}
              className="btn-gold"
              style={{ fontSize: '0.9rem' }}
            >
              + Request New Service
            </button>
          </div>
        </div>

        {uploadSuccess && (
          <div style={{ backgroundColor: '#DCFCE7', color: '#166534', padding: '1rem', borderRadius: '10px', marginBottom: '1.5rem', border: '1px solid #BBF7D0' }}>
            ✓ {uploadSuccess}
          </div>
        )}

        {/* Active Matter Card & Progress */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          padding: '2rem',
          boxShadow: 'var(--shadow-md)',
          border: '1px solid var(--border-light)',
          marginBottom: '2rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '1.25rem', marginBottom: '1.75rem' }}>
            <div>
              <span style={{ backgroundColor: 'var(--cream-surface)', color: 'var(--primary-navy)', fontSize: '0.75rem', fontWeight: 700, padding: '0.3rem 0.6rem', borderRadius: '6px', border: '1px solid var(--border-gold)' }}>
                RWC-2026-0001
              </span>
              <h2 style={{ fontSize: '1.4rem', color: 'var(--primary-navy)', marginTop: '0.6rem' }}>
                Acme Holdings Corporate Restructuring &amp; Compliance
              </h2>
              <div style={{ color: 'var(--text-slate)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                Lead Advocate: <strong>Adv. Priya Deshmukh</strong> (Partner - Corporate Law)
              </div>
            </div>

            <div>
              <span style={{ backgroundColor: '#DCFCE7', color: '#15803D', fontWeight: 600, fontSize: '0.85rem', padding: '0.4rem 0.85rem', borderRadius: '9999px' }}>
                ● Active Matter
              </span>
            </div>
          </div>

          {/* 5-Step Visual Milestones Tracker */}
          <div style={{ marginBottom: '2.5rem' }}>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--primary-navy)', marginBottom: '1.25rem' }}>
              Legal Matter Milestones
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.75rem', position: 'relative' }}>
              {[
                { step: 1, title: 'Docs Verified', desc: 'Corporate filings verified', status: 'completed' },
                { step: 2, title: 'Docs Drafted', desc: 'Shareholder pact ready', status: 'completed' },
                { step: 3, title: 'Board Approval', desc: 'Execution by directors', status: 'in_progress' },
                { step: 4, title: 'ROC Filing', desc: 'Submission of MGT-14', status: 'pending' },
                { step: 5, title: 'Final Closure', desc: 'MCA certificate archival', status: 'pending' }
              ].map((m, idx) => (
                <div key={idx} style={{
                  backgroundColor: m.status === 'completed' ? '#F0FDF4' : m.status === 'in_progress' ? '#FEFCE8' : '#F8FAFC',
                  border: m.status === 'completed' ? '1.5px solid #22C55E' : m.status === 'in_progress' ? '1.5px solid #EAB308' : '1px solid #E2E8F0',
                  borderRadius: '12px',
                  padding: '1rem 0.75rem',
                  textAlign: 'center'
                }}>
                  <div style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    margin: '0 auto 0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    backgroundColor: m.status === 'completed' ? '#22C55E' : m.status === 'in_progress' ? '#EAB308' : '#CBD5E1',
                    color: '#FFFFFF'
                  }}>
                    {m.status === 'completed' ? '✓' : m.step}
                  </div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-navy)' }}>
                    {m.title}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    {m.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Two-Column Grid: Document Requests & Deadlines */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 0.7fr', gap: '2rem' }}>
            
            {/* Document Requests Checklist */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.05rem', color: 'var(--primary-navy)' }}>
                  Document Upload Requests ({docRequests.length})
                </h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Required for compliance</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {docRequests.map((doc, idx) => (
                  <div key={idx} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.9rem 1rem',
                    backgroundColor: 'var(--cream-surface)',
                    borderRadius: '10px',
                    border: '1px solid var(--border-light)'
                  }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--primary-navy)' }}>
                        📄 {doc.document_name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {doc.instructions}
                      </div>
                    </div>

                    <div>
                      {doc.status === 'Approved' ? (
                        <span style={{ backgroundColor: '#DCFCE7', color: '#166534', fontSize: '0.75rem', fontWeight: 600, padding: '0.3rem 0.65rem', borderRadius: '9999px' }}>
                          ✓ Approved
                        </span>
                      ) : doc.status === 'Uploaded' ? (
                        <span style={{ backgroundColor: '#DBEAFE', color: '#1E40AF', fontSize: '0.75rem', fontWeight: 600, padding: '0.3rem 0.65rem', borderRadius: '9999px' }}>
                          ⏳ In Review
                        </span>
                      ) : (
                        <button
                          onClick={() => handleSimulateUpload(doc.id)}
                          style={{
                            backgroundColor: 'var(--primary-navy)',
                            color: '#FFFFFF',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            padding: '0.4rem 0.85rem',
                            borderRadius: '6px',
                            border: 'none',
                            cursor: 'pointer'
                          }}
                        >
                          Upload File &uarr;
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Deadlines & Invoices */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.05rem', color: 'var(--primary-navy)', marginBottom: '0.75rem' }}>
                  Upcoming Statutory Deadlines
                </h3>
                <div style={{ backgroundColor: '#FFFBEB', border: '1px solid #FDE68A', padding: '1rem', borderRadius: '10px' }}>
                  <div style={{ fontSize: '0.8rem', color: '#B45309', fontWeight: 700 }}>
                    📅 ROC FORM MGT-14
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--primary-navy)', fontWeight: 600, marginTop: '0.2rem' }}>
                    Filing with Registrar of Companies
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#B45309', marginTop: '0.3rem' }}>
                    Due in 5 days • Assigned to Partner
                  </div>
                </div>
              </div>

              <div>
                <h3 style={{ fontSize: '1.05rem', color: 'var(--primary-navy)', marginBottom: '0.75rem' }}>
                  Billing &amp; Invoices
                </h3>
                <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--border-light)', padding: '1rem', borderRadius: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span>INV-2026-001 (Retainer)</span>
                    <strong style={{ color: 'var(--primary-navy)' }}>₹75,000</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem' }}>
                    <span style={{ fontSize: '0.75rem', color: '#B45309', backgroundColor: '#FEF3C7', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                      Payment Pending
                    </span>
                    <button
                      onClick={() => alert('Proceeding to Razorpay payment gateway simulation...')}
                      style={{
                        backgroundColor: 'var(--gold-primary)',
                        color: 'var(--deep-navy)',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '0.35rem 0.75rem',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      Pay Now &rarr;
                    </button>
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>

      </main>

    </div>
  );
}
