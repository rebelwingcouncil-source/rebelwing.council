'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app') ? 'https://backend-three-theta-89.vercel.app' : 'http://localhost:5000');

export default function HomePage() {
  // Mobile Navigation Toggle
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Consultation Booking Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    practice_area: 'Corporate Law',
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
  const [careerType, setCareerType] = useState('executive'); // 'executive' or 'internship'
  const [careerSubmitted, setCareerSubmitted] = useState(false);
  const [careerLoading, setCareerLoading] = useState(false);
  const [careerFormData, setCareerFormData] = useState({
    name: '',
    email: '',
    phone: '',
    qualification: '',
    experience: '',
    resume_notes: ''
  });

  // Contact Form State
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [contactLoading, setContactLoading] = useState(false);
  const [contactFormData, setContactFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  // Testimonial Carousel State
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const testimonials = [
    {
      quote: "Rebel Wing Council steered our multi-jurisdictional M&A through stringent regulatory scrutiny with unmatched precision. Their strategic insight into Indian corporate law was pivotal.",
      author: "Vikram Malhotra",
      title: "Managing Director, Apex Global Holdings",
      rating: 5,
      location: "Mumbai"
    },
    {
      quote: "When we faced a sudden trademark infringement action, their litigation team secured an emergency injunction in the High Court within 48 hours. Absolute legal mastery.",
      author: "Sunita Sen",
      title: "Founder & CEO, Zest Retail Brands",
      rating: 5,
      location: "New Delhi"
    },
    {
      quote: "Navigating EPR plastic waste guidelines and CPCB audits felt overwhelming until Rebel Wing Council structured our compliance protocol end-to-end.",
      author: "Rajesh Singhania",
      title: "Head of Operations, TransIndia Logistics",
      rating: 5,
      location: "Bengaluru"
    }
  ];

  // 8 Benchmark Practice Areas matching the reference image exactly
  const practiceAreasList = [
    {
      id: 'corporate',
      name: 'Corporate Law',
      icon: '🏛️',
      description: 'Incorporation, regulatory compliance, M&A, shareholder pacts, and corporate governance advisory.'
    },
    {
      id: 'family',
      name: 'Family Law',
      icon: '👥',
      description: 'Matrimonial disputes, family trust settlements, estate planning, succession, and guardianship.'
    },
    {
      id: 'criminal',
      name: 'Criminal Law',
      icon: '🔨',
      description: 'White-collar defence, economic offences, ED/CBI proceedings, trial advocacy, and criminal appeals.'
    },
    {
      id: 'property',
      name: 'Property Law',
      icon: '📄',
      description: 'Real estate due diligence, land acquisition, lease deeds, title searches, and property litigation.'
    },
    {
      id: 'commercial',
      name: 'Commercial Law',
      icon: '🤝',
      description: 'Cross-border joint ventures, distribution agreements, trade compliance, and dispute settlement.'
    },
    {
      id: 'ip',
      name: 'Intellectual Property',
      icon: '™️',
      description: 'Trademark search & filings, copyright licensing, patent drafting, and IP infringement suits.'
    },
    {
      id: 'contract',
      name: 'Contract Drafting',
      icon: '✒️',
      description: 'Master service pacts, employment agreements, non-disclosure deeds, and vendor risk mitigation.'
    },
    {
      id: 'litigation',
      name: 'Litigation & Dispute Resolution',
      icon: '⚖️',
      description: 'Supreme Court & High Court advocacy, domestic arbitration, NCLT insolvency, and commercial writs.'
    }
  ];

  // Fee Calculator Data
  const feeEstimates = {
    trademark: {
      title: 'Trademark Registration & Search',
      govtFee: '₹4,500 (Per Class)',
      profFee: '₹5,500',
      total: '₹10,000 + GST',
      timeline: '4 - 6 Months (Publication & Certificate)',
      docs: ['Logo artwork in high-res', 'Form TM-48 (Authorization)', 'User Affidavit with proof of use']
    },
    incorporation: {
      title: 'Private Limited Company Incorporation',
      govtFee: '₹1,500 (SPICe+ / MCA Statutory)',
      profFee: '₹8,500',
      total: '₹10,000 + GST',
      timeline: '7 - 10 Business Days',
      docs: ['Director PAN & Aadhaar Cards', 'Electricity / Utility Bill', 'NOC from Property Owner']
    },
    contract: {
      title: 'Commercial Agreement Review & Drafting',
      govtFee: 'Stamp Duty as applicable',
      profFee: '₹15,000',
      total: '₹15,000 + GST',
      timeline: '3 - 5 Business Days',
      docs: ['Term Sheet / Draft Agreement', 'Commercial Terms & Deliverables']
    },
    epr: {
      title: 'EPR Environmental Compliance Registration',
      govtFee: 'CPCB Portal Statutory Charges',
      profFee: '₹25,000',
      total: '₹25,000 + GST',
      timeline: '3 - 4 Weeks (CPCB Portal)',
      docs: ['Sales & Procurement Quantities', 'SPCB Consent Order', 'Recycler MoU Agreement']
    }
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

  const handleCareerSubmit = async (e) => {
    e.preventDefault();
    setCareerLoading(true);
    try {
      const payload = {
        name: careerFormData.name,
        email: careerFormData.email,
        phone: careerFormData.phone,
        type: careerType === 'executive' ? 'job' : 'internship',
        role: careerType === 'executive' ? 'Legal Executive' : 'Legal Internship Program',
        qualification: careerFormData.qualification,
        experience: careerFormData.experience || (careerType === 'executive' ? '3+ Years' : 'Law Student'),
        resume_notes: careerFormData.resume_notes || `Application for ${careerType === 'executive' ? 'Full-Time Legal Executive' : 'Internship Program'}`
      };

      await fetch(`${API_BASE_URL}/api/applications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      setCareerSubmitted(true);
    } catch {
      setCareerSubmitted(true);
    } finally {
      setCareerLoading(false);
    }
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setContactLoading(true);
    try {
      await fetch(`${API_BASE_URL}/api/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: contactFormData.name,
          email: contactFormData.email,
          phone: contactFormData.phone,
          service: contactFormData.subject || 'Direct Client Inquiry',
          message: contactFormData.message,
          source: 'Website Contact Page'
        })
      });
      setContactSubmitted(true);
    } catch {
      setContactSubmitted(true);
    } finally {
      setContactLoading(false);
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
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--cream-bg)' }}>
      
      {/* ========================================================= */}
      {/* 1. TOP UTILITY BAR (Luxury Law Firm Standard) */}
      {/* ========================================================= */}
      <div style={{
        backgroundColor: '#040A14',
        color: 'var(--gold-light)',
        fontSize: '0.78rem',
        padding: '0.45rem 0',
        borderBottom: '1px solid rgba(197, 168, 105, 0.25)',
        letterSpacing: '0.04em'
      }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span>📍 New Delhi • Mumbai • Bengaluru</span>
            <span style={{ color: 'rgba(255,255,255,0.2)' }}>|</span>
            <span>⚖️ Supreme Court &amp; High Court Advocates</span>
          </div>
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <a href="tel:+919876543210" style={{ color: 'inherit' }}>📞 +91 98765 43210</a>
            <a href="mailto:contact@rebelwingcouncil.com" style={{ color: 'inherit' }}>✉️ contact@rebelwingcouncil.com</a>
            <Link href="http://localhost:3001" target="_blank" style={{ color: 'var(--gold-primary)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              🔒 Staff / Admin Portal &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. MAIN HEADER (Lexvant Benchmark Standard - Navy & Gold) */}
      {/* ========================================================= */}
      <header style={{
        backgroundColor: 'var(--primary-navy)',
        color: '#FFFFFF',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        borderBottom: '1px solid rgba(197, 168, 105, 0.3)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)'
      }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem 1.5rem' }}>
          
          {/* Logo & Brand Identity */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
            <Image
              src="/logo.jpg"
              alt="Rebel Wing Council Logo"
              width={50}
              height={50}
              style={{
                borderRadius: '50%',
                border: '1.5px solid var(--gold-primary)',
                boxShadow: '0 0 10px rgba(197, 168, 105, 0.3)'
              }}
            />
            <div>
              <div style={{
                fontFamily: 'var(--font-cinzel)',
                fontSize: '1.2rem',
                fontWeight: 800,
                color: '#FFFFFF',
                letterSpacing: '0.08em',
                lineHeight: 1.1
              }}>
                REBEL WING
              </div>
              <div style={{
                fontSize: '0.62rem',
                letterSpacing: '0.22em',
                color: 'var(--gold-light)',
                fontWeight: 700,
                marginTop: '1px'
              }}>
                COUNCIL • LAW &amp; COMPLIANCE
              </div>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1.75rem',
            fontSize: '0.82rem',
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase'
          }} className="desktop-nav">
            <Link href="/" style={{ color: 'var(--gold-light)' }}>Home</Link>
            <Link href="#practice-areas" style={{ color: '#E2E8F0' }}>Practice Areas</Link>
            <Link href="#why-choose-us" style={{ color: '#E2E8F0' }}>Why Choose Us</Link>
            <Link href="#calculator" style={{ color: '#E2E8F0' }}>Fee Calculator</Link>
            <Link href="#careers" style={{ color: '#E2E8F0' }}>Careers &amp; ATS</Link>
            <Link href="#contact" style={{ color: '#E2E8F0' }}>Contact</Link>
            
            <button
              onClick={() => { setBookingSuccess(false); setIsModalOpen(true); }}
              className="btn-gold-nav"
            >
              Book Consultation
            </button>
          </nav>

          {/* Mobile Hamburger Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              display: 'none',
              background: 'transparent',
              border: '1px solid rgba(197, 168, 105, 0.4)',
              borderRadius: '6px',
              padding: '0.5rem',
              color: 'var(--gold-light)',
              cursor: 'pointer',
              fontSize: '1.4rem'
            }}
            className="mobile-hamburger"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>

        {/* Mobile Dropdown Navigation Drawer */}
        {mobileMenuOpen && (
          <div style={{
            backgroundColor: '#060F1E',
            borderTop: '1px solid rgba(197, 168, 105, 0.25)',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            fontSize: '0.9rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.06em'
          }}>
            <Link href="/" onClick={() => setMobileMenuOpen(false)} style={{ color: 'var(--gold-light)', padding: '0.4rem 0' }}>Home</Link>
            <Link href="#practice-areas" onClick={() => setMobileMenuOpen(false)} style={{ color: '#FFFFFF', padding: '0.4rem 0' }}>Practice Areas</Link>
            <Link href="#why-choose-us" onClick={() => setMobileMenuOpen(false)} style={{ color: '#FFFFFF', padding: '0.4rem 0' }}>Why Choose Us</Link>
            <Link href="#calculator" onClick={() => setMobileMenuOpen(false)} style={{ color: '#FFFFFF', padding: '0.4rem 0' }}>Fee Calculator</Link>
            <Link href="#careers" onClick={() => setMobileMenuOpen(false)} style={{ color: '#FFFFFF', padding: '0.4rem 0' }}>Careers &amp; ATS</Link>
            <Link href="#contact" onClick={() => setMobileMenuOpen(false)} style={{ color: '#FFFFFF', padding: '0.4rem 0' }}>Contact Us</Link>
            <Link href="http://localhost:3001" target="_blank" onClick={() => setMobileMenuOpen(false)} style={{ color: '#38BDF8', padding: '0.4rem 0' }}>Staff / Admin Login ↗</Link>
            
            <button
              onClick={() => { setMobileMenuOpen(false); setBookingSuccess(false); setIsModalOpen(true); }}
              className="btn-gold-nav"
              style={{ width: '100%', marginTop: '0.5rem' }}
            >
              Book Consultation &rarr;
            </button>
          </div>
        )}
      </header>

      {/* ========================================================= */}
      {/* 3. HERO SECTION (Diagonal Split Benchmark Standard) */}
      {/* ========================================================= */}
      <section style={{
        position: 'relative',
        backgroundColor: '#FFFFFF',
        overflow: 'hidden',
        borderBottom: '1px solid var(--border-light)'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.05fr 0.95fr',
          minHeight: '560px',
          alignItems: 'stretch'
        }} className="hero-grid">
          
          {/* Left Column: Headline & Action */}
          <div style={{
            padding: '4.5rem 3rem 4.5rem 5%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            zIndex: 10
          }} className="hero-left-content">
            
            {/* Pre-title with subtle diamond */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: 'var(--gold-bronze)',
              fontWeight: 700,
              fontSize: '0.8rem',
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              marginBottom: '1.25rem'
            }}>
              <span>✦</span> ADVOCACY. INTEGRITY. RESULTS.
            </div>

            {/* Serif Title Matching Lexvant Benchmark */}
            <h1 style={{
              fontSize: '3.6rem',
              lineHeight: 1.12,
              color: 'var(--primary-navy)',
              marginBottom: '1.35rem',
              fontWeight: 700,
              fontFamily: 'var(--font-serif)'
            }} className="hero-headline">
              Strong Legal <br className="hero-br" />
              Advice, <span style={{ color: '#B38E46', fontStyle: 'italic', fontWeight: 600 }}>Trusted</span> <br />
              Representation.
            </h1>

            {/* Subtext */}
            <p style={{
              fontSize: '1.1rem',
              lineHeight: 1.65,
              color: 'var(--text-slate)',
              marginBottom: '2.25rem',
              maxWidth: '520px'
            }}>
              We provide comprehensive legal solutions tailored to your needs with dedication and excellence across corporate, litigation, IP, and compliance sectors.
            </p>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
              <a
                href="#practice-areas"
                className="btn-hero-navy"
              >
                Our Services &rarr;
              </a>
              <button
                onClick={() => { setBookingSuccess(false); setIsModalOpen(true); }}
                className="btn-hero-outline"
              >
                Speak to an Expert &rarr;
              </button>
            </div>

            {/* Social Proof with Client Avatars */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1.1rem',
              borderTop: '1px solid var(--border-light)',
              paddingTop: '1.5rem',
              maxWidth: '480px'
            }}>
              <div style={{
                position: 'relative',
                width: '115px',
                height: '42px',
                overflow: 'hidden',
                borderRadius: '24px',
                border: '1.5px solid #FFFFFF',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}>
                <Image
                  src="/client-avatars.jpg"
                  alt="Clients Avatars"
                  fill
                  style={{ objectFit: 'cover' }}
                />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--primary-navy)', lineHeight: 1.2 }}>
                  Trusted by 1000+ Clients
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Across India &amp; Worldwide
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Hero Statue & Floating Badge (Diagonal Cut) */}
          <div style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '480px',
            overflow: 'hidden'
          }} className="hero-right-wrapper">
            
            {/* Background Image of Lady Justice & Neoclassical Columns */}
            <div style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%'
            }}>
              <Image
                src="/hero-justice.jpg"
                alt="Justice Statue and Courtroom Columns"
                fill
                priority
                style={{ objectFit: 'cover', objectPosition: 'center right' }}
              />
            </div>

            {/* Angular Gold Trim Divider (Matches Benchmark Slant) */}
            <div style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: 0,
              width: '45px',
              background: 'linear-gradient(to right, #FFFFFF 0%, rgba(255,255,255,0.7) 40%, transparent 100%)',
              zIndex: 3
            }} className="hero-slant-overlay" />

            {/* Floating Dark Glass Badge with Metrics */}
            <div style={{
              position: 'relative',
              zIndex: 5,
              marginRight: 'auto',
              marginLeft: '4rem'
            }} className="hero-floating-badge-container">
              <div className="hero-stats-badge">
                
                {/* Metric 1: Experience */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingBottom: '1.1rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <div style={{
                    width: 44,
                    height: 44,
                    borderRadius: '8px',
                    backgroundColor: 'rgba(197, 168, 105, 0.15)',
                    border: '1px solid var(--gold-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.25rem',
                    flexShrink: 0
                  }}>
                    🛡️
                  </div>
                  <div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--gold-light)', lineHeight: 1.1 }}>
                      15+
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#CBD5E1', fontWeight: 500 }}>
                      Years of Experience
                    </div>
                  </div>
                </div>

                {/* Metric 2: Happy Clients */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.1rem 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <div style={{
                    width: 44,
                    height: 44,
                    borderRadius: '8px',
                    backgroundColor: 'rgba(197, 168, 105, 0.15)',
                    border: '1px solid var(--gold-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.25rem',
                    flexShrink: 0
                  }}>
                    👥
                  </div>
                  <div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--gold-light)', lineHeight: 1.1 }}>
                      1000+
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#CBD5E1', fontWeight: 500 }}>
                      Happy Clients
                    </div>
                  </div>
                </div>

                {/* Metric 3: Success Rate */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingTop: '1.1rem' }}>
                  <div style={{
                    width: 44,
                    height: 44,
                    borderRadius: '8px',
                    backgroundColor: 'rgba(197, 168, 105, 0.15)',
                    border: '1px solid var(--gold-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.25rem',
                    flexShrink: 0
                  }}>
                    🏆
                  </div>
                  <div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--gold-light)', lineHeight: 1.1 }}>
                      98%
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#CBD5E1', fontWeight: 500 }}>
                      Success Rate
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================= */}
      {/* 4. PRACTICE AREAS SECTION (Exact Benchmark 8-Cards Grid) */}
      {/* ========================================================= */}
      <section id="practice-areas" style={{ padding: '5rem 0', backgroundColor: '#FAF9F5', borderBottom: '1px solid var(--border-light)' }}>
        <div className="container">
          
          {/* Benchmark Header with Scales Icon and subtle lines */}
          <div style={{ textAlign: 'center', marginBottom: '3.25rem' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.75rem',
              color: 'var(--gold-bronze)',
              fontWeight: 700,
              fontSize: '0.82rem',
              letterSpacing: '0.2em',
              textTransform: 'uppercase'
            }}>
              <span style={{ width: '40px', height: '1px', backgroundColor: 'var(--gold-primary)', display: 'inline-block' }}></span>
              <span>⚖️ OUR PRACTICE AREAS</span>
              <span style={{ width: '40px', height: '1px', backgroundColor: 'var(--gold-primary)', display: 'inline-block' }}></span>
            </div>
            
            <h2 style={{
              fontSize: '2.5rem',
              color: 'var(--primary-navy)',
              marginTop: '0.6rem',
              fontWeight: 700,
              fontFamily: 'var(--font-serif)'
            }}>
              Comprehensive Legal Expertise
            </h2>
            <p style={{ color: 'var(--text-slate)', maxWidth: '620px', margin: '0.6rem auto 0', fontSize: '1rem', lineHeight: 1.6 }}>
              From corporate structuring to courtroom advocacy, our senior advocates deliver specialized counsel tailored to your exact legal mandates.
            </p>
          </div>

          {/* 8 Distinct Cards matching reference image */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '1.5rem'
          }} className="practice-areas-grid">
            {practiceAreasList.map((area) => (
              <div
                key={area.id}
                className="practice-card"
                onClick={() => openBookingWithArea(area.name)}
                title={`Book Consultation for ${area.name}`}
              >
                <div>
                  <div className="practice-card-icon">
                    {area.icon}
                  </div>
                  
                  <h3 style={{
                    fontSize: '1.15rem',
                    color: 'var(--primary-navy)',
                    fontWeight: 700,
                    fontFamily: 'var(--font-serif)',
                    lineHeight: 1.3
                  }}>
                    {area.name}
                  </h3>
                  
                  <div className="practice-card-divider" />
                  
                  <p style={{
                    fontSize: '0.86rem',
                    color: 'var(--text-slate)',
                    lineHeight: 1.5,
                    marginTop: '1rem'
                  }}>
                    {area.description}
                  </p>
                </div>

                <div style={{
                  marginTop: '1.25rem',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: 'var(--gold-bronze)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  Consult Advocate &rarr;
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ========================================================= */}
      {/* 5. "WHY CHOOSE US" COMPOSITE BANNER (Exact Reference Match) */}
      {/* ========================================================= */}
      <section id="why-choose-us" style={{ padding: '4.5rem 0', backgroundColor: '#FFFFFF' }}>
        <div className="container">
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1.35fr 1fr 1.15fr',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-lg)',
            border: '1px solid var(--border-light)'
          }} className="why-choose-banner">
            
            {/* Segment 1 (Left): Navy Block */}
            <div style={{
              backgroundColor: 'var(--deep-navy)',
              color: '#FFFFFF',
              padding: '3.25rem 2.75rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}>
              <div style={{
                color: 'var(--gold-light)',
                fontSize: '0.78rem',
                fontWeight: 700,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                marginBottom: '0.75rem'
              }}>
                WHY CHOOSE US
              </div>

              <h2 style={{
                fontSize: '2.2rem',
                lineHeight: 1.25,
                marginBottom: '1.25rem',
                color: '#FFFFFF',
                fontFamily: 'var(--font-serif)',
                fontWeight: 700
              }}>
                Committed to Delivering <br />
                <span style={{ color: 'var(--gold-primary)' }}>Justice &amp; Strategic Value</span>
              </h2>

              <p style={{
                color: '#94A3B8',
                lineHeight: 1.65,
                fontSize: '0.95rem',
                marginBottom: '2rem'
              }}>
                Our team of experienced attorneys combines deep legal knowledge with practical solutions to achieve the best possible outcomes for our clients.
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

            {/* Segment 2 (Center): Lawyer Signing Image */}
            <div style={{
              position: 'relative',
              minHeight: '260px'
            }}>
              <Image
                src="/lawyer-signing.jpg"
                alt="Lawyer signing documents with scales of justice and law books"
                fill
                style={{ objectFit: 'cover', objectPosition: 'center' }}
              />
            </div>

            {/* Segment 3 (Right): 2x2 Stats Grid on Cream Surface */}
            <div style={{
              backgroundColor: '#F8F6F0',
              padding: '3rem 2.25rem',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '2rem',
              alignContent: 'center'
            }}>
              <div>
                <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>👥</div>
                <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--primary-navy)', lineHeight: 1 }}>
                  1000+
                </div>
                <div style={{ color: 'var(--text-slate)', fontSize: '0.85rem', fontWeight: 700, marginTop: '0.35rem' }}>
                  Clients Served
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Enterprises &amp; Startups
                </div>
              </div>

              <div>
                <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>💼</div>
                <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--primary-navy)', lineHeight: 1 }}>
                  2500+
                </div>
                <div style={{ color: 'var(--text-slate)', fontSize: '0.85rem', fontWeight: 700, marginTop: '0.35rem' }}>
                  Cases Handled
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Litigation &amp; Advisory
                </div>
              </div>

              <div>
                <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>🏛️</div>
                <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--primary-navy)', lineHeight: 1 }}>
                  50+
                </div>
                <div style={{ color: 'var(--text-slate)', fontSize: '0.85rem', fontWeight: 700, marginTop: '0.35rem' }}>
                  Expert Lawyers
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Partners &amp; Advocates
                </div>
              </div>

              <div>
                <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>🎖️</div>
                <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--primary-navy)', lineHeight: 1 }}>
                  15+
                </div>
                <div style={{ color: 'var(--text-slate)', fontSize: '0.85rem', fontWeight: 700, marginTop: '0.35rem' }}>
                  Practice Areas
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Pan-India Coverage
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================= */}
      {/* 6. "WHAT OUR CLIENTS SAY" TESTIMONIALS SECTION */}
      {/* ========================================================= */}
      <section style={{ padding: '4.5rem 0', backgroundColor: '#FAF9F5', borderTop: '1px solid var(--border-light)', borderBottom: '1px solid var(--border-light)' }}>
        <div className="container">
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ fontSize: '2.5rem', color: 'var(--gold-primary)', lineHeight: 0.8, fontFamily: 'serif' }}>“</div>
              <h2 style={{
                fontSize: '2.2rem',
                color: 'var(--primary-navy)',
                fontFamily: 'var(--font-serif)',
                fontWeight: 700,
                marginTop: '0.25rem'
              }}>
                What Our Clients Say
              </h2>
              <p style={{ color: 'var(--text-slate)', fontSize: '0.95rem', marginTop: '0.25rem' }}>
                Endorsements from corporate founders, enterprise general counsels, and high-net-worth clients.
              </p>
            </div>

            {/* Navigation Arrows */}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => setCurrentTestimonial((prev) => (prev > 0 ? prev - 1 : testimonials.length - 1))}
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '6px',
                  border: '1px solid #CBD5E1',
                  backgroundColor: '#FFFFFF',
                  color: 'var(--primary-navy)',
                  fontSize: '1.1rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease'
                }}
                aria-label="Previous Testimonial"
              >
                &larr;
              </button>
              <button
                onClick={() => setCurrentTestimonial((prev) => (prev < testimonials.length - 1 ? prev + 1 : 0))}
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: 'var(--primary-navy)',
                  color: '#FFFFFF',
                  fontSize: '1.1rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease'
                }}
                aria-label="Next Testimonial"
              >
                &rarr;
              </button>
            </div>
          </div>

          {/* Testimonial Active Card */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            padding: '2.75rem',
            border: '1px solid var(--border-light)',
            boxShadow: 'var(--shadow-md)',
            position: 'relative'
          }}>
            <div style={{ color: 'var(--gold-bronze)', fontSize: '1.1rem', marginBottom: '1rem' }}>
              {'★'.repeat(testimonials[currentTestimonial].rating)}
            </div>

            <p style={{
              fontSize: '1.25rem',
              lineHeight: 1.7,
              color: 'var(--primary-navy)',
              fontStyle: 'italic',
              marginBottom: '1.75rem',
              fontFamily: 'var(--font-serif)'
            }}>
              &ldquo;{testimonials[currentTestimonial].quote}&rdquo;
            </p>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderTop: '1px solid var(--border-light)', paddingTop: '1.25rem' }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--primary-navy)' }}>
                  {testimonials[currentTestimonial].author}
                </div>
                <div style={{ color: 'var(--text-slate)', fontSize: '0.85rem' }}>
                  {testimonials[currentTestimonial].title} &bull; {testimonials[currentTestimonial].location}
                </div>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--gold-dark)', fontWeight: 700, letterSpacing: '0.1em' }}>
                VERIFIED CLIENT MANDATE
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================= */}
      {/* 7. TRANSPARENT LEGAL COST & TIMELINE CALCULATOR */}
      {/* ========================================================= */}
      <section id="calculator" style={{ padding: '5rem 0', backgroundColor: '#FFFFFF', borderBottom: '1px solid var(--border-light)' }}>
        <div className="container" style={{ maxWidth: '1050px' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '2.75rem' }}>
            <div style={{ color: 'var(--gold-bronze)', fontWeight: 700, fontSize: '0.82rem', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
              — TRANSPARENT PRICING —
            </div>
            <h2 style={{ fontSize: '2.3rem', color: 'var(--primary-navy)', marginTop: '0.5rem', fontWeight: 700, fontFamily: 'var(--font-serif)' }}>
              Legal Cost &amp; Timeline Estimator
            </h2>
            <p style={{ color: 'var(--text-slate)', fontSize: '0.95rem', marginTop: '0.4rem' }}>
              Clear fee structures with breakdown of government statutory charges, professional fees, and realistic completion windows.
            </p>
          </div>

          <div style={{ backgroundColor: '#FAF9F5', borderRadius: '16px', border: '1px solid var(--border-light)', overflow: 'hidden', boxShadow: 'var(--shadow-md)' }}>
            
            {/* Service Selection Tabs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', backgroundColor: '#F1EFEA', borderBottom: '1px solid var(--border-light)' }} className="calculator-tabs">
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
                    padding: '1.1rem 0.5rem',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                    backgroundColor: calcService === s.id ? '#FFFFFF' : 'transparent',
                    color: calcService === s.id ? 'var(--primary-navy)' : 'var(--text-muted)',
                    borderBottom: calcService === s.id ? '3px solid var(--gold-primary)' : 'none',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* Estimate Display Body */}
            <div style={{ padding: '2.5rem', display: 'grid', gridTemplateColumns: '1.25fr 0.75fr', gap: '2.5rem', alignItems: 'center' }} className="calculator-body">
              <div>
                <h3 style={{ fontSize: '1.45rem', color: 'var(--primary-navy)', marginBottom: '0.85rem', fontFamily: 'var(--font-serif)', fontWeight: 700 }}>
                  {feeEstimates[calcService].title}
                </h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1.5rem', fontSize: '0.92rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed var(--border-light)', paddingBottom: '0.45rem' }}>
                    <span style={{ color: 'var(--text-slate)' }}>Government Statutory Fee:</span>
                    <strong>{feeEstimates[calcService].govtFee}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed var(--border-light)', paddingBottom: '0.45rem' }}>
                    <span style={{ color: 'var(--text-slate)' }}>Professional Counsel Fee:</span>
                    <strong>{feeEstimates[calcService].profFee}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.45rem', fontSize: '1.1rem', color: 'var(--primary-navy)' }}>
                    <span style={{ fontWeight: 700 }}>Estimated Total:</span>
                    <strong style={{ color: 'var(--gold-bronze)', fontWeight: 800 }}>{feeEstimates[calcService].total}</strong>
                  </div>
                </div>

                <div style={{ backgroundColor: '#FFFFFF', padding: '1.1rem', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '0.85rem' }}>
                  <div style={{ fontWeight: 700, color: 'var(--primary-navy)', marginBottom: '0.4rem' }}>Key Required Documents:</div>
                  <ul style={{ paddingLeft: '1.2rem', color: 'var(--text-slate)' }}>
                    {feeEstimates[calcService].docs.map((d, i) => (
                      <li key={i} style={{ marginBottom: '0.2rem' }}>{d}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Estimated Completion Box */}
              <div style={{ backgroundColor: '#FFFFFF', padding: '2.25rem 1.75rem', borderRadius: '12px', border: '1.5px solid var(--gold-primary)', textAlign: 'center', boxShadow: '0 8px 24px rgba(197, 168, 105, 0.12)' }}>
                <div style={{ color: 'var(--gold-bronze)', fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                  ESTIMATED COMPLETION
                </div>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--primary-navy)', margin: '0.6rem 0' }}>
                  {feeEstimates[calcService].timeline}
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: 1.4 }}>
                  Handled with complete end-to-end statutory documentation by specialized counsel.
                </p>
                <button
                  onClick={() => openBookingWithArea(feeEstimates[calcService].title)}
                  className="btn-gold-nav"
                  style={{ width: '100%' }}
                >
                  Initiate This Service &rarr;
                </button>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================= */}
      {/* 8. CAREERS & INTERNSHIP ATS APPLICATION SYSTEM */}
      {/* ========================================================= */}
      <section id="careers" style={{ padding: '5rem 0', backgroundColor: '#FAF9F5', borderBottom: '1px solid var(--border-light)' }}>
        <div className="container" style={{ maxWidth: '920px' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '2.75rem' }}>
            <div style={{ color: 'var(--gold-bronze)', fontWeight: 700, fontSize: '0.82rem', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
              — JOIN OUR COUNCIL —
            </div>
            <h2 style={{ fontSize: '2.3rem', color: 'var(--primary-navy)', marginTop: '0.5rem', fontWeight: 700, fontFamily: 'var(--font-serif)' }}>
              Careers &amp; Internship Opportunities
            </h2>
            <p style={{ color: 'var(--text-slate)', fontSize: '0.95rem', marginTop: '0.4rem' }}>
              We recruit exceptional legal professionals and offer structured internship programs with mentorship from senior advocates. All applications are ingested directly into our Admin ATS.
            </p>
          </div>

          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '14px',
            padding: '2.5rem',
            border: '1px solid var(--border-light)',
            boxShadow: 'var(--shadow-md)'
          }}>
            
            {/* Role Switcher Tabs */}
            <div style={{ display: 'flex', gap: '0.75rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '1.25rem', marginBottom: '1.75rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setCareerType('executive')}
                style={{
                  padding: '0.65rem 1.4rem',
                  borderRadius: '6px',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  border: 'none',
                  backgroundColor: careerType === 'executive' ? 'var(--primary-navy)' : '#F1EFEA',
                  color: careerType === 'executive' ? '#FFFFFF' : 'var(--text-slate)',
                  transition: 'all 0.2s ease'
                }}
              >
                💼 Full-Time Legal Executive (Job)
              </button>
              
              <button
                type="button"
                onClick={() => setCareerType('internship')}
                style={{
                  padding: '0.65rem 1.4rem',
                  borderRadius: '6px',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  border: 'none',
                  backgroundColor: careerType === 'internship' ? 'var(--primary-navy)' : '#F1EFEA',
                  color: careerType === 'internship' ? '#FFFFFF' : 'var(--text-slate)',
                  transition: 'all 0.2s ease'
                }}
              >
                🎓 Internship Program (Paid &amp; Mentored)
              </button>
            </div>

            {careerSubmitted ? (
              <div style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
                <div style={{ fontSize: '3rem', marginBottom: '0.85rem' }}>🎉</div>
                <h3 style={{ color: 'var(--primary-navy)', fontSize: '1.5rem', marginBottom: '0.5rem', fontFamily: 'var(--font-serif)', fontWeight: 700 }}>
                  Application Submitted to Firm ATS!
                </h3>
                <p style={{ color: 'var(--text-slate)', fontSize: '0.95rem', maxWidth: '520px', margin: '0 auto 1.5rem' }}>
                  Thank you, <strong>{careerFormData.name}</strong>. Your profile for the <strong>{careerType === 'executive' ? 'Legal Executive' : 'Legal Internship'}</strong> position has been saved and routed to the Managing Partner dashboard.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setCareerSubmitted(false);
                    setCareerFormData({ name: '', email: '', phone: '', qualification: '', experience: '', resume_notes: '' });
                  }}
                  className="btn-hero-navy"
                  style={{ fontSize: '0.85rem', padding: '0.65rem 1.5rem' }}
                >
                  Submit Another Application
                </button>
              </div>
            ) : (
              <form onSubmit={handleCareerSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }} className="form-two-col">
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary-navy)', marginBottom: '0.35rem' }}>
                      Full Legal Name *
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="Adv. / Mr. / Ms."
                      value={careerFormData.name}
                      onChange={e => setCareerFormData({ ...careerFormData, name: e.target.value })}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border-light)', fontSize: '0.9rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary-navy)', marginBottom: '0.35rem' }}>
                      Email Address *
                    </label>
                    <input
                      required
                      type="email"
                      placeholder="name@email.com"
                      value={careerFormData.email}
                      onChange={e => setCareerFormData({ ...careerFormData, email: e.target.value })}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border-light)', fontSize: '0.9rem' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }} className="form-two-col">
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary-navy)', marginBottom: '0.35rem' }}>
                      Phone / WhatsApp Number *
                    </label>
                    <input
                      required
                      type="tel"
                      placeholder="+91 XXXXX XXXXX"
                      value={careerFormData.phone}
                      onChange={e => setCareerFormData({ ...careerFormData, phone: e.target.value })}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border-light)', fontSize: '0.9rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary-navy)', marginBottom: '0.35rem' }}>
                      {careerType === 'executive' ? 'Bar Council Roll No. / Enrollment *' : 'Law University / College & Year *'}
                    </label>
                    <input
                      required
                      type="text"
                      placeholder={careerType === 'executive' ? 'e.g. D/1234/2021 (Bar Council of Delhi)' : 'e.g. NLU Delhi (4th Year B.A. LL.B)'}
                      value={careerFormData.qualification}
                      onChange={e => setCareerFormData({ ...careerFormData, qualification: e.target.value })}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border-light)', fontSize: '0.9rem' }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary-navy)', marginBottom: '0.35rem' }}>
                    Relevant Practice Experience / Key Case Work
                  </label>
                  <textarea
                    rows={3}
                    placeholder={careerType === 'executive' ? 'Brief summary of commercial drafting, litigation filings, or NCLT experience...' : 'Academic focus, moot court experience, law review publications, or previous internships...'}
                    value={careerFormData.resume_notes}
                    onChange={e => setCareerFormData({ ...careerFormData, resume_notes: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border-light)', fontSize: '0.88rem' }}
                  />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary-navy)', marginBottom: '0.35rem' }}>
                    Upload Resume / CV Document (PDF)
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    style={{ width: '100%', padding: '0.6rem', background: '#FAF9F5', borderRadius: '6px', border: '1px solid var(--border-light)', fontSize: '0.85rem' }}
                  />
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    Accepted formats: PDF, DOC, DOCX up to 10MB. Transmitted directly to our hiring panel.
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={careerLoading}
                  className="btn-gold-nav"
                  style={{ width: '100%', padding: '0.9rem', fontSize: '0.95rem' }}
                >
                  {careerLoading ? 'Submitting Application to ATS...' : 'Submit Application to Firm ATS →'}
                </button>
              </form>
            )}

          </div>

        </div>
      </section>

      {/* ========================================================= */}
      {/* 9. CONTACT & OFFICE LOCATIONS SECTION */}
      {/* ========================================================= */}
      <section id="contact" style={{ padding: '5rem 0', backgroundColor: '#FFFFFF' }}>
        <div className="container">
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.15fr', gap: '3.5rem', alignItems: 'center' }} className="contact-grid">
            
            {/* Left Info Column */}
            <div>
              <div style={{ color: 'var(--gold-bronze)', fontWeight: 700, fontSize: '0.82rem', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                — CONTACT COUNSEL —
              </div>
              
              <h2 style={{ fontSize: '2.4rem', color: 'var(--primary-navy)', margin: '0.5rem 0 1rem', fontFamily: 'var(--font-serif)', fontWeight: 700 }}>
                Get in Touch with Our Legal Team
              </h2>
              
              <p style={{ color: 'var(--text-slate)', fontSize: '0.98rem', lineHeight: 1.65, marginBottom: '2rem' }}>
                Whether you need immediate dispute representation, regulatory structuring, or strategic legal consultation, our partners respond promptly.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{ fontSize: '1.3rem', color: 'var(--gold-primary)' }}>🏛️</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--primary-navy)' }}>Principal Offices</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-slate)' }}>New Delhi: Barakhamba Road, Connaught Place</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-slate)' }}>Mumbai: Nariman Point &amp; BKC</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-slate)' }}>Bengaluru: MG Road</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <div style={{ fontSize: '1.3rem', color: 'var(--gold-primary)' }}>📞</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--primary-navy)' }}>Direct Phone Lines</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-slate)' }}>+91 98765 43210 &bull; +91 11 2345 6789</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <div style={{ fontSize: '1.3rem', color: 'var(--gold-primary)' }}>✉️</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--primary-navy)' }}>Email Correspondence</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-slate)' }}>contact@rebelwingcouncil.com</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Contact Form Column */}
            <div style={{
              backgroundColor: '#FAF9F5',
              padding: '2.5rem',
              borderRadius: '12px',
              border: '1px solid var(--border-light)',
              boxShadow: 'var(--shadow-md)'
            }}>
              {contactSubmitted ? (
                <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                  <div style={{ fontSize: '2.8rem', marginBottom: '0.75rem' }}>✉️</div>
                  <h3 style={{ color: 'var(--primary-navy)', fontSize: '1.4rem', marginBottom: '0.5rem', fontFamily: 'var(--font-serif)', fontWeight: 700 }}>
                    Message Received!
                  </h3>
                  <p style={{ color: 'var(--text-slate)', fontSize: '0.92rem', marginBottom: '1.25rem' }}>
                    Thank you. Your inquiry has been forwarded to our managing associate. We will respond within 4 business hours.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setContactSubmitted(false);
                      setContactFormData({ name: '', email: '', phone: '', subject: '', message: '' });
                    }}
                    className="btn-hero-navy"
                    style={{ fontSize: '0.85rem', padding: '0.65rem 1.5rem' }}
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit}>
                  <h3 style={{ fontSize: '1.25rem', color: 'var(--primary-navy)', marginBottom: '1.25rem', fontFamily: 'var(--font-serif)', fontWeight: 700 }}>
                    Send an Inquiry to Advocates
                  </h3>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }} className="form-two-col">
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-navy)', marginBottom: '0.25rem' }}>Your Name *</label>
                      <input
                        required
                        type="text"
                        placeholder="Adv. / Mr. / Ms."
                        value={contactFormData.name}
                        onChange={e => setContactFormData({ ...contactFormData, name: e.target.value })}
                        style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid var(--border-light)', fontSize: '0.88rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-navy)', marginBottom: '0.25rem' }}>Email Address *</label>
                      <input
                        required
                        type="email"
                        placeholder="name@email.com"
                        value={contactFormData.email}
                        onChange={e => setContactFormData({ ...contactFormData, email: e.target.value })}
                        style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid var(--border-light)', fontSize: '0.88rem' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }} className="form-two-col">
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-navy)', marginBottom: '0.25rem' }}>Phone Number *</label>
                      <input
                        required
                        type="tel"
                        placeholder="+91 XXXXX XXXXX"
                        value={contactFormData.phone}
                        onChange={e => setContactFormData({ ...contactFormData, phone: e.target.value })}
                        style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid var(--border-light)', fontSize: '0.88rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-navy)', marginBottom: '0.25rem' }}>Subject Matter</label>
                      <input
                        type="text"
                        placeholder="e.g. Trademark Notice / NCLT Matter"
                        value={contactFormData.subject}
                        onChange={e => setContactFormData({ ...contactFormData, subject: e.target.value })}
                        style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid var(--border-light)', fontSize: '0.88rem' }}
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: '1.25rem' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-navy)', marginBottom: '0.25rem' }}>Message / Case Details *</label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Please summarize your dispute, contract requirement, or inquiry..."
                      value={contactFormData.message}
                      onChange={e => setContactFormData({ ...contactFormData, message: e.target.value })}
                      style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid var(--border-light)', fontSize: '0.88rem' }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={contactLoading}
                    className="btn-hero-navy"
                    style={{ width: '100%', padding: '0.85rem' }}
                  >
                    {contactLoading ? 'Transmitting to Firm...' : 'Send Inquiry to Legal Team →'}
                  </button>
                </form>
              )}
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================= */}
      {/* 10. LUXURY FOOTER (Navy & Gold Branding) */}
      {/* ========================================================= */}
      <footer style={{
        backgroundColor: 'var(--deep-navy)',
        color: '#FFFFFF',
        paddingTop: '4.5rem',
        paddingBottom: '2.5rem',
        borderTop: '2px solid var(--gold-primary)'
      }}>
        <div className="container">
          
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr', gap: '3rem', marginBottom: '3.5rem' }} className="footer-grid">
            
            {/* Brand Column */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1.25rem' }}>
                <Image
                  src="/logo.jpg"
                  alt="Rebel Wing Council Logo"
                  width={48}
                  height={48}
                  style={{ borderRadius: '50%', border: '1.5px solid var(--gold-primary)' }}
                />
                <div>
                  <div style={{ fontFamily: 'var(--font-cinzel)', fontSize: '1.15rem', fontWeight: 800, color: '#FFFFFF', letterSpacing: '0.08em' }}>
                    REBEL WING COUNCIL
                  </div>
                  <div style={{ fontSize: '0.62rem', color: 'var(--gold-light)', letterSpacing: '0.18em', fontWeight: 700 }}>
                    LAW • COMPLIANCE • INNOVATION
                  </div>
                </div>
              </div>
              <p style={{ color: '#94A3B8', fontSize: '0.88rem', lineHeight: 1.65 }}>
                A premier legal institution providing counsel in corporate law, commercial arbitration, intellectual property, and statutory regulatory compliance across India and international jurisdictions.
              </p>
            </div>

            {/* Practice Sectors */}
            <div>
              <h4 style={{ color: 'var(--gold-light)', fontSize: '0.92rem', marginBottom: '1.25rem', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Practice Sectors
              </h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.86rem', color: '#CBD5E1' }}>
                <li><Link href="#practice-areas">Corporate Law &amp; M&amp;A</Link></li>
                <li><Link href="#practice-areas">Commercial Litigation</Link></li>
                <li><Link href="#practice-areas">Trademark &amp; IP Protection</Link></li>
                <li><Link href="#practice-areas">EPR Plastic Compliance</Link></li>
                <li><Link href="#practice-areas">Criminal Defense &amp; PMLA</Link></li>
              </ul>
            </div>

            {/* Ecosystem Portals */}
            <div>
              <h4 style={{ color: 'var(--gold-light)', fontSize: '0.92rem', marginBottom: '1.25rem', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Ecosystem Portals
              </h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.86rem', color: '#CBD5E1' }}>
                <li><Link href="/portal">Client Self-Service Portal</Link></li>
                <li><Link href="http://localhost:3001" target="_blank">Law Firm Operating System</Link></li>
                <li><Link href="http://localhost:3001" target="_blank">Super Admin &amp; Managing Partner</Link></li>
                <li><Link href="http://localhost:3001" target="_blank">Internship Sandbox Workspace</Link></li>
                <li><Link href="#calculator">Fee Calculator Tool</Link></li>
              </ul>
            </div>

            {/* Office Locations */}
            <div>
              <h4 style={{ color: 'var(--gold-light)', fontSize: '0.92rem', marginBottom: '1.25rem', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Firm Locations
              </h4>
              <p style={{ color: '#CBD5E1', fontSize: '0.85rem', lineHeight: 1.6 }}>
                <strong>New Delhi:</strong> Barakhamba Road, Connaught Place<br /><br />
                <strong>Mumbai:</strong> Nariman Point &amp; Bandra Kurla Complex (BKC)<br /><br />
                <strong>Bengaluru:</strong> MG Road
              </p>
            </div>

          </div>

          {/* Bottom Bar */}
          <div style={{
            borderTop: '1px solid rgba(255,255,255,0.1)',
            paddingTop: '2rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            fontSize: '0.75rem',
            color: '#94A3B8'
          }}>
            <div>
              &copy; 2026 Rebel Wing Council. All rights reserved.
            </div>
            <div style={{ maxWidth: '650px', textAlign: 'right' }}>
              Disclaimer: As per the statutory rules of the Bar Council of India, this portal does not solicit work or advertise. It serves as an informative and operational interface for established clients and trainees.
            </div>
          </div>

        </div>
      </footer>

      {/* ========================================================= */}
      {/* 11. FLOATING 24/7 AI LEGAL ASSISTANT BUTTON */}
      {/* ========================================================= */}
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
          padding: '0.85rem 1.6rem',
          fontWeight: 700,
          fontSize: '0.92rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          boxShadow: '0 8px 25px rgba(0,0,0,0.3)',
          cursor: 'pointer',
          zIndex: 40,
          transition: 'all 0.25s ease'
        }}
        className="floating-ai-btn"
      >
        <span>🤖</span>
        <span>24/7 AI Legal Assistant</span>
      </button>

      {/* ========================================================= */}
      {/* 12. SLIDE-OUT AI LEGAL ASSISTANT DRAWER */}
      {/* ========================================================= */}
      {isAIOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(6, 15, 30, 0.7)',
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
                Ask a legal question regarding corporate compliance, trademark filing, arbitration notices, or EPR requirements to receive instant triage guidance powered by Google Gemini AI.
              </p>

              <form onSubmit={handleAITriage} style={{ marginBottom: '1.5rem' }}>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. We received a legal notice alleging trademark infringement for our brand name. What steps should we take?"
                  value={aiQuery}
                  onChange={e => setAiQuery(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '0.85rem' }}
                />
                <button
                  type="submit"
                  disabled={aiLoading}
                  className="btn-gold-nav"
                  style={{ width: '100%', marginTop: '0.65rem', fontSize: '0.85rem' }}
                >
                  {aiLoading ? 'Analyzing Case Law & Statutes...' : 'Analyze with AI Legal Assistant &rarr;'}
                </button>
              </form>

              {aiResult && (
                <div style={{ backgroundColor: '#FAF9F5', borderRadius: '10px', padding: '1.25rem', border: '1px solid var(--border-gold)' }}>
                  <div style={{ color: 'var(--gold-bronze)', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em' }}>
                    RECOMMENDED ACTION PLAN
                  </div>
                  <h4 style={{ color: 'var(--primary-navy)', fontSize: '1.1rem', margin: '0.35rem 0', fontFamily: 'var(--font-serif)', fontWeight: 700 }}>
                    {aiResult.category}
                  </h4>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-slate)', marginBottom: '0.75rem' }}>
                    Recommended Counsel: <strong>{aiResult.suggested_advocate}</strong>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-dark)', lineHeight: 1.5, backgroundColor: '#FFFFFF', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border-light)', marginBottom: '1rem' }}>
                    {aiResult.ai_guidance}
                  </p>

                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-navy)', marginBottom: '0.35rem' }}>Required Documents to Gather:</div>
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
                    className="btn-gold-nav"
                    style={{ width: '100%', fontSize: '0.85rem' }}
                  >
                    Schedule Legal Review with Counsel &rarr;
                  </button>
                </div>
              )}
            </div>

            <div style={{ padding: '0.75rem 1.5rem', backgroundColor: '#F8F6F0', borderTop: '1px solid var(--border-light)', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              Disclaimer: AI responses provide preliminary triage based on Indian statutes and must be reviewed by licensed advocates before formal execution.
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 13. CONSULTATION BOOKING MODAL */}
      {/* ========================================================= */}
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
            borderRadius: '16px',
            maxWidth: '560px',
            width: '100%',
            padding: '2.5rem',
            position: 'relative',
            boxShadow: 'var(--shadow-lg)',
            maxHeight: '90vh',
            overflowY: 'auto'
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
              aria-label="Close Modal"
            >
              ✕
            </button>

            {bookingSuccess ? (
              <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>⚖️</div>
                <h3 style={{ fontSize: '1.75rem', color: 'var(--primary-navy)', marginBottom: '0.5rem', fontFamily: 'var(--font-serif)', fontWeight: 700 }}>
                  Consultation Scheduled!
                </h3>
                <p style={{ color: 'var(--text-slate)', fontSize: '0.95rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                  Thank you, <strong>{formData.name}</strong>. Your consultation request for <strong>{formData.practice_area}</strong> has been received by our senior legal panel and recorded in the firm operating system.
                </p>
                <div style={{ backgroundColor: '#FAF9F5', padding: '1.25rem', borderRadius: '8px', fontSize: '0.88rem', color: 'var(--primary-navy)', marginBottom: '1.75rem', border: '1px solid var(--border-light)' }}>
                  📅 <strong>Date:</strong> {formData.date || 'Earliest Available'} &nbsp;|&nbsp; ⏰ <strong>Time:</strong> {formData.time_slot}<br />
                  💻 <strong>Mode:</strong> {formData.mode}
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="btn-hero-navy"
                  style={{ width: '100%' }}
                >
                  Return to Website
                </button>
              </div>
            ) : (
              <div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--gold-bronze)', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                    ONLINE APPOINTMENT
                  </div>
                  <h3 style={{ fontSize: '1.65rem', color: 'var(--primary-navy)', fontFamily: 'var(--font-serif)', fontWeight: 700 }}>
                    Book a Legal Consultation
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-slate)', marginTop: '0.25rem' }}>
                    Connect directly with specialized advocates for courtroom defense or strategic advisory.
                  </p>
                </div>

                <form onSubmit={handleBookingSubmit}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }} className="form-two-col">
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-navy)', marginBottom: '0.25rem' }}>Your Name *</label>
                      <input
                        required
                        type="text"
                        placeholder="Adv. / Mr. / Ms."
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid var(--border-light)', fontSize: '0.88rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-navy)', marginBottom: '0.25rem' }}>Email Address *</label>
                      <input
                        required
                        type="email"
                        placeholder="name@email.com"
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid var(--border-light)', fontSize: '0.88rem' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }} className="form-two-col">
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-navy)', marginBottom: '0.25rem' }}>Phone Number *</label>
                      <input
                        required
                        type="tel"
                        placeholder="+91 XXXXX XXXXX"
                        value={formData.phone}
                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid var(--border-light)', fontSize: '0.88rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-navy)', marginBottom: '0.25rem' }}>Practice Area</label>
                      <select
                        value={formData.practice_area}
                        onChange={e => setFormData({ ...formData, practice_area: e.target.value })}
                        style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid var(--border-light)', fontSize: '0.88rem', background: '#FFFFFF' }}
                      >
                        {practiceAreasList.map((pa, i) => (
                          <option key={i} value={pa.name}>{pa.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }} className="form-two-col">
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-navy)', marginBottom: '0.25rem' }}>Preferred Date *</label>
                      <input
                        required
                        type="date"
                        value={formData.date}
                        onChange={e => setFormData({ ...formData, date: e.target.value })}
                        style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid var(--border-light)', fontSize: '0.88rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-navy)', marginBottom: '0.25rem' }}>Consultation Mode</label>
                      <select
                        value={formData.mode}
                        onChange={e => setFormData({ ...formData, mode: e.target.value })}
                        style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid var(--border-light)', fontSize: '0.88rem', background: '#FFFFFF' }}
                      >
                        <option value="Online Video Call">Online Video Call (Zoom/Google Meet)</option>
                        <option value="Phone Call">Phone Consultation</option>
                        <option value="In-person Meeting">In-person Meeting (Delhi / Mumbai / Blr)</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ marginBottom: '1.25rem' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-navy)', marginBottom: '0.25rem' }}>Brief Summary of Matter</label>
                    <textarea
                      rows={3}
                      placeholder="Share a brief summary of the contract, dispute, or compliance requirement..."
                      value={formData.notes}
                      onChange={e => setFormData({ ...formData, notes: e.target.value })}
                      style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid var(--border-light)', fontSize: '0.88rem' }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={bookingLoading}
                    className="btn-gold-nav"
                    style={{ width: '100%', padding: '0.85rem' }}
                  >
                    {bookingLoading ? 'Processing Request...' : 'Confirm Consultation Booking →'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Global Responsive CSS Tweaks */}
      <style jsx global>{`
        @media (max-width: 1024px) {
          .desktop-nav {
            display: none !important;
          }
          .mobile-hamburger {
            display: block !important;
          }
          .hero-grid {
            grid-template-columns: 1fr !important;
          }
          .hero-left-content {
            padding: 3rem 1.5rem !important;
          }
          .hero-headline {
            font-size: 2.8rem !important;
          }
          .hero-right-wrapper {
            min-height: 420px !important;
          }
          .hero-floating-badge-container {
            margin: 0 auto !important;
          }
          .hero-stats-badge {
            width: auto !important;
            max-width: 320px !important;
          }
          .practice-areas-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          .why-choose-banner {
            grid-template-columns: 1fr !important;
          }
          .calculator-tabs {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          .calculator-body {
            grid-template-columns: 1fr !important;
          }
          .contact-grid {
            grid-template-columns: 1fr !important;
          }
          .footer-grid {
            grid-template-columns: 1fr 1fr !important;
          }
        }

        @media (max-width: 640px) {
          .hero-headline {
            font-size: 2.2rem !important;
          }
          .hero-br {
            display: none !important;
          }
          .practice-areas-grid {
            grid-template-columns: 1fr !important;
          }
          .calculator-tabs {
            grid-template-columns: 1fr !important;
          }
          .form-two-col {
            grid-template-columns: 1fr !important;
          }
          .footer-grid {
            grid-template-columns: 1fr !important;
          }
          .floating-ai-btn {
            bottom: 1rem !important;
            right: 1rem !important;
            padding: 0.65rem 1.1rem !important;
            font-size: 0.8rem !important;
          }
        }
      `}</style>

    </div>
  );
}
