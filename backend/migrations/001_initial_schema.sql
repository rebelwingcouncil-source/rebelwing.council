-- ========================================================
-- REBEL WING COUNCIL: SUPABASE POSTGRESQL INITIAL SCHEMA
-- LAW | COMPLIANCE | INNOVATION
-- ========================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. ENUMS
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('super_admin', 'lawyer', 'paralegal', 'intern', 'client');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE lead_status AS ENUM ('New', 'Contacted', 'Consultation Scheduled', 'Proposal Sent', 'Converted', 'Not Interested', 'Lost');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE matter_status AS ENUM ('New', 'Under Review', 'Active', 'Waiting for Client', 'Waiting for Authority', 'On Hold', 'Completed', 'Closed');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE task_status AS ENUM ('New', 'Assigned', 'In Progress', 'Submitted', 'Under Review', 'Revision Required', 'Completed', 'Overdue', 'Cancelled');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE doc_status AS ENUM ('Requested', 'Uploaded', 'Under Review', 'Approved', 'Rejected');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE invoice_status AS ENUM ('Draft', 'Sent', 'Partially Paid', 'Paid', 'Overdue', 'Cancelled');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 2. PROFILES TABLE (Users & RBAC)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_id UUID UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    role user_role NOT NULL DEFAULT 'client',
    designation VARCHAR(100),
    bar_council_id VARCHAR(100),
    organization_name VARCHAR(255),
    gst_number VARCHAR(50),
    pan_number VARCHAR(50),
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PRACTICE AREAS TABLE
CREATE TABLE IF NOT EXISTS practice_areas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL UNIQUE,
    slug VARCHAR(150) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. LEADS & CRM TABLE
CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    service VARCHAR(150),
    practice_area_id UUID REFERENCES practice_areas(id) ON DELETE SET NULL,
    message TEXT,
    source VARCHAR(100) DEFAULT 'Website Enquiry',
    priority VARCHAR(50) DEFAULT 'Medium',
    status lead_status DEFAULT 'New',
    assigned_lawyer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    follow_up_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. CONSULTATIONS TABLE
CREATE TABLE IF NOT EXISTS consultations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
    client_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    practice_area VARCHAR(150),
    consultation_date DATE NOT NULL,
    time_slot VARCHAR(50) NOT NULL,
    mode VARCHAR(50) DEFAULT 'Online', -- Online, Phone, In-person
    meeting_link TEXT,
    assigned_lawyer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'Scheduled',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. MATTERS (LEGAL CASES) TABLE
CREATE TABLE IF NOT EXISTS matters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    matter_id VARCHAR(50) UNIQUE NOT NULL, -- e.g. RWC-2026-0001
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    practice_area_id UUID REFERENCES practice_areas(id) ON DELETE SET NULL,
    client_id UUID REFERENCES profiles(id) ON DELETE RESTRICT,
    assigned_lawyer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    status matter_status DEFAULT 'Active',
    priority VARCHAR(50) DEFAULT 'Normal',
    
    -- Litigation specifics (if court case)
    is_litigation BOOLEAN DEFAULT FALSE,
    court_name VARCHAR(200),
    case_number VARCHAR(100),
    case_type VARCHAR(100),
    bench VARCHAR(100),
    opposite_party VARCHAR(255),
    opposite_advocate VARCHAR(255),
    next_hearing_date DATE,
    previous_hearing_date DATE,
    
    opened_date DATE DEFAULT CURRENT_DATE,
    expected_completion_date DATE,
    closed_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. MATTER MILESTONES (Client-friendly visual tracker)
