'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app') ? 'https://backend-three-theta-89.vercel.app' : 'http://localhost:5000');

export default function HomePage() {
  const [practiceAreas, setPracticeAreas] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    practice_area: 'Corporate & Commercial Law',
    date: '',
    time_slot: '11:00 AM - 12:00 PM',
    mode: 'Online Video Call',
    notes: ''
  });

  // AI Assistant Drawer State
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [aiQuery, setAiQuery] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);

  // Legal Fee Calculator State
  const [calcService, setCalcService] = useState('trademark');

  // ATS Career State
  const [careerType, setCareerType] = useState('executive');
  const [careerSubmitted, setCareerSubmitted] = useState(false);
  const [careerFormData, setCareerFormData] = useState({
    name: '',
    email: '',
    phone: '',
    qualification: ''
  });

  // Fee Calculator Data
  const feeEstimates = {
    trademark: {
      title: 'Trademark Registration & Search',
      govtFee: '₹4,500 (Per Class)',
      profFee: '₹5,500',
      total: '₹10,000 + GST',
      timeline: '4 - 6 Months (Publication & Certificate)',
      docs: ['Logo high-res file', 'Form TM-48 (Authorization)', 'User Affidavit']
    },
    incorporation: {
      title: 'Private Limited Company Incorporation',
      govtFee: '₹1,500 (SPICe+ / MCA)',
      profFee: '₹8,500',
      total: '₹10,000 + GST',
      timeline: '7 - 10 Business Days',
      docs: ['Director PAN & Aadhaar', 'Utility Bill', 'NOC from Landlord']
    },
    contract: {
      title: 'Commercial Agreement Review & Drafting',
      govtFee: 'Stamp Duty as applicable',
      profFee: '₹15,000',
      total: '₹15,000 + GST',
      timeline: '3 - 5 Business Days',
      docs: ['Term Sheet / Draft Agreement', 'Commercial Terms']
    },
    epr: {
      title: 'EPR Environmental Compliance Registration',
      govtFee: 'CPCB Portal Statutory Fees',
      profFee: '₹25,000',
      total: '₹25,000 + GST',
      timeline: '3 - 4 Weeks (CPCB Portal)',
      docs: ['Sales & Procurement Records', 'SPCB Consent', 'Recycler Agreement']
    }
  };

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/practice-areas`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.practice_areas.length > 0) {
          setPracticeAreas(data.practice_areas);
        } else {
          setFallbackAreas();
        }
      })
      .catch(() => setFallbackAreas());
  }, []);

  const setFallbackAreas = () => {
    setPracticeAreas([
      { name: 'Corporate & Commercial Law', description: 'Incorporation, regulatory compliance, M&A, shareholder pacts, and governance.' },
      { name: 'Litigation & Dispute Resolution', description: 'Commercial disputes, civil matters, High Court representation, and domestic arbitration.' },
      { name: 'Intellectual Property Rights', description: 'Trademark registration, copyright filings, patent drafting, and IP litigation.' },
      { name: 'Criminal & White-Collar Defense', description: 'Economic offences, ED/CBI proceedings, financial fraud defense, and compliance.' },
      { name: 'Environmental & EPR Compliance', description: 'Extended Producer Responsibility, CPCB/SPCB filings, and green audit defense.' },
      { name: 'Employment & Labour Law', description: 'Executive agreements, POSH compliance, HR policies, and industrial dispute management.' },
      { name: 'Banking, Insolvency & NCLT', description: 'Insolvency resolution (IBC), debt restructuring, and tribunal advocacy.' },
      { name: 'Cyber Law & Data Privacy', description: 'Digital Personal Data Protection Act compliance, cyber forensics, and IT advisory.' }
    ]);
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setBookingLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/consultations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        setBookingSuccess(true);
      }
    } catch {
      setBookingSuccess(true);
    } finally {
      setBookingLoading(false);
    }
  };

  const handleAITriage = async (e) => {
    e.preventDefault();
    if (!aiQuery.trim()) return;
    setAiLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/ai/legal-triage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: aiQuery })
      });
      const data = await res.json();
      if (data.success) {
        setAiResult(data.triage);
      }
    } catch {
      setAiResult({
        category: 'Corporate & Legal Advisory',
        suggested_advocate: 'Adv. Priya Deshmukh (Partner)',
        estimated_timeline: '2-3 Weeks',
        key_requirements: ['Primary agreement or notice', 'Company PAN / Details'],
        ai_guidance: 'Our senior advocates review your requirements within 24 hours to formulate statutory strategy.'
      });
    } finally {
      setAiLoading(false);
    }
  };

  const openBookingWithArea = (areaName) => {
    setFormData(prev => ({ ...prev, practice_area: areaName }));
    setBookingSuccess(false);
    setIsModalOpen(true);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* 1. TOP UTILITY BAR */}
      <div style={{
        backgroundColor: 'var(--deep-navy)',
        color: 'var(--gold-light)',
        fontSize: '0.8rem',
        padding: '0.5rem 0',
        borderBottom: '1px solid var(--border-gold)'
      }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <span>📍 New Delhi • Mumbai • Bengaluru &nbsp;|&nbsp; ⚖️ Supreme Court &amp; High Court Advocates</span>
          </div>
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <span>📞 +91 98765 43210</span>
            <span>✉️ contact@rebelwingcouncil.com</span>
            <Link href="/portal" style={{ color: 'var(--gold-primary)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              🔒 Client Portal &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* 2. MAIN HEADER / NAVIGATION */}
      <header style={{
        backgroundColor: 'rgba(255, 255, 255, 0.98)',
        backdropFilter: 'blur(10px)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: 'var(--shadow-sm)',
        borderBottom: '1px solid var(--border-light)'
      }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem 1.5rem' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <Image
              src="/logo.jpg"
              alt="Rebel Wing Council Logo"
              width={52}
              height={52}
              style={{ borderRadius: '50%', border: '1.5px solid var(--gold-primary)' }}
            />
            <div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-navy)', lineHeight: 1.1 }}>
                REBEL WING COUNCIL
              </div>
              <div style={{ fontSize: '0.65rem', letterSpacing: '0.15em', color: 'var(--gold-dark)', fontWeight: 700 }}>
                LAW • COMPLIANCE • INNOVATION
              </div>
            </div>
          </Link>

          <nav style={{ display: 'flex', alignItems: 'center', gap: '1.75rem', fontSize: '0.9rem', fontWeight: 500 }}>
            <Link href="#practice-areas">Practice Areas</Link>
            <Link href="#calculator">Fee Calculator</Link>
            <Link href="#why-choose-us">Why Choose Us</Link>
            <Link href="#careers">Careers &amp; ATS</Link>
            <Link href="http://localhost:3001" target="_blank" style={{ color: 'var(--text-slate)', fontSize: '0.85rem', padding: '0.4rem 0.8rem', borderRadius: '6px', background: 'var(--cream-surface)' }}>
              Staff Login
            </Link>
            <button
              onClick={() => { setBookingSuccess(false); setIsModalOpen(true); }}
              className="btn-gold"
            >
              Book Consultation
            </button>
          </nav>
        </div>
      </header>

      {/* 3. HERO SECTION (Lexvant Benchmark Standard) */}
      <section style={{
        position: 'relative',
        backgroundColor: '#FFFFFF',
        padding: '4.5rem 0 5.5rem',
        overflow: 'hidden',
        borderBottom: '1px solid var(--border-light)'
      }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '3rem', alignItems: 'center' }}>
          
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: 'var(--gold-dark)',
              fontWeight: 700,
              fontSize: '0.8rem',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              marginBottom: '1rem'
            }}>
              <span>✦</span> ADVOCACY. INTEGRITY. RESULTS.
            </div>

            <h1 style={{
              fontSize: '3.4rem',
              lineHeight: 1.15,
              color: 'var(--primary-navy)',
              marginBottom: '1.25rem',
              fontWeight: 700
            }}>
              Strong Legal Advice, <br />
              <span style={{ color: 'var(--gold-primary)', fontStyle: 'italic', fontWeight: 600 }}>
                Trusted Representation.
              </span>
            </h1>

            <p style={{
              fontSize: '1.1rem',
              lineHeight: 1.65,
              color: 'var(--text-slate)',
              marginBottom: '2.25rem',
              maxWidth: '560px'
            }}>
              We provide forward-looking legal counsel tailored to high-growth enterprises, compliance-driven industries, and complex litigation across India and international jurisdictions.
            </p>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
              <button
                onClick={() => { setBookingSuccess(false); setIsModalOpen(true); }}
                className="btn-gold"
                style={{ fontSize: '1rem', padding: '0.85rem 2rem' }}
              >
                Our Services &rarr;
              </button>
              <button
                onClick={() => setIsAIOpen(true)}
                className="btn-outline-navy"
                style={{ fontSize: '1rem', padding: '0.85rem 1.75rem' }}
              >
                ✨ AI Legal Assistant &rarr;
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderTop: '1px solid var(--border-light)', paddingTop: '1.5rem' }}>
              <div style={{ display: 'flex' }}>
                {['#0A192F', '#C5A869', '#152B4D'].map((bg, i) => (
                  <div key={i} style={{
                    width: 38,
                    height: 38,
                    borderRadius: '50%',
                    backgroundColor: bg,
                    border: '2px solid #FFFFFF',
                    marginLeft: i > 0 ? '-10px' : 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFFFFF',
                    fontSize: '0.75rem',
                    fontWeight: 700
                  }}>
                    {i === 0 ? 'RW' : i === 1 ? 'LC' : 'IN'}
                  </div>
                ))}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--primary-navy)' }}>
                  Trusted by 1000+ Clients
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Across Corporate, FinTech, Litigation &amp; Compliance Sectors
                </div>
              </div>
            </div>
          </div>

          <div>
            <div style={{
              background: 'linear-gradient(145deg, #0A192F 0%, #10233F 100%)',
              borderRadius: '20px',
              padding: '2.5rem',
              color: '#FFFFFF',
              boxShadow: 'var(--shadow-lg)',
              border: '1px solid var(--border-gold)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                <div>
                  <div style={{ color: 'var(--gold-light)', fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.1em' }}>
                    ESTABLISHED PRACTICE
                  </div>
                  <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', fontWeight: 700 }}>
                    Legal Excellence
                  </div>
                </div>
                <Image
                  src="/logo.jpg"
                  alt="Emblem"
                  width={60}
                  height={60}
                  style={{ borderRadius: '50%', border: '2px solid var(--gold-light)' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '12px', borderLeft: '3px solid var(--gold-primary)' }}>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--gold-light)', minWidth: '70px' }}>15+</div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Years of Experience</div>
                    <div style={{ fontSize: '0.8rem', color: '#94A3B8' }}>Supreme Court, High Courts &amp; Tribunals</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '12px', borderLeft: '3px solid var(--gold-primary)' }}>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--gold-light)', minWidth: '70px' }}>1000+</div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Happy Corporate Clients</div>
                    <div style={{ fontSize: '0.8rem', color: '#94A3B8' }}>Startups, enterprises, and individual matters</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '12px', borderLeft: '3px solid var(--gold-primary)' }}>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--gold-light)', minWidth: '70px' }}>98%</div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Resolution Success Rate</div>
                    <div style={{ fontSize: '0.8rem', color: '#94A3B8' }}>Across commercial disputes and arbitration</div>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '2rem' }}>
                <button
                  onClick={() => { setBookingSuccess(false); setIsModalOpen(true); }}
                  className="btn-gold"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  Schedule Your Consultation &rarr;
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. PRACTICE AREAS SECTION */}
      <section id="practice-areas" style={{ padding: '5.5rem 0', backgroundColor: 'var(--cream-bg)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <div style={{ color: 'var(--gold-dark)', fontWeight: 700, fontSize: '0.85rem', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
              — ⚖️ OUR PRACTICE AREAS —
            </div>
            <h2 style={{ fontSize: '2.5rem', color: 'var(--primary-navy)', marginTop: '0.5rem', fontWeight: 700 }}>
              Comprehensive Legal Expertise
            </h2>
            <p style={{ color: 'var(--text-slate)', maxWidth: '650px', margin: '0.75rem auto 0', fontSize: '1rem' }}>
              From corporate structuring to courtroom advocacy, our senior advocates deliver specialized counsel tailored to your exact industry.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1.75rem'
          }}>
            {practiceAreas.map((area, idx) => (
              <div
                key={idx}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '16px',
                  padding: '2rem 1.75rem',
                  border: '1px solid var(--border-light)',
                  boxShadow: 'var(--shadow-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.borderColor = 'var(--gold-primary)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'var(--border-light)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                }}
                onClick={() => openBookingWithArea(area.name)}
              >
                <div>
                  <div style={{
                    width: 48,
                    height: 48,
                    borderRadius: '10px',
                    backgroundColor: 'var(--cream-surface)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    marginBottom: '1.25rem',
                    color: 'var(--primary-navy)'
                  }}>
                    ⚖️
                  </div>
                  <h3 style={{ fontSize: '1.2rem', color: 'var(--primary-navy)', marginBottom: '0.75rem', fontWeight: 600 }}>
                    {area.name}
                  </h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-slate)', lineHeight: 1.55 }}>
                    {area.description}
                  </p>
                </div>

                <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--gold-dark)' }}>
                    Book Consultation &rarr;
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. INTERACTIVE LEGAL COST & TIMELINE CALCULATOR */}
      <section id="calculator" style={{ padding: '4.5rem 0', backgroundColor: '#FFFFFF', borderTop: '1px solid var(--border-light)', borderBottom: '1px solid var(--border-light)' }}>
        <div className="container" style={{ maxWidth: '1000px' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <div style={{ color: 'var(--gold-dark)', fontWeight: 700, fontSize: '0.85rem', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
              — TRANSPARENT PRICING —
            </div>
            <h2 style={{ fontSize: '2.3rem', color: 'var(--primary-navy)', marginTop: '0.5rem', fontWeight: 700 }}>
              Legal Cost &amp; Timeline Estimator
            </h2>
            <p style={{ color: 'var(--text-slate)', fontSize: '0.95rem', marginTop: '0.4rem' }}>
              Clear fee structures with breakdown of government statutory charges, professional fees, and realistic completion windows.
            </p>
          </div>

          <div style={{ backgroundColor: 'var(--cream-bg)', borderRadius: '20px', border: '1px solid var(--border-light)', overflow: 'hidden', boxShadow: 'var(--shadow-md)' }}>
            
            {/* Service Selection Tabs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', backgroundColor: 'var(--cream-surface)', borderBottom: '1px solid var(--border-light)' }}>
              {[
                { id: 'trademark', label: 'Trademark IP' },
                { id: 'incorporation', label: 'Company Setup' },
                { id: 'contract', label: 'Contract Review' },
                { id: 'epr', label: 'EPR Compliance' }
              ].map(s => (
                <button
                  key={s.id}
                  onClick={() => setCalcService(s.id)}
                  style={{
                    padding: '1rem 0.5rem',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    backgroundColor: calcService === s.id ? '#FFFFFF' : 'transparent',
                    color: calcService === s.id ? 'var(--primary-navy)' : 'var(--text-muted)',
                    borderBottom: calcService === s.id ? '3px solid var(--gold-primary)' : 'none'
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* Estimate Display Body */}
            <div style={{ padding: '2.5rem', display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '2.5rem', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '1.4rem', color: 'var(--primary-navy)', marginBottom: '0.75rem' }}>
                  {feeEstimates[calcService].title}
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed var(--border-light)', paddingBottom: '0.4rem' }}>
                    <span style={{ color: 'var(--text-slate)' }}>Government Statutory Fee:</span>
                    <strong>{feeEstimates[calcService].govtFee}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed var(--border-light)', paddingBottom: '0.4rem' }}>
                    <span style={{ color: 'var(--text-slate)' }}>Professional Counsel Fee:</span>
                    <strong>{feeEstimates[calcService].profFee}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.4rem', fontSize: '1.05rem', color: 'var(--primary-navy)' }}>
                    <span>Estimated Total:</span>
                    <strong style={{ color: 'var(--gold-dark)' }}>{feeEstimates[calcService].total}</strong>
                  </div>
                </div>

                <div style={{ backgroundColor: '#FFFFFF', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-light)', fontSize: '0.85rem' }}>
                  <div style={{ fontWeight: 600, color: 'var(--primary-navy)', marginBottom: '0.35rem' }}>Key Required Documents:</div>
                  <ul style={{ paddingLeft: '1.2rem', color: 'var(--text-slate)' }}>
                    {feeEstimates[calcService].docs.map((d, i) => (
                      <li key={i}>{d}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div style={{ backgroundColor: '#FFFFFF', padding: '2rem', borderRadius: '16px', border: '1px solid var(--border-gold)', textAlign: 'center' }}>
                <div style={{ color: 'var(--gold-dark)', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.1em' }}>
                  ESTIMATED COMPLETION
                </div>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--primary-navy)', margin: '0.5rem 0' }}>
                  {feeEstimates[calcService].timeline}
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                  Handled with complete end-to-end statutory documentation.
                </p>
                <button
                  onClick={() => openBookingWithArea(feeEstimates[calcService].title)}
                  className="btn-gold"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  Initiate This Service &rarr;
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 6. "WHY CHOOSE US" DUAL BANNER (Lexvant Benchmark) */}
      <section id="why-choose-us" style={{ padding: '4.5rem 0', backgroundColor: 'var(--cream-bg)' }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            borderRadius: '20px',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-lg)'
          }}>
            <div style={{
              backgroundColor: 'var(--deep-navy)',
              color: '#FFFFFF',
              padding: '3.5rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}>
              <div style={{ color: 'var(--gold-light)', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.2em' }}>
                WHY CHOOSE US
              </div>
              <h2 style={{ fontSize: '2.4rem', lineHeight: 1.25, margin: '1rem 0 1.25rem', color: '#FFFFFF' }}>
                Committed to Delivering <br />
                <span style={{ color: 'var(--gold-primary)' }}>Justice &amp; Strategic Value</span>
              </h2>
              <p style={{ color: '#94A3B8', lineHeight: 1.65, fontSize: '1rem', marginBottom: '2rem' }}>
                Our team of experienced advocates combines deep statutory knowledge with practical courtroom strategy to achieve the best possible outcomes for our clients.
              </p>
              <div>
                <button
                  onClick={() => { setBookingSuccess(false); setIsModalOpen(true); }}
                  className="btn-outline-gold"
                >
                  Learn More About Us &rarr;
                </button>
              </div>
            </div>

            <div style={{
              backgroundColor: 'var(--cream-surface)',
              padding: '3.5rem',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '2.5rem',
              alignContent: 'center'
            }}>
              <div>
                <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary-navy)' }}>1000+</div>
                <div style={{ color: 'var(--text-slate)', fontSize: '0.9rem', fontWeight: 600, marginTop: '0.25rem' }}>Clients Served</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Corporate &amp; Individual</div>
              </div>
              <div>
                <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary-navy)' }}>2500+</div>
                <div style={{ color: 'var(--text-slate)', fontSize: '0.9rem', fontWeight: 600, marginTop: '0.25rem' }}>Cases Handled</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Litigation &amp; Advisory</div>
              </div>
              <div>
                <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary-navy)' }}>50+</div>
                <div style={{ color: 'var(--text-slate)', fontSize: '0.9rem', fontWeight: 600, marginTop: '0.25rem' }}>Expert Lawyers</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Partners &amp; Associates</div>
              </div>
              <div>
                <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary-navy)' }}>15+</div>
                <div style={{ color: 'var(--text-slate)', fontSize: '0.9rem', fontWeight: 600, marginTop: '0.25rem' }}>Practice Areas</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Pan-India Coverage</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. CAREERS & ATS SYSTEM SECTION */}
      <section id="careers" style={{ padding: '5rem 0', backgroundColor: '#FFFFFF' }}>
        <div className="container" style={{ maxWidth: '900px' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <div style={{ color: 'var(--gold-dark)', fontWeight: 700, fontSize: '0.85rem', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
              — JOIN OUR COUNCIL —
            </div>
            <h2 style={{ fontSize: '2.3rem', color: 'var(--primary-navy)', marginTop: '0.5rem', fontWeight: 700 }}>
              Careers &amp; Internship Opportunities
            </h2>
            <p style={{ color: 'var(--text-slate)', fontSize: '0.95rem', marginTop: '0.5rem' }}>
              We recruit exceptional legal professionals and offer structured internship programs with mentorship from senior advocates.
            </p>
          </div>

          <div style={{
            backgroundColor: 'var(--cream-bg)',
            borderRadius: '16px',
            padding: '2.5rem',
            border: '1px solid var(--border-light)',
            boxShadow: 'var(--shadow-md)'
          }}>
            <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '1.25rem', marginBottom: '1.75rem' }}>
              <button
                onClick={() => setCareerType('executive')}
                style={{
                  padding: '0.6rem 1.25rem',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  border: 'none',
                  backgroundColor: careerType === 'executive' ? 'var(--primary-navy)' : 'var(--cream-surface)',
                  color: careerType === 'executive' ? '#FFFFFF' : 'var(--text-slate)'
                }}
              >
                Full-Time Legal Executive
              </button>
              <button
                onClick={() => setCareerType('internship')}
                style={{
                  padding: '0.6rem 1.25rem',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  border: 'none',
                  backgroundColor: careerType === 'internship' ? 'var(--primary-navy)' : 'var(--cream-surface)',
                  color: careerType === 'internship' ? '#FFFFFF' : 'var(--text-slate)'
                }}
              >
                Internship Program (Paid &amp; Unpaid)
              </button>
            </div>

            {careerSubmitted ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🎉</div>
                <h3 style={{ color: 'var(--primary-navy)', fontSize: '1.4rem', marginBottom: '0.5rem' }}>Application Submitted to ATS</h3>
                <p style={{ color: 'var(--text-slate)', fontSize: '0.95rem' }}>
                  Our hiring committee and senior partners will review your profile. Shortlisted candidates will be contacted for an interview.
                </p>
              </div>
            ) : (
              <form onSubmit={async (e) => {
                e.preventDefault();
                try {
                  await fetch(`${API_BASE_URL}/api/careers`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      name: careerFormData.name,
                      email: careerFormData.email,
                      phone: careerFormData.phone,
                      role: careerType === 'executive' ? 'Legal Executive' : 'Internship Applicant',
                      experience: careerFormData.qualification,
                      resume_notes: `Application for ${careerType}`
                    })
                  });
                } catch (err) {
                  console.error('Error submitting application:', err);
                }
                setCareerSubmitted(true);
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>Full Name *</label>
                    <input
                      required
                      type="text"
                      placeholder="Adv. / Mr. / Ms."
                      value={careerFormData.name}
                      onChange={e => setCareerFormData(prev => ({ ...prev, name: e.target.value }))}
                      style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid var(--border-light)' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>Email Address *</label>
                    <input
                      required
                      type="email"
                      placeholder="name@email.com"
                      value={careerFormData.email}
                      onChange={e => setCareerFormData(prev => ({ ...prev, email: e.target.value }))}
                      style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid var(--border-light)' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>Contact Number *</label>
                    <input
                      required
                      type="tel"
                      placeholder="+91 XXXXX XXXXX"
                      value={careerFormData.phone}
                      onChange={e => setCareerFormData(prev => ({ ...prev, phone: e.target.value }))}
                      style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid var(--border-light)' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                      {careerType === 'executive' ? 'Bar Council Roll No.' : 'Law University / College'} *
                    </label>
                    <input
                      required
                      type="text"
                      placeholder={careerType === 'executive' ? 'e.g. D/1234/2020' : 'e.g. NLU Delhi'}
                      value={careerFormData.qualification}
                      onChange={e => setCareerFormData(prev => ({ ...prev, qualification: e.target.value }))}
                      style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid var(--border-light)' }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>Upload Resume / CV (PDF) *</label>
                  <input required type="file" accept=".pdf,.doc,.docx" style={{ width: '100%', padding: '0.5rem', background: '#FFFFFF', borderRadius: '8px', border: '1px solid var(--border-light)' }} />
                </div>

                <button type="submit" className="btn-gold" style={{ width: '100%', justifyContent: 'center' }}>
                  Submit Application to ATS &rarr;
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* 8. FOOTER */}
      <footer style={{ backgroundColor: 'var(--deep-navy)', color: '#FFFFFF', paddingTop: '4rem', paddingBottom: '2.5rem', borderTop: '1px solid var(--border-gold)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr', gap: '3rem', marginBottom: '3rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <Image src="/logo.jpg" alt="Logo" width={44} height={44} style={{ borderRadius: '50%' }} />
                <div>
                  <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', fontWeight: 700 }}>REBEL WING COUNCIL</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--gold-light)' }}>LAW • COMPLIANCE • INNOVATION</div>
                </div>
              </div>
              <p style={{ color: '#94A3B8', fontSize: '0.85rem', lineHeight: 1.6 }}>
                A premier legal institution providing counsel in corporate law, commercial arbitration, white-collar defense, and regulatory compliance.
              </p>
            </div>

            <div>
              <h4 style={{ color: 'var(--gold-light)', fontSize: '0.95rem', marginBottom: '1.25rem' }}>Practice Sectors</h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.85rem', color: '#CBD5E1' }}>
                <li><Link href="#practice-areas">Corporate Governance</Link></li>
                <li><Link href="#practice-areas">Commercial Litigation</Link></li>
                <li><Link href="#practice-areas">Trademark &amp; IP Protection</Link></li>
                <li><Link href="#practice-areas">EPR Plastic Compliance</Link></li>
              </ul>
            </div>

            <div>
              <h4 style={{ color: 'var(--gold-light)', fontSize: '0.95rem', marginBottom: '1.25rem' }}>Ecosystem Portals</h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.85rem', color: '#CBD5E1' }}>
                <li><Link href="/portal">Client Self-Service Portal</Link></li>
                <li><Link href="http://localhost:3001" target="_blank">Law Firm Operating System</Link></li>
                <li><Link href="http://localhost:3001" target="_blank">Super Admin &amp; Managing Partner</Link></li>
                <li><Link href="http://localhost:3001" target="_blank">Internship Sandbox</Link></li>
              </ul>
            </div>

            <div>
              <h4 style={{ color: 'var(--gold-light)', fontSize: '0.95rem', marginBottom: '1.25rem' }}>Office Locations</h4>
              <p style={{ color: '#CBD5E1', fontSize: '0.85rem', lineHeight: 1.6 }}>
                <strong>New Delhi:</strong> Barakhamba Road, Connaught Place<br />
                <strong>Mumbai:</strong> Nariman Point &amp; BKC<br />
                <strong>Bengaluru:</strong> MG Road
              </p>
            </div>
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', fontSize: '0.75rem', color: '#94A3B8' }}>
            <div>
              © 2026 Rebel Wing Council. All rights reserved.
            </div>
            <div>
              Disclaimer: As per the rules of the Bar Council of India, this portal does not solicit work or advertise. It provides operational services for clients and practice transparency.
            </div>
          </div>
        </div>
      </footer>

      {/* 9. FLOATING 24/7 AI LEGAL ASSISTANT BUTTON */}
      <button
        onClick={() => setIsAIOpen(true)}
        style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          backgroundColor: 'var(--primary-navy)',
          color: 'var(--gold-light)',
          border: '2px solid var(--gold-primary)',
          borderRadius: '9999px',
          padding: '0.85rem 1.5rem',
          fontWeight: 700,
          fontSize: '0.95rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          boxShadow: 'var(--shadow-gold)',
          cursor: 'pointer',
          zIndex: 40
        }}
      >
        <span>🤖</span>
        <span>24/7 AI Legal Assistant</span>
      </button>

      {/* 10. SLIDE-OUT AI LEGAL ASSISTANT DRAWER */}
      {isAIOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(6, 15, 30, 0.65)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          justifyContent: 'flex-end',
          zIndex: 100
        }}>
          <div style={{
            width: '100%',
            maxWidth: '460px',
            backgroundColor: '#FFFFFF',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: 'var(--shadow-lg)'
          }}>
            {/* Drawer Header */}
            <div style={{ backgroundColor: 'var(--primary-navy)', color: '#FFFFFF', padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-gold)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span style={{ fontSize: '1.4rem' }}>🤖</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>AI Legal Assistant</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--gold-light)' }}>24/7 STATUTORY TRIAGE &amp; CASE GUIDANCE</div>
                </div>
              </div>
              <button onClick={() => setIsAIOpen(false)} style={{ background: 'transparent', border: 'none', color: '#FFFFFF', fontSize: '1.25rem', cursor: 'pointer' }}>✕</button>
            </div>

            {/* Drawer Content */}
            <div style={{ padding: '1.5rem', flex: 1, overflowY: 'auto' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-slate)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                Ask a legal question regarding corporate compliance, trademark filing, arbitration notices, or EPR requirements to receive instant triage guidance.
              </p>

              <form onSubmit={handleAITriage} style={{ marginBottom: '1.5rem' }}>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. We received a legal notice alleging trademark infringement for our brand name. What steps should we take?"
                  value={aiQuery}
                  onChange={e => setAiQuery(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border-light)', fontSize: '0.85rem' }}
                />
                <button
                  type="submit"
                  disabled={aiLoading}
                  className="btn-gold"
                  style={{ width: '100%', justifyContent: 'center', marginTop: '0.65rem', fontSize: '0.85rem' }}
                >
                  {aiLoading ? 'Analyzing Case Law & Statutes...' : 'Analyze with AI Legal Assistant &rarr;'}
                </button>
              </form>

              {aiResult && (
                <div style={{ backgroundColor: 'var(--cream-bg)', borderRadius: '12px', padding: '1.25rem', border: '1px solid var(--border-gold)' }}>
                  <div style={{ color: 'var(--gold-dark)', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em' }}>
                    RECOMMENDED ACTION PLAN
                  </div>
                  <h4 style={{ color: 'var(--primary-navy)', fontSize: '1.1rem', margin: '0.35rem 0' }}>
                    {aiResult.category}
                  </h4>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-slate)', marginBottom: '0.75rem' }}>
                    Recommended Counsel: <strong>{aiResult.suggested_advocate}</strong>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-dark)', lineHeight: 1.5, backgroundColor: '#FFFFFF', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-light)', marginBottom: '1rem' }}>
                    {aiResult.ai_guidance}
                  </p>

                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary-navy)', marginBottom: '0.35rem' }}>Required Documents to Gather:</div>
                  <ul style={{ fontSize: '0.75rem', color: 'var(--text-slate)', paddingLeft: '1.2rem', marginBottom: '1.25rem' }}>
                    {aiResult.key_requirements.map((req, i) => (
                      <li key={i}>{req}</li>
                    ))}
                  </ul>

                  <button
                    onClick={() => {
                      setIsAIOpen(false);
                      openBookingWithArea(aiResult.category);
                    }}
                    className="btn-gold"
                    style={{ width: '100%', justifyContent: 'center', fontSize: '0.85rem' }}
                  >
                    Schedule Legal Review with {aiResult.suggested_advocate.split(' ')[1]} &rarr;
                  </button>
                </div>
              )}
            </div>

            <div style={{ padding: '0.75rem 1.5rem', backgroundColor: 'var(--cream-surface)', borderTop: '1px solid var(--border-light)', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              Disclaimer: AI responses provide preliminary triage based on Indian statutes and must be reviewed by licensed advocates before formal execution.
            </div>
          </div>
        </div>
      )}

      {/* 11. CONSULTATION BOOKING MODAL */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(6, 15, 30, 0.75)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '1rem'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            maxWidth: '550px',
            width: '100%',
            padding: '2.5rem',
            position: 'relative',
            boxShadow: 'var(--shadow-lg)'
          }}>
            <button
              onClick={() => setIsModalOpen(false)}
              style={{
                position: 'absolute',
                top: '1.25rem',
                right: '1.25rem',
                background: 'transparent',
                border: 'none',
                fontSize: '1.25rem',
                cursor: 'pointer',
                color: 'var(--text-muted)'
              }}
            >
              ✕
            </button>

            {bookingSuccess ? (
              <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚖️</div>
                <h3 style={{ fontSize: '1.6rem', color: 'var(--primary-navy)', marginBottom: '0.5rem' }}>
                  Consultation Scheduled!
                </h3>
                <p style={{ color: 'var(--text-slate)', fontSize: '0.95rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                  Thank you, <strong>{formData.name}</strong>. Your consultation request for <strong>{formData.practice_area}</strong> has been received. Our senior legal associate will reach out to confirm your slot.
                </p>
                <div style={{ backgroundColor: 'var(--cream-surface)', padding: '1rem', borderRadius: '10px', fontSize: '0.85rem', color: 'var(--primary-navy)', marginBottom: '1.5rem' }}>
                  📅 <strong>Date:</strong> {formData.date || 'Earliest Available'} &nbsp;|&nbsp; ⏰ <strong>Time:</strong> {formData.time_slot}
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="btn-gold"
                >
                  Done
                </button>
              </div>
            ) : (
              <div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--gold-dark)', fontWeight: 700, letterSpacing: '0.1em' }}>
                    ONLINE APPOINTMENT
                  </div>
                  <h3 style={{ fontSize: '1.6rem', color: 'var(--primary-navy)' }}>
                    Book a Legal Consultation
                  </h3>
                </div>

                <form onSubmit={handleBookingSubmit}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>Your Name *</label>
                      <input
                        required
                        type="text"
                        placeholder="Adv. / Mr. / Ms."
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--border-light)' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>Email Address *</label>
                      <input
                        required
                        type="email"
                        placeholder="name@email.com"
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--border-light)' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>Phone Number *</label>
                      <input
                        required
                        type="tel"
                        placeholder="+91 XXXXX XXXXX"
                        value={formData.phone}
                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--border-light)' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>Practice Area</label>
                      <select
                        value={formData.practice_area}
                        onChange={e => setFormData({ ...formData, practice_area: e.target.value })}
                        style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--border-light)' }}
                      >
                        {practiceAreas.map((pa, i) => (
                          <option key={i} value={pa.name}>{pa.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>Preferred Date *</label>
                      <input
                        required
                        type="date"
                        value={formData.date}
                        onChange={e => setFormData({ ...formData, date: e.target.value })}
                        style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--border-light)' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>Consultation Mode</label>
                      <select
                        value={formData.mode}
                        onChange={e => setFormData({ ...formData, mode: e.target.value })}
                        style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--border-light)' }}
                      >
                        <option value="Online Video Call">Online Video Call</option>
                        <option value="Phone Call">Phone Consultation</option>
                        <option value="In-person Meeting">In-person Meeting (Delhi/Mumbai/Blr)</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ marginBottom: '1.25rem' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>Brief Summary of Matter</label>
                    <textarea
                      rows={3}
                      placeholder="Share a brief summary of the contract, dispute, or compliance requirement..."
                      value={formData.notes}
                      onChange={e => setFormData({ ...formData, notes: e.target.value })}
                      style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--border-light)' }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={bookingLoading}
                    className="btn-gold"
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    {bookingLoading ? 'Processing Request...' : 'Confirm Consultation Booking →'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
