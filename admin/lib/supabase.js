import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tauzepmapcywrzoqgeyp.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_-XSOmKNGTjJwQj06-Ag0Kg_jUIUomc7';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
