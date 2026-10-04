import pg from 'pg';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from backend directory or parent
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const { Pool } = pg;

// Supabase Direct PostgreSQL Pool
export const pool = new Pool({
  host: process.env.DB_HOST || 'aws-0-ap-northeast-1.pooler.supabase.com',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'postgres',
  user: process.env.DB_USER || 'postgres.tauzepmapcywrzoqgeyp',
  password: process.env.DB_PASSWORD,
  ssl: { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000,
});

// Handle idle connection errors gracefully so the process does not terminate
pool.on('error', (err) => {
  console.error('[PostgreSQL Pool Warning]: Idle client connection error:', err?.message || err);
});

// Supabase Client with Service/Secret Key for privileged backend tasks
const supabaseUrl = process.env.SUPABASE_URL || 'https://tauzepmapcywrzoqgeyp.supabase.co';
const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_ANON_KEY || 'placeholder_secret';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  }
});

// Helper for query execution
export const query = async (text, params) => {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  // console.log('executed query', { text, duration, rows: res.rowCount });
  return res;
};
