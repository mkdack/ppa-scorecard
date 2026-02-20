// netlify/functions/analyze.js
const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_VERSION = '2023-06-01';

const SYSTEM_PROMPT = `You are a VPPA/PPA term sheet analyzer. Extract deal information and score contract terms.

CRITICAL - EXTRACTING PARTY NAMES:
Term sheets often use a table format where the label and value are on separate lines, like:
  "Seller:"
  "Developer Earthly Pizza"
  
  "Buyer:"
  "Buyer ABaBa Corp"

The value line may start with the word "Buyer", "Seller", or "Developer" as a prefix — strip that prefix.
So "Developer Earthly Pizza" → developer = "Earthly Pizza"
And "Buyer ABaBa Corp" → buyer = "ABaBa Corp"

Also check the Confidentiality section — it often names both companies explicitly, e.g.:
"between Kinect Energy, Inc. (on behalf of Buyer) and National Grid Renewables Development, LLC (on behalf of Seller)"

For COD: look for "Target Commercial Operation Date", "TCOD", "Commercial Operation Date", "COD", "targeted COD". Extract the date value (e.g. "April 1, 2026" or "Q2 2026").

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

SCORING SCALE (0-100):
- 0-25: Buyer-favorable
- 26-50: Market standard
- 51-75: Seller-favorable
- 76-100: Critical/Red flag

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

    // Prioritize first 10k + last 5k to capture both party definitions and signature blocks
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

IMPORTANT EXTRACTION NOTES:
1. Party names may appear as table rows where the value line starts with "Buyer", "Seller", or "Developer" as a prefix — strip that prefix word to get the actual company name
2. Check the Confidentiality section for explicit company names with roles in parentheses
3. COD may be labeled "TCOD", "Target COD", or "Target Commercial Operation Date"
4. Return actual extracted values, never placeholder text

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

    // Extract JSON
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found in response');

    const analysis = JSON.parse(jsonMatch[0]);
    console.log('DEAL EXTRACTED:', JSON.stringify(analysis.deal, null, 2));

    if (!analysis.deal) analysis.deal = {};

    // ── Regex fallbacks for table-formatted term sheets ──

    // Buyer: look for "Buyer:\nBuyer CompanyName" or "Buyer: CompanyName"
    if (!analysis.deal.buyer) {
      // Table format: label on one line, value (possibly prefixed with "Buyer") on next
      let m = termSheet.match(/^Buyer:\s*\n\s*(?:Buyer\s+)?([A-Z][^\n]{2,60})/m);
      if (!m) m = termSheet.match(/^Buyer:\s+(?:Buyer\s+)?([A-Z][^\n]{2,60})/m);
      // Confidentiality section fallback: "Kinect Energy, Inc. (on behalf of Buyer)"
      if (!m) m = termSheet.match(/([A-Z][A-Za-z0-9\s,\.&'-]{2,60}?)\s*\(on behalf of Buyer\)/i);
      if (m) analysis.deal.buyer = m[1].trim();
    }

    // Seller/Developer: same table pattern
    if (!analysis.deal.developer) {
      let m = termSheet.match(/^Seller:\s*\n\s*(?:Developer\s+|Seller\s+)?([A-Z][^\n]{2,60})/m);
      if (!m) m = termSheet.match(/^Seller:\s+(?:Developer\s+|Seller\s+)?([A-Z][^\n]{2,60})/m);
      // Confidentiality section fallback: "National Grid Renewables Development, LLC (on behalf of Seller)"
      if (!m) m = termSheet.match(/([A-Z][A-Za-z0-9\s,\.&'-]{2,60}?)\s*\(on behalf of Seller\)/i);
      if (m) analysis.deal.developer = m[1].trim();
    }

    // Project name
    if (!analysis.deal.project) {
      let m = termSheet.match(/^Project:\s*\n\s*([A-Z][^\n]{2,80})/m);
      if (!m) m = termSheet.match(/^Project:\s+([A-Z][^\n]{2,80})/m);
      if (m) analysis.deal.project = m[1].trim();
    }

    // COD — handle TCOD, Target COD, Commercial Operation Date, etc.
    if (!analysis.deal.cod) {
      const codPatterns = [
        /Target(?:ed)?\s+Commercial\s+Operation\s+Date[^:]*:\s*([A-Za-z]+\s+\d{1,2},?\s*\d{4}|Q\d\s*\d{4}|\d{4})/i,
        /TCOD[^:]*:\s*([A-Za-z]+\s+\d{1,2},?\s*\d{4}|Q\d\s*\d{4}|\d{4})/i,
        /Commercial\s+Operation\s+Date[^:]*:\s*([A-Za-z]+\s+\d{1,2},?\s*\d{4}|Q\d\s*\d{4}|\d{4})/i,
        /\bCOD[^:]*:\s*([A-Za-z]+\s+\d{1,2},?\s*\d{4}|Q\d\s*\d{4}|\d{4})/i,
      ];
      for (const pat of codPatterns) {
        const m = termSheet.match(pat);
        if (m) { analysis.deal.cod = m[1].trim(); break; }
      }
    }

    if (!analysis.terms || typeof analysis.terms !== 'object') {
      throw new Error('Invalid terms structure');
    }

    analysis.unusualProvisions = analysis.unusualProvisions || [];
    analysis.missingProtections = analysis.missingProtections || [];

    // Debug info
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
