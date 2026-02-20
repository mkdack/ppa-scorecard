// netlify/functions/analyze.js - SHORTENED FOR SPEED
const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_VERSION = '2023-06-01';

const SYSTEM_PROMPT = `You are a VPPA/PPA term sheet analyzer. Your task is to extract key deal information and score contract terms.

IMPORTANT: Extract the exact company names and project name from the term sheet. Look at the signature blocks, party definitions, and project title.

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

DETECT unusual provisions like: project replacement, MAC clauses, most favored customer, regulatory out.

DO NOT use placeholder values like "-" or "_" for buyer, developer, or project. Either extract the actual name from the text or return an empty string "".`;

const RESPONSE_FORMAT = {
  deal: { buyer: '', developer: '', project: '', iso: 'ERCOT', tech: 'Solar', capacity: '100 MWac', buyerShare: '50%', strikePrice: 45, escalator: 0, term: '15 years', cod: 'Apr 2026' },
  terms: { strike: 35, floating: 35, interval: 35, negprice: 35, invoice: 35, basis: 35, curtailment: 35, ia: 35, cp: 35, delay: 35, avail: 35, permit: 35, buyerpa: 35, sellerpa: 35, assign: 35, fm: 35, eod: 35, eterm: 35, product: 35, recs: 35, govlaw: 35, conf: 35, excl: 35, expenses: 35, acct: 35, marketdisrupt: 35, cod: 35, changeinlaw: 35, reputation: 35, incentives: 35, publicity: 35 },
  unusualProvisions: [],
  missingProtections: []
};

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

    // Truncate if too long
    const truncatedText = termSheet.length > 15000 ? termSheet.substring(0, 15000) + '\n...[truncated]' : termSheet;

    const response = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': ANTHROPIC_VERSION
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4000,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: `Analyze this VPPA/PPA term sheet.

FIRST - Extract these entity names by looking at party definitions and signature blocks:
- BUYER: The company buying the energy (purchaser, offtaker)
- DEVELOPER: The company selling the energy (seller, owner)
- PROJECT: The project facility name

THEN - Score all 31 terms and return the complete JSON.

Term sheet content:
${truncatedText}` }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error ${response.status}: ${errorText.substring(0, 200)}`);
    }

    const data = await response.json();
    const content = data.content?.[0]?.text || '';
    
    // Log raw response for debugging
    console.log('CLAUDE RAW RESPONSE:', content.substring(0, 2000));
    
    // Extract JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.log('NO JSON MATCH FOUND in:', content);
      throw new Error('No JSON found in response');
    }
    
    console.log('EXTRACTED JSON:', jsonMatch[0].substring(0, 1000));
    
    const analysis = JSON.parse(jsonMatch[0]);
    
    // Log deal extraction
    console.log('DEAL EXTRACTED:', JSON.stringify(analysis.deal, null, 2));
    
    // Validate required fields
    if (!analysis.terms || typeof analysis.terms !== 'object') {
      throw new Error('Invalid terms structure');
    }
    
    // Ensure all arrays exist
    analysis.unusualProvisions = analysis.unusualProvisions || [];
    analysis.missingProtections = analysis.missingProtections || [];
    
    // DEBUG: Include raw response in output for troubleshooting
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
