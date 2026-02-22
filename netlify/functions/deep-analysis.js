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
    const { termSheet, scores, facts } = JSON.parse(event.body);

    // Only analyze genuinely flagged terms (seller-favorable or worse), cap at 8
    const flaggedTerms = Object.entries(scores || {})
      .filter(([, score]) => score > 55)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8)
      .map(([term]) => term);

    // If nothing flagged, analyze top 5 by score
    if (flaggedTerms.length === 0) {
      const top5 = Object.entries(scores || {})
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([term]) => term);
      flaggedTerms.push(...top5);
    }

    console.log('Deep analysis — flagged terms to analyze:', flaggedTerms);

    // Prefer pre-extracted facts over raw term sheet (faster, avoids re-reading)
    let context;
    if (facts && typeof facts === 'object') {
      // Build a compact facts summary for flagged terms only
      const relevantFacts = {};
      for (const term of flaggedTerms) {
        if (facts[term]) relevantFacts[term] = facts[term];
      }
      relevantFacts.deal = facts.deal || {};
      context = `Pre-extracted facts (structured):\n${JSON.stringify(relevantFacts, null, 2)}`;
    } else if (termSheet && termSheet.trim().length >= 50) {
      const truncated = termSheet.length > 8000
        ? termSheet.substring(0, 6000) + '\n...[truncated]...\n' + termSheet.substring(termSheet.length - 2000)
        : termSheet;
      context = `Raw term sheet:\n${truncated}`;
    } else {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'No term sheet or facts provided' }) };
    }

    const userPrompt = `You are analyzing a VPPA/PPA. Focus termAnalysis ONLY on these flagged terms: ${flaggedTerms.join(', ')}.

${context}

For the termAnalysis object, use exactly these term IDs as keys: ${flaggedTerms.join(', ')}
Analyze each term based on what the facts say (or omit).`;

    const response = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': ANTHROPIC_VERSION
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 3000,
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

    console.log('DEEP ANALYSIS OK — flagged terms:', flaggedTerms.length, 'response chars:', content.length);
    return { statusCode: 200, headers, body: JSON.stringify(result) };

  } catch (error) {
    console.error('Deep analysis error:', error.message, error.stack?.substring(0, 300));
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Deep analysis failed', message: error.message })
    };
  }
};
