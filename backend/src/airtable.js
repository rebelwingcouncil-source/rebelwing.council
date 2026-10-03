// Rebel Wing Council - Airtable Integration Service
// Seamlessly syncs website consultation leads and ATS career applicants to Airtable

const AIRTABLE_PAT = process.env.AIRTABLE_PAT || process.env.AIRTABLE_API_KEY || '';
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID || 'applCjQYUgSTHSXcg';
const LEADS_TABLE = process.env.AIRTABLE_LEADS_TABLE || 'Leads';
const CAREERS_TABLE = process.env.AIRTABLE_CAREERS_TABLE || 'Applicants';

/**
 * Generic record creator for Airtable REST API v0
 */
async function createAirtableRecord(tableName, fields) {
  if (!AIRTABLE_PAT || !AIRTABLE_BASE_ID) {
    console.log(`[Airtable] Skipped sync to '${tableName}' - AIRTABLE_PAT or AIRTABLE_BASE_ID not configured.`);
    return { success: false, skipped: true, reason: 'Credentials not configured' };
  }

  const endpoint = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(tableName)}`;
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_PAT}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        records: [
          {
            fields: fields
          }
        ],
        typecast: true // Automatically create single-select options or format dates if needed
      })
    });

    const data = await response.json();
    if (!response.ok) {
      console.error(`[Airtable] Error creating record in '${tableName}':`, data);
      return { success: false, error: data };
    }

    console.log(`[Airtable] Successfully synced record to '${tableName}' (Record ID: ${data.records?.[0]?.id})`);
    return { success: true, record: data.records?.[0] };
  } catch (err) {
    console.error(`[Airtable] Network error syncing to '${tableName}':`, err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Sync consultation booking lead to Airtable
 */
export async function syncLeadToAirtable({ name, email, phone, practice_area, date, time_slot, mode, notes }) {
  const fields = {
    'Name': name || '',
    'Email': email || '',
    'Phone': phone || '',
    'Practice Area': practice_area || 'General Legal Advice',
    'Date': date || new Date().toISOString().split('T')[0],
    'Time Slot': time_slot || '11:00 AM - 12:00 PM',
    'Mode': mode || 'Online Video Call',
    'Notes': notes || '',
    'Status': 'New Lead',
    'Source': 'Website Consultation Booking'
  };

  return await createAirtableRecord(LEADS_TABLE, fields);
}

/**
 * Sync ATS career applicant to Airtable
 */
export async function syncApplicantToAirtable({ name, email, phone, role, experience, resume_notes }) {
  const fields = {
    'Candidate Name': name || '',
    'Email': email || '',
    'Phone': phone || '',
    'Applied Role': role || 'Legal Counsel',
    'Experience': experience || 'N/A',
    'Details / Notes': resume_notes || 'Submitted via website ATS portal',
    'Status': 'Screening / Review',
    'Source': 'Careers ATS'
  };

  return await createAirtableRecord(CAREERS_TABLE, fields);
}

export default {
  syncLeadToAirtable,
  syncApplicantToAirtable
};
