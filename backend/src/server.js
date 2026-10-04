import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool, supabase, query } from './db.js';
import { syncLeadToAirtable, syncApplicantToAirtable } from './airtable.js';
import { getGeminiLegalTriage } from './gemini.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    if (
      origin.startsWith('http://localhost:') ||
      origin.endsWith('.vercel.app') ||
      origin.includes('rebelwing')
    ) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'apikey']
}));
app.options('*', cors());
app.use(express.json());
app.use(morgan('dev'));

// ==========================================
// 1. HEALTH & SYSTEM STATS
// ==========================================
app.get('/api/health', async (req, res) => {
  try {
    const dbRes = await query('SELECT NOW()');
    res.json({
      status: 'healthy',
      service: 'Rebel Wing Council Operating System Backend',
      database: 'connected',
      db_time: dbRes.rows[0].now,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ status: 'degraded', error: err.message });
  }
});

// Admin Dashboard Summary Metrics
app.get('/api/stats', async (req, res) => {
  try {
    const result = await query(`
      SELECT 
        (SELECT COUNT(*) FROM profiles WHERE role = 'client') as total_clients,
        (SELECT COUNT(*) FROM matters WHERE status = 'Active') as active_matters,
        (SELECT COUNT(*) FROM tasks WHERE status != 'Completed') as pending_tasks,
        (SELECT COUNT(*) FROM deadlines WHERE due_date <= CURRENT_DATE + INTERVAL '7 days' AND is_completed = FALSE) as urgent_deadlines,
        (SELECT COUNT(*) FROM leads WHERE status = 'New') as new_leads,
        (SELECT COUNT(*) FROM legal_research_tasks WHERE status != 'Approved') as active_research
    `);

    const row = result.rows[0] || {};
    res.json({
      success: true,
      stats: {
        total_clients: parseInt(row.total_clients || 0),
        active_matters: parseInt(row.active_matters || 0),
        pending_tasks: parseInt(row.pending_tasks || 0),
        urgent_deadlines: parseInt(row.urgent_deadlines || 0),
        new_leads: parseInt(row.new_leads || 0),
        active_research: parseInt(row.active_research || 0),
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 1.5 AUTHENTICATION & RBAC LOGIN
// ==========================================
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Email and password are required.' });
  }

  // Pre-configured role credentials
  const credentials = {
    'admin@rebelwingcouncil.com': { password: 'Admin@RebelWing2026', role: 'super_admin' },
    'priya.d@rebelwingcouncil.com': { password: 'Lawyer@RebelWing2026', role: 'lawyer' },
    'vikram.r@rebelwingcouncil.com': { password: 'Lawyer@RebelWing2026', role: 'lawyer' },
    'neha.v@rebelwingcouncil.com': { password: 'Paralegal@RebelWing2026', role: 'paralegal' },
    'arjun.m@rebelwingcouncil.com': { password: 'Intern@RebelWing2026', role: 'intern' },
    'aditi.client@acmeholdings.com': { password: 'Client@RebelWing2026', role: 'client' }
  };

  const userCred = credentials[email.toLowerCase().trim()];
  if (!userCred || userCred.password !== password) {
    return res.status(401).json({ success: false, error: 'Invalid email or password.' });
  }

  try {
    const profileRes = await query('SELECT * FROM profiles WHERE email = $1', [email.toLowerCase().trim()]);
    const profile = profileRes.rows[0] || {
      email,
      role: userCred.role,
      full_name: email === 'admin@rebelwingcouncil.com' ? 'Adv. Rajeshwar Sharma' : 'Legal Counsel'
    };

    res.json({
      success: true,
      user: {
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        role: profile.role,
        designation: profile.designation,
        bar_council_id: profile.bar_council_id
      },
      token: `rwc_session_${Date.now()}`
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 2. PRACTICE AREAS
// ==========================================
app.get('/api/practice-areas', async (req, res) => {
  try {
    const result = await query('SELECT * FROM practice_areas WHERE is_active = TRUE ORDER BY name ASC');
    res.json({ success: true, practice_areas: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 3. LEADS & CRM INGESTION
// ==========================================
app.post('/api/leads', async (req, res) => {
  const { name, email, phone, service, message, source, practice_area_id } = req.body;
  if (!name || !email || !phone) {
    return res.status(400).json({ success: false, error: 'Name, email, and phone are required.' });
  }
  try {
    const result = await query(
      `INSERT INTO leads (name, email, phone, service, practice_area_id, message, source, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'New', NOW())
       RETURNING *`,
      [name, email, phone, service || 'General Consultation', practice_area_id || null, message || '', source || 'Website Enquiry']
    );
    res.status(201).json({ success: true, lead: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/leads', async (req, res) => {
  try {
    const result = await query(`
      SELECT l.*, pa.name as practice_area_name, p.full_name as assigned_lawyer_name
      FROM leads l
      LEFT JOIN practice_areas pa ON l.practice_area_id = pa.id
      LEFT JOIN profiles p ON l.assigned_lawyer_id = p.id
      ORDER BY l.created_at DESC
    `);
    res.json({ success: true, leads: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.patch('/api/leads/:id', async (req, res) => {
  const { id } = req.params;
  const { status, priority, notes } = req.body;
  try {
    const result = await query(`
      UPDATE leads
      SET status = COALESCE($1, status),
          priority = COALESCE($2, priority),
          notes = COALESCE($3, notes),
          updated_at = NOW()
      WHERE id = $4
      RETURNING *
    `, [status, priority, notes, id]);
    res.json({ success: true, lead: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 4. CONSULTATIONS
// ==========================================
app.get('/api/consultations', async (req, res) => {
  try {
    const result = await query(`
      SELECT c.*, p.full_name as assigned_lawyer_name
      FROM consultations c
      LEFT JOIN profiles p ON c.assigned_lawyer_id = p.id
      ORDER BY c.created_at DESC
    `);
    res.json({ success: true, consultations: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.patch('/api/consultations/:id', async (req, res) => {
  const { id } = req.params;
  const { status, notes, meeting_link } = req.body;
  try {
    const result = await query(`
      UPDATE consultations
      SET status = COALESCE($1, status),
          notes = COALESCE($2, notes),
          meeting_link = COALESCE($3, meeting_link)
      WHERE id = $4
      RETURNING *
    `, [status, notes, meeting_link, id]);
    res.json({ success: true, consultation: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/consultations', async (req, res) => {
  const name = req.body.name || req.body.client_name;
  const email = req.body.email || req.body.client_email;
  const phone = req.body.phone || req.body.client_phone;
  const date = req.body.date || req.body.preferred_date;
  const time_slot = req.body.time_slot || req.body.preferred_time || req.body.time;
  const mode = req.body.mode || 'Online';
  const practice_area = req.body.practice_area || 'General Legal Advice';
  const notes = req.body.notes || '';

  if (!name || !email || !phone || !date || !time_slot) {
    return res.status(400).json({ success: false, error: 'Name, email, phone, date, and time slot are required.' });
  }
  try {
    const result = await query(
      `INSERT INTO consultations (client_name, email, phone, consultation_date, time_slot, mode, practice_area, notes, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'Scheduled', NOW())
       RETURNING *`,
      [name, email, phone, date, time_slot, mode, practice_area, notes]
    );

    await query(
      `INSERT INTO leads (name, email, phone, service, message, source, status, created_at)
       VALUES ($1, $2, $3, $4, $5, 'Online Consultation Booking', 'Consultation Scheduled', NOW())`,
      [name, email, phone, practice_area, `Booked for ${date} at ${time_slot} (${mode}). Notes: ${notes || 'None'}`]
    );

    // Non-blocking sync to Airtable CRM Base
    syncLeadToAirtable({ name, email, phone, practice_area, date, time_slot, mode, notes }).catch(err => {
      console.error('[Airtable Sync Err]:', err.message);
    });

    res.status(201).json({ success: true, consultation: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});


// ==========================================
// 5. MATTERS & CASE REGISTRY
// ==========================================
app.get('/api/matters', async (req, res) => {
  try {
    const result = await query(`
      SELECT m.*, 
             c.full_name as client_name, c.email as client_email, c.organization_name,
             l.full_name as lawyer_name,
             pa.name as practice_area_name
      FROM matters m
      LEFT JOIN profiles c ON m.client_id = c.id
      LEFT JOIN profiles l ON m.assigned_lawyer_id = l.id
      LEFT JOIN practice_areas pa ON m.practice_area_id = pa.id
      ORDER BY m.opened_date DESC
    `);
    res.json({ success: true, matters: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/matters/:id', async (req, res) => {
  const { id } = req.params;
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  try {
    const matterRes = await query(`
      SELECT m.*, 
             c.full_name as client_name, c.email as client_email, c.phone as client_phone, c.organization_name,
             l.full_name as lawyer_name, l.email as lawyer_email,
             pa.name as practice_area_name
      FROM matters m
      LEFT JOIN profiles c ON m.client_id = c.id
      LEFT JOIN profiles l ON m.assigned_lawyer_id = l.id
      LEFT JOIN practice_areas pa ON m.practice_area_id = pa.id
      WHERE ${isUuid ? 'm.id = $1' : 'm.matter_id = $1'}
    `, [id]);

    if (matterRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Matter not found' });
    }

    const matter = matterRes.rows[0];

    const [milestonesRes, tasksRes, docRequestsRes, deadlinesRes] = await Promise.all([
      query('SELECT * FROM matter_milestones WHERE matter_id = $1 ORDER BY step_number ASC', [matter.id]),
      query('SELECT * FROM tasks WHERE matter_id = $1 ORDER BY deadline ASC', [matter.id]),
      query('SELECT * FROM document_requests WHERE matter_id = $1 ORDER BY created_at ASC', [matter.id]),
      query('SELECT * FROM deadlines WHERE matter_id = $1 ORDER BY due_date ASC', [matter.id]),
    ]);

    res.json({
      success: true,
      matter,
      milestones: milestonesRes.rows,
      tasks: tasksRes.rows,
      document_requests: docRequestsRes.rows,
      deadlines: deadlinesRes.rows
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/matters', async (req, res) => {
  const { title, category, priority, client_name } = req.body;
  if (!title) {
    return res.status(400).json({ success: false, error: 'Matter title is required.' });
  }
  try {
    const countRes = await query('SELECT count(*) FROM matters');
    const num = parseInt(countRes.rows[0].count) + 1;
    const matter_id = `RWC-2026-${String(num).padStart(4, '0')}`;

    const clientRes = await query("SELECT id FROM profiles WHERE role = 'client' LIMIT 1");
    const lawyerRes = await query("SELECT id FROM profiles WHERE role = 'lawyer' LIMIT 1");
    const paRes = await query("SELECT id FROM practice_areas LIMIT 1");

    const clientId = clientRes.rows[0]?.id;
    const lawyerId = lawyerRes.rows[0]?.id;
    const paId = paRes.rows[0]?.id;

    const result = await query(
      `INSERT INTO matters (matter_id, title, category, priority, status, client_id, assigned_lawyer_id, practice_area_id, opened_date, created_at)
       VALUES ($1, $2, $3, $4, 'Active', $5, $6, $7, CURRENT_DATE, NOW())
       RETURNING *`,
      [matter_id, title, category || 'General Corporate', priority || 'Normal', clientId, lawyerId, paId]
    );

    const newMatter = result.rows[0];

    // Seed 5 standard milestones
    await query(`
      INSERT INTO matter_milestones (matter_id, step_number, title, description, status) VALUES
      ($1, 1, 'Initial Legal Intake', 'Case onboarding and document collection', 'in_progress'),
      ($1, 2, 'Statutory & Case Law Research', 'Research precedents and legal strategy', 'pending'),
      ($1, 3, 'Pleadings & Agreement Drafting', 'Draft petition / agreement for client review', 'pending'),
      ($1, 4, 'Filing / Regulatory Submission', 'Submit to relevant tribunal / authority', 'pending'),
      ($1, 5, 'Final Disposition & Order', 'Obtain final order or closing documentation', 'pending')
    `, [newMatter.id]);

    res.status(201).json({ success: true, matter: newMatter });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 6. LEGAL CALENDAR & DEADLINES
// ==========================================
app.get('/api/deadlines', async (req, res) => {
  try {
    const result = await query(`
      SELECT d.*, m.matter_id as code, m.title as matter_title,
             p.full_name as lawyer_name
      FROM deadlines d
      LEFT JOIN matters m ON d.matter_id = m.id
      LEFT JOIN profiles p ON d.assigned_lawyer_id = p.id
      ORDER BY d.due_date ASC
    `);

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    const overdue = [];
    const today = [];
    const upcoming = [];

    result.rows.forEach(d => {
      const dStr = new Date(d.due_date).toISOString().split('T')[0];
      if (dStr < todayStr && !d.is_completed) {
        overdue.push(d);
      } else if (dStr === todayStr) {
        today.push(d);
      } else {
        upcoming.push(d);
      }
    });

    res.json({
      success: true,
      summary: {
        total: result.rows.length,
        overdue_count: overdue.length,
        today_count: today.length,
      },
      deadlines: {
        overdue,
        today,
        upcoming
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 7. CLIENT DOCUMENT REQUESTS
// ==========================================
app.get('/api/document-requests', async (req, res) => {
  try {
    const result = await query(`
      SELECT dr.*, m.matter_id as code, m.title as matter_title,
             c.full_name as client_name
      FROM document_requests dr
      LEFT JOIN matters m ON dr.matter_id = m.id
      LEFT JOIN profiles c ON dr.client_id = c.id
      ORDER BY dr.created_at DESC
    `);
    res.json({ success: true, requests: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.patch('/api/document-requests/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const result = await query(
      'UPDATE document_requests SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [status, id]
    );
    res.json({ success: true, request: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 8. LEGAL RESEARCH & KNOWLEDGE BASE
// ==========================================
app.get('/api/research-tasks', async (req, res) => {
  try {
    const result = await query(`
      SELECT rt.*, m.matter_id as code, m.title as matter_title,
             p.full_name as assigned_to_name
      FROM legal_research_tasks rt
      LEFT JOIN matters m ON rt.matter_id = m.id
      LEFT JOIN profiles p ON rt.assigned_to = p.id
      ORDER BY rt.deadline ASC
    `);
    res.json({ success: true, tasks: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/knowledge-base', async (req, res) => {
  try {
    const result = await query('SELECT * FROM knowledge_base ORDER BY created_at DESC');
    res.json({ success: true, precedents: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/research-tasks', async (req, res) => {
  const { research_question, relevant_legislation, jurisdiction, assigned_to_name, deadline } = req.body;
  if (!research_question) {
    return res.status(400).json({ success: false, error: 'Research question is required.' });
  }
  try {
    const internRes = await query("SELECT id FROM profiles WHERE role = 'intern' LIMIT 1");
    const lawyerRes = await query("SELECT id FROM profiles WHERE role = 'super_admin' LIMIT 1");
    const matterRes = await query("SELECT id FROM matters LIMIT 1");

    const result = await query(
      `INSERT INTO legal_research_tasks (matter_id, research_question, relevant_legislation, jurisdiction, assigned_to, assigned_by, deadline, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'Assigned', NOW())
       RETURNING *`,
      [
        matterRes.rows[0]?.id,
        research_question,
        relevant_legislation || 'Companies Act, 2013 / Precedents',
        jurisdiction || 'High Court of Delhi',
        internRes.rows[0]?.id,
        lawyerRes.rows[0]?.id,
        deadline ? deadline.split('T')[0] : new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0]
      ]
    );
    res.status(201).json({ success: true, task: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/intern/daily-updates', async (req, res) => {
  const { hours_logged, tasks_completed, challenges_faced } = req.body;
  if (!tasks_completed) {
    return res.status(400).json({ success: false, error: 'Tasks completed description is required.' });
  }
  try {
    const internRes = await query("SELECT id FROM profiles WHERE role = 'intern' LIMIT 1");
    const internId = internRes.rows[0]?.id;
    if (!internId) {
      return res.status(400).json({ success: false, error: 'Intern profile not found' });
    }
    const result = await query(
      `INSERT INTO daily_work_updates (intern_id, work_date, hours_logged, tasks_completed, challenges_faced, created_at)
       VALUES ($1, CURRENT_DATE, $2, $3, $4, NOW())
       RETURNING *`,
      [internId, parseFloat(hours_logged || '8.0'), tasks_completed, challenges_faced || '']
    );
    res.status(201).json({ success: true, update: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 8. CAREERS & ATS APPLICATIONS
// ==========================================
app.get('/api/applications', async (req, res) => {
  const { type } = req.query; // 'job' or 'internship'
  try {
    let queryText = 'SELECT * FROM applications';
    let params = [];
    if (type) {
      queryText += ' WHERE type = $1';
      params.push(type);
    }
    queryText += ' ORDER BY created_at DESC';
    const result = await query(queryText, params);
    res.json({ success: true, applications: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.patch('/api/applications/:id', async (req, res) => {
  const { id } = req.params;
  const { status, resume_notes } = req.body;
  try {
    const result = await query(`
      UPDATE applications
      SET status = COALESCE($1, status),
          resume_notes = COALESCE($2, resume_notes),
          updated_at = NOW()
      WHERE id = $3
      RETURNING *
    `, [status, resume_notes, id]);
    res.json({ success: true, application: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post(['/api/careers', '/api/applications'], async (req, res) => {
  const { name, email, phone, role, type, qualification, experience, resume_notes, resume_filename } = req.body;
  if (!name || !email) {
    return res.status(400).json({ success: false, error: 'Name and email are required.' });
  }
  const appType = type || (role && (role.toLowerCase().includes('intern') || role.toLowerCase().includes('student')) ? 'internship' : 'job');
  const roleTitle = role || (appType === 'internship' ? 'Legal Internship Candidate' : 'Legal Executive');

  try {
    const result = await query(
      `INSERT INTO applications (type, role, name, email, phone, qualification, experience, resume_notes, resume_filename, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'New', NOW(), NOW())
       RETURNING *`,
      [appType, roleTitle, name, email, phone || '', qualification || '', experience || '', resume_notes || '', resume_filename || '']
    );

    // Also mirror to leads table so it appears in unified CRM
    await query(
      `INSERT INTO leads (name, email, phone, service, message, source, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, 'New', NOW())`,
      [
        name,
        email,
        phone || '',
        `${appType === 'internship' ? 'Internship Application' : 'Job Application'}: ${roleTitle}`,
        `Type: ${appType}. Qualification / Roll No: ${qualification || 'N/A'}. Exp: ${experience || 'N/A'}. Details: ${resume_notes || 'Submitted via website ATS'}`,
        appType === 'internship' ? 'Website Internship ATS' : 'Website Career ATS'
      ]
    );

    // Non-blocking sync to Airtable ATS Base
    syncApplicantToAirtable({ name, email, phone, role: roleTitle, experience: qualification || experience, resume_notes }).catch(err => {
      console.error('[Airtable Sync Err]:', err.message);
    });

    res.status(201).json({ success: true, application: result.rows[0], applicant: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Summary Endpoint for All Submissions & Inquiries
app.get('/api/submissions/summary', async (req, res) => {
  try {
    const result = await query(`
      SELECT
        (SELECT COUNT(*) FROM leads) as total_leads,
        (SELECT COUNT(*) FROM consultations) as total_consultations,
        (SELECT COUNT(*) FROM applications WHERE type = 'job') as job_applications,
        (SELECT COUNT(*) FROM applications WHERE type = 'internship') as internship_applications
    `);

    const row = result.rows[0] || {};
    res.json({
      success: true,
      total_leads: parseInt(row.total_leads || 0),
      total_consultations: parseInt(row.total_consultations || 0),
      job_applications: parseInt(row.job_applications || 0),
      internship_applications: parseInt(row.internship_applications || 0)
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 9. AI LEGAL ASSISTANT & CONTRACT REVIEW
// ==========================================
app.post(['/api/ai/legal-triage', '/api/ai/triage'], async (req, res) => {
  const { query: userQuery } = req.body;
  if (!userQuery) {
    return res.status(400).json({ success: false, error: 'Query is required.' });
  }

  // 1. Intelligent Legal Analysis via Google Gemini AI
  try {
    const geminiAssessment = await getGeminiLegalTriage(userQuery);
    if (geminiAssessment && geminiAssessment.category) {
      return res.json({
        success: true,
        source: 'Google Gemini AI',
        triage: geminiAssessment,
        ai_analysis: geminiAssessment
      });
    }
  } catch (geminiErr) {
    console.warn('[Gemini Triage Error]:', geminiErr.message);
  }

  // 2. Curated Statutory Legal Heuristics (Ensures 100% High-Availability)
  const qLower = (userQuery || '').toLowerCase();

  let recommendation = {
    category: 'Corporate & Commercial Law',
    suggested_advocate: 'Adv. Priya Deshmukh (Partner)',
    estimated_timeline: '2-4 weeks',
    key_requirements: ['Certificate of Incorporation', 'Board Resolution', 'Prior Agreements'],
    ai_guidance: 'Based on your query, we recommend a preliminary corporate review to ensure statutory compliance with MCA and relevant authority guidelines.'
  };

  if (qLower.includes('trademark') || qLower.includes('patent') || qLower.includes('copyright') || qLower.includes('brand')) {
    recommendation = {
      category: 'Intellectual Property Rights',
      suggested_advocate: 'Adv. Rajeshwar Sharma (Managing Partner)',
      estimated_timeline: '3-6 months (Statutory publication stage)',
      key_requirements: ['Logo artwork in high-res', 'Date of first use in commerce', 'Power of Attorney (Form TM-48)'],
      ai_guidance: 'Prior to trademark application, our team conducts a comprehensive phonetics and class search across the Indian Trade Marks Registry.'
    };
  } else if (qLower.includes('court') || qLower.includes('dispute') || qLower.includes('arbitration') || qLower.includes('notice')) {
    recommendation = {
      category: 'Litigation & Dispute Resolution',
      suggested_advocate: 'Adv. Vikramaditya Rathore (Head of Litigation)',
      estimated_timeline: 'Immediate (15-day statutory reply window for legal notices)',
      key_requirements: ['Original notice/summons received', 'Contract containing dispute clause', 'Correspondence trail'],
      ai_guidance: 'For legal notices and dispute filings, swift action is essential to preserve your statutory defence and avoid ex-parte proceedings.'
    };
  } else if (qLower.includes('plastic') || qLower.includes('epr') || qLower.includes('environment') || qLower.includes('battery')) {
    recommendation = {
      category: 'Environmental & EPR Compliance',
      suggested_advocate: 'Neha Verma (Senior Legal Executive)',
      estimated_timeline: '3-4 weeks for CPCB centralized portal approval',
      key_requirements: ['Producer/Brand Owner sales records', 'Authorized recyclers agreement', 'SPCB consent to operate'],
      ai_guidance: 'EPR registration is mandatory under MOEFCC guidelines. Non-compliance invites substantial environmental compensation under the CPCB portal.'
    };
  }

  res.json({ success: true, source: 'Statutory Rule Heuristics', triage: recommendation, ai_analysis: recommendation });
});

app.get('/api/ai/status', (req, res) => {
  const isConfigured = !!(process.env.GEMINI_API_KEY);
  res.json({
    service: 'Google Gemini Legal AI',
    configured: isConfigured,
    model: 'gemini-1.5-flash / gemini-2.0-flash',
    status: isConfigured ? 'Active & Powered by Gemini' : 'Pending GEMINI_API_KEY (Falling back to Curated Legal Rules)'
  });
});

// ==========================================
// 10. AIRTABLE STATUS & HEALTH CHECK
// ==========================================
app.get('/api/airtable/status', async (req, res) => {
  const AIRTABLE_PAT = process.env.AIRTABLE_PAT || process.env.AIRTABLE_API_KEY || '';
  const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID || 'applCjQYUgSTHSXcg';

  if (!AIRTABLE_PAT || !AIRTABLE_BASE_ID) {
    return res.json({
      configured: false,
      message: 'Airtable credentials pending. Provide AIRTABLE_PAT and AIRTABLE_BASE_ID to activate live sync.'
    });
  }

  try {
    const checkRes = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(process.env.AIRTABLE_LEADS_TABLE || 'Leads')}?maxRecords=1`, {
      headers: { 'Authorization': `Bearer ${AIRTABLE_PAT}` }
    });
    const data = await checkRes.json();
    if (!checkRes.ok) {
      return res.status(400).json({ configured: true, connected: false, error: data });
    }
    return res.json({ configured: true, connected: true, message: 'Airtable Base verified and connected successfully!' });
  } catch (err) {
    return res.status(500).json({ configured: true, connected: false, error: err.message });
  }
});


// Start Server (only when not in Vercel serverless function environment)
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`[Rebel Wing Council] Express Backend running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
  });
}

export default app;
