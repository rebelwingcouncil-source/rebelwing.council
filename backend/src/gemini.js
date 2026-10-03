// Rebel Wing Council - Google Gemini AI Legal Assistant Service
// Powered by Google Gemini 1.5/2.5 Flash for Indian Legal Triage & Advisory

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

/**
 * Generate intelligent legal triage and statutory guidance via Google Gemini
 */
export async function getGeminiLegalTriage(userQuery) {
  const apiKey = process.env.GEMINI_API_KEY || GEMINI_API_KEY;

  if (!apiKey) {
    return null; // Signals caller to use curated firm fallback
  }

  const prompt = `You are the Senior Legal AI Assistant for 'Rebel Wing Council, Advocates & Legal Consultants' (a premier Indian law firm).
Analyze the following client legal query and produce a structured legal assessment under Indian Law (e.g., Companies Act 2013, Trade Marks Act 1999, Arbitration & Conciliation Act 1996, Bharatiya Nyaya Sanhita, MOEFCC EPR Guidelines, etc.).

Client Inquiry: "${userQuery}"

You must respond ONLY with a valid JSON object strictly matching this schema, with no markdown code blocks or additional text:
{
  "category": "Domain of law (e.g. Intellectual Property Rights, Corporate Restructuring, Commercial Litigation, Environmental & EPR Compliance, Employment & Labour)",
  "suggested_advocate": "Name and title of the appropriate senior counsel: select from 'Adv. Rajeshwar Sharma (Managing Partner)', 'Adv. Priya Deshmukh (Partner - Corporate)', 'Adv. Vikramaditya Rathore (Head of Litigation)', or 'Neha Verma (Senior Legal Executive)'",
  "estimated_timeline": "Realistic timeline under Indian statutory procedural timelines",
  "key_requirements": ["3 to 4 specific documents or legal proofs required from the client"],
  "ai_guidance": "2 to 3 sentences of sharp statutory analysis and next steps recommended by Rebel Wing Council"
}`;

  const models = ['gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-1.5-pro'];

  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.2,
            responseMimeType: 'application/json'
          }
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        console.warn(`[Gemini API] Model ${model} returned HTTP ${response.status}:`, errText);
        continue; // Try next model fallback
      }

      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) continue;

      // Parse JSON from response
      const cleanJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      return parsed;
    } catch (err) {
      console.warn(`[Gemini API] Error calling model ${model}:`, err.message);
    }
  }

  return null;
}

export default {
  getGeminiLegalTriage
};
