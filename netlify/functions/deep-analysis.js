// netlify/functions/deep-analysis.js
// Second-pass deep analysis using Sonnet — called on demand after initial scoring
const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_VERSION = '2023-06-01';

const SYSTEM_PROMPT = `You are an expert VPPA/PPA contract attorney and energy procurement advisor.
You will receive a term sheet and a list of terms that scored as seller-favorable or red flags.
For each flagged term, provide a concise but substantive analysis.

Return ONLY valid JSON, no other text:
{
  "termAnalysis": {
    "TERM_ID": {
      "summary": "1-2 sentence plain English explanation of what the term sheet actually says",
      "risk": "Specific financial or legal risk to buyer, with numbers where possible",
      "recommendation": "Concrete negotiation action — what to push for"
    }
  },
  "unusualProvisions": [
    {
      "provision": "Clause name",
      "severity": "CRITICAL",
      "description": "What this clause does",
      "impact": "Buyer impact",
      "recommendation": "What to do"
    }
  ],
  "missingProtections": [
    {
      "protection": "Protection name",
      "standard": "Market standard",
      "risk": "Risk if absent"
    }
  ],
  "executiveSummary": "3-4 sentence overall deal assessment for a procurement manager"
}

Keep each field under 50 words. severity must be CRITICAL, ATTENTION, or INFO.
Only flag genuinely unusual provisions — not standard VPPA terms.`;

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return { statusCode: 500, headers, body: JSON.stringify({ error: 'ANTHROPIC_API_KEY not configured' }) };

  try {
    const { termSheet, scores } = JSON.parse(event.body);

    if (!termSheet || termSheet.trim().length < 50) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Term sheet too short' }) };
    }

    // Only analyze terms that scored above 40 (seller-favorable or worse)
    const flaggedTerms = Object.entries(scores || {})
      .filter(([, score]) => score > 40)
      .map(([term]) => term);

    // Truncate term sheet for context
    const truncated = termSheet.length > 10000
      ? termSheet.substring(0, 8000) + '\n...[truncated]...\n' + termSheet.substring(termSheet.length - 2000)
      : termSheet;

    const userPrompt = `Analyze this VPPA/PPA term sheet. Focus your termAnalysis ONLY on these flagged terms: ${flaggedTerms.join(', ')}.

Term sheet:
${truncated}

For the termAnalysis object, use exactly these term IDs as keys: ${flaggedTerms.join(', ')}
Provide analysis for each flagged term based on what the term sheet actually says (or omits) about that topic.`;

    const response = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': ANTHROPIC_VERSION
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 4000,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userPrompt }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error ${response.status}: ${errorText.substring(0, 200)}`);
    }

    const data = await response.json();
    const content = data.content?.[0]?.text || '';
    console.log('DEEP ANALYSIS RESPONSE:', content.substring(0, 500));

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found in response');

    const result = JSON.parse(jsonMatch[0]);
    result.termAnalysis = result.termAnalysis || {};
    result.unusualProvisions = result.unusualProvisions || [];
    result.missingProtections = result.missingProtections || [];
    result.executiveSummary = result.executiveSummary || '';

    console.log('DEEP ANALYSIS Duration:', Date.now(), 'flagged terms:', flaggedTerms.length);
    return { statusCode: 200, headers, body: JSON.stringify(result) };

  } catch (error) {
    console.error('Deep analysis error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Deep analysis failed', message: error.message })
    };
  }
};
