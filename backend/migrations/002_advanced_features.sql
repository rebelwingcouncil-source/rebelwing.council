-- ========================================================
-- REBEL WING COUNCIL: ADVANCED LEGAL MODULES MIGRATION
-- LAW | COMPLIANCE | INNOVATION
-- ========================================================

-- 1. LEGAL RESEARCH TASKS
CREATE TABLE IF NOT EXISTS legal_research_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    matter_id UUID REFERENCES matters(id) ON DELETE CASCADE,
    research_question TEXT NOT NULL,
    jurisdiction VARCHAR(100) DEFAULT 'India (Supreme Court & High Courts)',
    relevant_legislation TEXT,
    assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
    assigned_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    deadline DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'Assigned', -- Assigned, In Progress, Submitted, Approved, Revision Required
    research_notes TEXT,
    citations TEXT,
    reviewer_feedback TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. KNOWLEDGE BASE & PRECEDENTS
CREATE TABLE IF NOT EXISTS knowledge_base (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL, -- Acts, Case Law Precedents, Circulars, Standard Operating Procedures
    court_or_authority VARCHAR(150),
    citation VARCHAR(150),
    summary TEXT NOT NULL,
    key_takeaways TEXT,
    tags TEXT[],
    author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. REUSABLE LEGAL TEMPLATES
CREATE TABLE IF NOT EXISTS legal_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL, -- Corporate, NDA, Notice, Employment, Compliance
    description TEXT,
    template_content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed Knowledge Base Precedents
INSERT INTO knowledge_base (title, category, court_or_authority, citation, summary, key_takeaways, tags) VALUES
('Tata Consultancy Services v. Cyrus Investments', 'Case Law Precedents', 'Supreme Court of India', '(2021) 9 SCC 449', 'Landmark ruling on oppression and mismanagement under Section 241/242 of the Companies Act, 2013.', 'Reiterates majority rule; winding up grounds under just and equitable clause must be strictly proved.', '{"Corporate Law", "Oppression & Mismanagement", "NCLAT"}'),
('Vidya Drolia v. Durga Trading Corporation', 'Case Law Precedents', 'Supreme Court of India', '(2021) 2 SCC 1', 'Four-fold test for determining arbitrability of disputes under the Arbitration and Conciliation Act, 1996.', 'Disputes involving rights in rem are non-arbitrable; landlord-tenant disputes are arbitrable.', '{"Arbitration", "Commercial Disputes", "High Court"}'),
('EPR Guidelines for Plastic Packaging (2022 Amendment)', 'Acts & Rules', 'Ministry of Environment, Forest & Climate Change', 'G.S.R. 133(E)', 'Mandatory Extended Producer Responsibility registration and recycling targets for brand owners and importers.', 'Entities must register on CPCB centralized portal and fulfill annual recycling targets.', '{"EPR", "Environmental Law", "Compliance"}')
ON CONFLICT DO NOTHING;

-- Seed Legal Research Tasks
DO $$
DECLARE
    matter_rec RECORD;
    lawyer_rec RECORD;
    intern_rec RECORD;
BEGIN
    SELECT id INTO matter_rec FROM matters WHERE matter_id = 'RWC-2026-0001' LIMIT 1;
    SELECT id INTO lawyer_rec FROM profiles WHERE email = 'priya.d@rebelwingcouncil.com' LIMIT 1;
    SELECT id INTO intern_rec FROM profiles WHERE email = 'arjun.m@rebelwingcouncil.com' LIMIT 1;

    IF matter_rec.id IS NOT NULL AND intern_rec.id IS NOT NULL THEN
        INSERT INTO legal_research_tasks (
            matter_id, research_question, jurisdiction, relevant_legislation, assigned_to, assigned_by, deadline, status, research_notes
        ) VALUES (
            matter_rec.id,
            'Whether minority shareholders can seek interim injunction against restructuring approved by 85% majority?',
            'National Company Law Tribunal (New Delhi Bench)',
            'Sections 230-232, Companies Act 2013; NCLT Rules',
            intern_rec.id,
            lawyer_rec.id,
            CURRENT_DATE + INTERVAL '3 days',
            'In Progress',
            'Examining recent Delhi and Mumbai NCLT decisions on procedural safeguards during scheme approvals.'
        ) ON CONFLICT DO NOTHING;
    END IF;
END $$;
