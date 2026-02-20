// netlify/functions/analyze.js
const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_VERSION = '2023-06-01';

const SYSTEM_PROMPT = `You are a VPPA term sheet analyzer. Return ONLY valid JSON, no other text.

Extract party names using these exact patterns:
- "Seller:\n\nDeveloper X" or "Seller:\n\nX" → developer = "X" (strip "Developer " prefix)
- "Buyer:\n\nBuyer X" or "Buyer:\n\nX" → buyer = "X" (strip "Buyer " prefix)
- "Project:\n\nX" → project = "X"
- "Target Commercial Operation Date...:\n\nAPRIL 1, 2026..." → cod = "April 1, 2026" (date only)
- Confidentiality: "X (on behalf of Buyer)" → buyer = "X"

Score each term 0-100: 0-25=buyer-favorable, 26-50=market standard, 51-75=seller-favorable, 76-100=red flag.

Return this exact JSON structure:
{
  "deal": {"buyer":"","developer":"","project":"","iso":"ERCOT","tech":"Solar","capacity":"100 MWac","buyerShare":"50%","strikePrice":45,"escalator":0,"term":"15 years","cod":""},
  "terms": {"strike":35,"floating":35,"interval":35,"negprice":35,"invoice":35,"basis":35,"marketdisrupt":35,"scheduling":35,"curtailment":35,"nonecocurtail":35,"basiscurtail":35,"ia":35,"cp":35,"delay":35,"availmech":35,"availguaranteed":35,"permit":35,"cod":35,"buyerpa":35,"sellerpa":35,"assign":35,"fm":35,"eod":35,"eterm":35,"changeinlaw":35,"reputation":35,"product":35,"recs":35,"incentives":35,"govlaw":35,"conf":35,"excl":35,"expenses":35,"acct":35,"publicity":35},
  "unusualProvisions": [{"provision":"name","severity":"CRITICAL","description":"what it does","impact":"buyer impact","recommendation":"action"}],
  "missingProtections": [{"protection":"name","standard":"market standard","risk":"buyer risk"}]
}

Only include items in unusualProvisions/missingProtections if genuinely found. Return [] if none.
Be concise: keep all string values under 25 words. Max 3 items per array.`

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
    if (termSheet.length > 8000) {
      truncatedText = termSheet.substring(0, 6000) + '\n...[middle truncated]...\n' + termSheet.substring(termSheet.length - 2000);
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
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 2500,
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

    // ── Regex extraction — always runs as primary source for structured fields ──
    // Claude often returns placeholder text; regex on the raw term sheet is more reliable.

    // BUYER
    const buyerMatch =
      termSheet.match(/^Buyer:\s*\n\n\s*(?:Buyer\s+)?([A-Z][^\n]+)/m) ||
      termSheet.match(/([A-Z][A-Za-z0-9\s,\.&'-]{2,60}?)\s*\(on behalf of (?:Buyer|Purchaser)\)/i);
    if (buyerMatch) analysis.deal.buyer = buyerMatch[1].trim();

    // SELLER / DEVELOPER
    const sellerMatch =
      termSheet.match(/^Seller:\s*\n\n\s*(?:Developer\s+|Seller\s+)?([A-Z][^\n]+)/m) ||
      termSheet.match(/([A-Z][A-Za-z0-9\s,\.&'-]{2,60}?)\s*\(on behalf of (?:Seller|Developer)\)/i);
    if (sellerMatch) analysis.deal.developer = sellerMatch[1].trim();

    // PROJECT
    const projectMatch = termSheet.match(/^Project:\s*\n\n\s*([A-Z][^\n]+)/m);
    if (projectMatch) analysis.deal.project = projectMatch[1].trim();

    // COD — extract date only, strip trailing sentence text
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
        const raw = m[1].trim();
        const dateOnly = raw.match(/([A-Za-z]+\s+\d{1,2},?\s*\d{4}|Q\d[\s/]*\d{4}|\d{4})/);
        analysis.deal.cod = dateOnly ? dateOnly[1] : raw.substring(0, 30);
        break;
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
