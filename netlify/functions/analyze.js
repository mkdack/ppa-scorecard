// netlify/functions/analyze.js
const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_VERSION = '2023-06-01';

const SYSTEM_PROMPT = `You are a VPPA/PPA term sheet analyzer. Extract deal information and score contract terms.

The term sheet text uses a two-column table format where labels and values are separated by blank lines:
  "Seller:\n\nDeveloper Earthly Pizza\n\n"
  "Buyer:\n\nBuyer ABaBa\n\n"
  "Project:\n\nSolar Project Abakawaka...\n\n"

Strip any leading "Developer ", "Seller ", or "Buyer " prefix from the value to get the actual company name.
So "Developer Earthly Pizza" → developer = "Earthly Pizza"
And "Buyer ABaBa" → buyer = "ABaBa"

For COD: look for "Target Commercial Operation Date", "TCOD", "COD". Extract just the date (e.g. "April 1, 2026").

Also check the Confidentiality section for patterns like:
"Kinect Energy, Inc. (on behalf of Buyer) and National Grid Renewables (on behalf of Seller)"

REQUIRED OUTPUT FORMAT - Return valid JSON only:
{
  "deal": {
    "buyer": "EXACT BUYER COMPANY NAME",
    "developer": "EXACT SELLER/DEVELOPER COMPANY NAME",
    "project": "EXACT PROJECT NAME",
    "iso": "ERCOT",
    "tech": "Solar",
    "capacity": "100 MWac",
    "buyerShare": "50%",
    "strikePrice": 45,
    "escalator": 0,
    "term": "15 years",
    "cod": "Apr 2026"
  },
  "terms": {
    "strike": 35, "floating": 35, "interval": 35, "negprice": 35, "invoice": 35,
    "basis": 35, "curtailment": 35, "ia": 35, "cp": 35, "delay": 35,
    "avail": 35, "permit": 35, "buyerpa": 35, "sellerpa": 35, "assign": 35,
    "fm": 35, "eod": 35, "eterm": 35, "product": 35, "recs": 35,
    "govlaw": 35, "conf": 35, "excl": 35, "expenses": 35, "acct": 35,
    "marketdisrupt": 35, "cod": 35, "changeinlaw": 35, "reputation": 35,
    "incentives": 35, "publicity": 35
  },
  "unusualProvisions": [],
  "missingProtections": []
}

SCORING SCALE (0-100): 0-25 Buyer-favorable, 26-50 Market standard, 51-75 Seller-favorable, 76-100 Critical/Red flag
DETECT unusual provisions like: project replacement, MAC clauses, most favored customer, regulatory out.`;

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
    const { termSheet } = JSON.parse(event.body);
    if (!termSheet || termSheet.trim().length < 50) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Term sheet too short' }) };
    }

    // Prioritize first 10k + last 5k to capture party definitions and signature blocks
    let truncatedText;
    if (termSheet.length > 15000) {
      truncatedText = termSheet.substring(0, 10000) + '\n...[middle truncated]...\n' + termSheet.substring(termSheet.length - 5000);
    } else {
      truncatedText = termSheet;
    }

    const response = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': ANTHROPIC_VERSION
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5-20251001',
        max_tokens: 4000,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: `Analyze this VPPA/PPA term sheet.

The format uses labels followed by blank lines then values, e.g.:
  Seller:\n\nDeveloper Earthly Pizza  →  developer = "Earthly Pizza"
  Buyer:\n\nBuyer ABaBa Corp  →  buyer = "ABaBa Corp"
  
Strip "Developer ", "Seller ", "Buyer " prefixes from values.
Extract actual company names — never return empty strings if names exist in the text.

Term sheet:
${truncatedText}` }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error ${response.status}: ${errorText.substring(0, 200)}`);
    }

    const data = await response.json();
    const content = data.content?.[0]?.text || '';
    console.log('CLAUDE RAW RESPONSE:', content.substring(0, 2000));

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found in response');

    const analysis = JSON.parse(jsonMatch[0]);
    console.log('DEAL EXTRACTED:', JSON.stringify(analysis.deal, null, 2));

    if (!analysis.deal) analysis.deal = {};

    // ── Regex fallbacks — match double-newline table format from mammoth ──
    // Pattern: "Label:\n\nOptionalPrefix ActualName\n"

    if (!analysis.deal.buyer) {
      // "Buyer:\n\nBuyer ABaBa" or "Buyer:\n\nABaBa"
      const m = termSheet.match(/^Buyer:\s*\n\n\s*(?:Buyer\s+)?([A-Z][^\n]+)/m);
      if (m) analysis.deal.buyer = m[1].trim();
    }

    if (!analysis.deal.buyer) {
      // Confidentiality fallback: "CompanyName (on behalf of Buyer)"
      const m = termSheet.match(/([A-Z][A-Za-z0-9\s,\.&'-]{2,60}?)\s*\(on behalf of (?:Buyer|Purchaser)\)/i);
      if (m) analysis.deal.buyer = m[1].trim();
    }

    if (!analysis.deal.developer) {
      // "Seller:\n\nDeveloper Earthly Pizza" or "Seller:\n\nEarthly Pizza"
      const m = termSheet.match(/^Seller:\s*\n\n\s*(?:Developer\s+|Seller\s+)?([A-Z][^\n]+)/m);
      if (m) analysis.deal.developer = m[1].trim();
    }

    if (!analysis.deal.developer) {
      // Confidentiality fallback: "CompanyName (on behalf of Seller)"
      const m = termSheet.match(/([A-Z][A-Za-z0-9\s,\.&'-]{2,60}?)\s*\(on behalf of (?:Seller|Developer)\)/i);
      if (m) analysis.deal.developer = m[1].trim();
    }

    if (!analysis.deal.project) {
      const m = termSheet.match(/^Project:\s*\n\n\s*([A-Z][^\n]+)/m);
      if (m) analysis.deal.project = m[1].trim();
    }

    // COD — handle TCOD, Target COD, double-newline format
    if (!analysis.deal.cod) {
      const codPatterns = [
        /Target(?:ed)?\s+Commercial\s+Operation\s+Date[^:]*:\s*\n\n\s*([^\n]+)/im,
        /\bTCOD[^:]*:\s*\n\n\s*([^\n]+)/im,
        /Target(?:ed)?\s+Commercial\s+Operation\s+Date[^:]*:\s*([A-Za-z]+\s+\d{1,2},?\s*\d{4}|Q\d\s*\d{4})/i,
        /\bTCOD[^:]*:\s*([A-Za-z]+\s+\d{1,2},?\s*\d{4}|Q\d\s*\d{4})/i,
        /Commercial\s+Operation\s+Date[^:]*:\s*([A-Za-z]+\s+\d{1,2},?\s*\d{4}|Q\d\s*\d{4})/i,
      ];
      for (const pat of codPatterns) {
        const m = termSheet.match(pat);
        if (m) {
          // Clean up — take just the date part (first line, strip trailing junk)
          const raw = m[1].trim();
          const dateOnly = raw.match(/([A-Za-z]+\s+\d{1,2},?\s*\d{4}|Q\d[\s/]*\d{4}|\d{4})/);
          analysis.deal.cod = dateOnly ? dateOnly[1] : raw.substring(0, 30);
          break;
        }
      }
    }

    if (!analysis.terms || typeof analysis.terms !== 'object') {
      throw new Error('Invalid terms structure');
    }

    analysis.unusualProvisions = analysis.unusualProvisions || [];
    analysis.missingProtections = analysis.missingProtections || [];

    analysis._debug = {
      rawClaudeResponse: content.substring(0, 3000),
      dealExtracted: analysis.deal
    };

    return { statusCode: 200, headers, body: JSON.stringify(analysis) };

  } catch (error) {
    console.error('Analysis error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Analysis failed', message: error.message })
    };
  }
};