CREATE TABLE IF NOT EXISTS matter_milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    matter_id UUID NOT NULL REFERENCES matters(id) ON DELETE CASCADE,
    step_number INT NOT NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'pending', -- completed, in_progress, pending
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. TASKS TABLE
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    matter_id UUID REFERENCES matters(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
    assigned_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    reviewer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    start_date DATE DEFAULT CURRENT_DATE,
    deadline DATE NOT NULL,
    priority VARCHAR(50) DEFAULT 'Medium',
    status task_status DEFAULT 'Assigned',
    remarks TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. DEADLINES & LEGAL CALENDAR
CREATE TABLE IF NOT EXISTS deadlines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    matter_id UUID REFERENCES matters(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    deadline_type VARCHAR(100) NOT NULL, -- Court Hearing, Filing Deadline, Statutory Renewal, Contract Expiry, Client Meeting
    due_date DATE NOT NULL,
    due_time TIME,
    assigned_lawyer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    client_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    reminder_days INT[] DEFAULT '{7, 3, 1, 0}',
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. DOCUMENTS & DOCUMENT VAULT
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    matter_id UUID REFERENCES matters(id) ON DELETE CASCADE,
    client_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL, -- Client Documents, Contracts, Court Documents, Research, Drafts, Orders
    file_url TEXT NOT NULL,
    file_type VARCHAR(50),
    file_size_bytes BIGINT,
    is_client_accessible BOOLEAN DEFAULT TRUE,
    uploaded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    version INT DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. CLIENT DOCUMENT REQUESTS (Interactive checklist)
CREATE TABLE IF NOT EXISTS document_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    matter_id UUID REFERENCES matters(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    requested_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    document_name VARCHAR(255) NOT NULL, -- e.g. "Certificate of Incorporation", "GST Registration", "Previous Agreement"
    instructions TEXT,
    status doc_status DEFAULT 'Requested',
    uploaded_document_id UUID REFERENCES documents(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. INVOICES & BILLING
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number VARCHAR(50) UNIQUE NOT NULL, -- e.g. INV-2026-001
    matter_id UUID REFERENCES matters(id) ON DELETE SET NULL,
    client_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    tax_rate NUMERIC(5, 2) DEFAULT 18.00, -- 18% GST
    tax_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    discount_amount NUMERIC(12, 2) DEFAULT 0.00,
    total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    paid_amount NUMERIC(12, 2) DEFAULT 0.00,
    due_date DATE NOT NULL,
    status invoice_status DEFAULT 'Sent',
    payment_link TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS invoice_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    description VARCHAR(255) NOT NULL,
    fee_type VARCHAR(100) DEFAULT 'Professional Fee', -- Professional Fee, Government Fee, Out-of-pocket Expense, Consultation
    quantity INT DEFAULT 1,
    unit_price NUMERIC(12, 2) NOT NULL,
    total NUMERIC(12, 2) NOT NULL
);

-- 13. AUDIT LOGS
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    actor_email VARCHAR(255),
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(100) NOT NULL,
    record_id UUID,
    matter_id UUID REFERENCES matters(id) ON DELETE SET NULL,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. INTERNSHIP & ATS PROFILES
CREATE TABLE IF NOT EXISTS intern_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
    track VARCHAR(100), -- Corporate, Litigation, Compliance, IP
    university VARCHAR(255),
    year_of_study VARCHAR(50),
    mentor_lawyer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    start_date DATE,
    end_date DATE,
    performance_score NUMERIC(3, 1),
    stipend_type VARCHAR(50) DEFAULT 'Paid',
    status VARCHAR(50) DEFAULT 'Active'
);

CREATE TABLE IF NOT EXISTS daily_work_updates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    intern_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    work_date DATE NOT NULL DEFAULT CURRENT_DATE,
    tasks_completed TEXT NOT NULL,
    hours_logged NUMERIC(4, 2) DEFAULT 8.0,
    challenges_faced TEXT,
    mentor_feedback TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================================
-- SEED DATA: Standard Indian Practice Areas & Demo Records
-- ========================================================

INSERT INTO practice_areas (name, slug, description, icon) VALUES
('Corporate & Commercial Law', 'corporate-law', 'Entity incorporation, compliance, corporate governance, contracts, and M&A.', 'briefcase'),
('Intellectual Property', 'intellectual-property', 'Trademark registrations, copyright protection, patent filings, and IP infringement defense.', 'award'),
('Litigation & Dispute Resolution', 'litigation-dispute', 'Civil and commercial court representation, arbitration, mediation, and High Court matters.', 'scale'),
('Criminal & White-Collar Defense', 'criminal-defense', 'Representation in economic offences, cyber fraud, corporate compliance audits, and trials.', 'shield'),
('Employment & Labour Law', 'employment-labour', 'Employment agreements, workplace compliance (POSH), HR policies, and union disputes.', 'users'),
('Environmental & EPR Compliance', 'epr-compliance', 'Extended Producer Responsibility registrations, CPCB/SPCB permits, and sustainability laws.', 'leaf'),
('Banking, Insolvency & Bankruptcy', 'banking-insolvency', 'IBC proceedings, debt restructuring, NCLT representation, and banking compliance.', 'dollar-sign'),
('Cyber Law & Data Privacy', 'cyber-privacy', 'Digital Personal Data Protection (DPDP) Act compliance, privacy policies, and IT security.', 'lock')
ON CONFLICT (slug) DO NOTHING;

-- Seed initial Managing Partner / Admin profile
INSERT INTO profiles (full_name, email, phone, role, designation, bar_council_id, is_active)
VALUES 
('Adv. Rajeshwar Sharma', 'admin@rebelwingcouncil.com', '+91 98765 43210', 'super_admin', 'Managing Partner & Senior Advocate', 'BC/2008/11429', TRUE),
('Adv. Priya Deshmukh', 'priya.d@rebelwingcouncil.com', '+91 98220 12345', 'lawyer', 'Partner - Corporate & M&A', 'BC/2014/08214', TRUE),
('Adv. Vikramaditya Rathore', 'vikram.r@rebelwingcouncil.com', '+91 98330 54321', 'lawyer', 'Head of Litigation & Arbitration', 'BC/2012/04519', TRUE),
('Neha Verma', 'neha.v@rebelwingcouncil.com', '+91 98440 98765', 'paralegal', 'Senior Legal Executive & Compliance Specialist', NULL, TRUE),
('Arjun Mehta', 'arjun.m@rebelwingcouncil.com', '+91 98550 45678', 'intern', 'Legal Research Intern', NULL, TRUE),
('Aditi Mehra', 'aditi.client@acmeholdings.com', '+91 98111 22233', 'client', 'Director, Acme Holdings India Pvt Ltd', NULL, TRUE)
ON CONFLICT (email) DO NOTHING;

-- Seed initial Matter
DO $$
DECLARE
    client_rec RECORD;
    lawyer_rec RECORD;
    practice_rec RECORD;
    matter_id_val UUID;
BEGIN
    SELECT id INTO client_rec FROM profiles WHERE email = 'aditi.client@acmeholdings.com' LIMIT 1;
    SELECT id INTO lawyer_rec FROM profiles WHERE email = 'priya.d@rebelwingcouncil.com' LIMIT 1;
    SELECT id INTO practice_rec FROM practice_areas WHERE slug = 'corporate-law' LIMIT 1;

    IF client_rec.id IS NOT NULL AND lawyer_rec.id IS NOT NULL THEN
        INSERT INTO matters (
            matter_id, title, description, category, practice_area_id, client_id, assigned_lawyer_id, status, priority, opened_date
        ) VALUES (
            'RWC-2026-0001',
            'Acme Holdings Corporate Restructuring & Compliance',
            'Comprehensive corporate restructuring, drafting shareholder agreements, and MCA filings.',
            'Corporate Restructuring',
            practice_rec.id,
            client_rec.id,
            lawyer_rec.id,
            'Active',
            'High',
            CURRENT_DATE - INTERVAL '15 days'
        ) ON CONFLICT (matter_id) DO NOTHING
        RETURNING id INTO matter_id_val;

        IF matter_id_val IS NOT NULL THEN
            -- Add 5-step client milestones
            INSERT INTO matter_milestones (matter_id, step_number, title, description, status, completed_at) VALUES
            (matter_id_val, 1, 'Documents Received & Verified', 'All required corporate filings, PAN, and MoA collected and verified.', 'completed', NOW() - INTERVAL '10 days'),
            (matter_id_val, 2, 'Restructuring Documents Drafted', 'Shareholder agreement and corporate restructuring resolution prepared.', 'completed', NOW() - INTERVAL '3 days'),
            (matter_id_val, 3, 'Board Approval & Execution', 'Execution of agreements by board members and authorized signatories.', 'in_progress', NULL),
            (matter_id_val, 4, 'Filing with Regulatory Authorities', 'Submission of Form MGT-14 and statutory documentation to Registrar of Companies.', 'pending', NULL),
            (matter_id_val, 5, 'Final Certificate & Closure', 'Receipt of MCA approval certificate and matter archival.', 'pending', NULL);

            -- Add sample document requests for client
            INSERT INTO document_requests (matter_id, client_id, requested_by, document_name, instructions, status) VALUES
            (matter_id_val, client_rec.id, lawyer_rec.id, 'Board Resolution for Restructuring', 'Signed and stamped board resolution authorizing restructuring.', 'Approved'),
            (matter_id_val, client_rec.id, lawyer_rec.id, 'Latest Audited Balance Sheet (FY 2025-26)', 'Signed copy of the balance sheet and profit & loss statement.', 'Uploaded'),
            (matter_id_val, client_rec.id, lawyer_rec.id, 'Updated Shareholder Register', 'Certified list of existing shareholders with shareholding percentages.', 'Requested');

            -- Add sample deadline
            INSERT INTO deadlines (matter_id, title, deadline_type, due_date, assigned_lawyer_id, client_id) VALUES
            (matter_id_val, 'Statutory ROC Filing (Form MGT-14)', 'Filing Deadline', CURRENT_DATE + INTERVAL '5 days', lawyer_rec.id, client_rec.id);

            -- Add sample task
            INSERT INTO tasks (matter_id, title, description, assigned_to, assigned_by, deadline, priority, status) VALUES
            (matter_id_val, 'Review final draft of Shareholder Agreement', 'Cross-check non-compete and indemnification clauses with partner.', lawyer_rec.id, lawyer_rec.id, CURRENT_DATE + INTERVAL '2 days', 'High', 'In Progress');
        END IF;
    END IF;
END $$;
