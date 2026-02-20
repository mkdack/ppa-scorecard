// netlify/functions/analyze.js - SHORTENED FOR SPEED
const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_VERSION = '2023-06-01';

const SYSTEM_PROMPT = `You are a VPPA/PPA term sheet analyzer. Your task is to extract key deal information and score contract terms.

CRITICAL: You MUST extract the exact company names and project name from the term sheet. 

To find party names, search for:
- BUYER: Look for "Buyer:", "Purchaser:", "Offtaker:", party definitions like "XYZ Corp. ("Buyer")", signature blocks, "entered into by and between", recitals section
- DEVELOPER/SELLER: Look for "Seller:", "Developer:", "Owner:", party definitions like "ABC Energy LLC ("Seller")", signature blocks
- PROJECT: Look for "Project:", "Facility:", "the Project", project title at top of document, "located in", facility description

These names are almost always present in the first 2 pages. DO NOT return empty strings if names are present. DO NOT guess or fabricate names.

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

    // Truncate if too long - prioritize first 10k chars (party names) + last 5k (signature blocks)
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

STEP 1 - Find party names (check the very beginning of the document, party definitions, and recitals):
- BUYER = the energy purchaser/offtaker company name
- DEVELOPER = the energy seller/developer company name  
- PROJECT = the solar/wind facility name

STEP 2 - Score all 31 terms.

STEP 3 - Return complete JSON. Party names must be the actual names, not empty strings.

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
    
    // Extract JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.log('NO JSON MATCH FOUND in:', content);
      throw new Error('No JSON found in response');
    }
    
    const analysis = JSON.parse(jsonMatch[0]);
    
    console.log('DEAL EXTRACTED:', JSON.stringify(analysis.deal, null, 2));

    // ── Regex fallback: if Claude returned empty strings, try to extract from text ──
    if (!analysis.deal) analysis.deal = {};

    if (!analysis.deal.buyer) {
      const buyerMatch = termSheet.match(
        /(?:buyer|purchaser|offtaker)[:\s"]+([A-Z][A-Za-z0-9\s,\.&'-]{2,60}?)(?:\s*[\("'"]|,|\n|LLC|Inc|Corp|Ltd|LP)/i
      );
      if (buyerMatch) analysis.deal.buyer = buyerMatch[1].trim();
    }

    if (!analysis.deal.developer) {
      const sellerMatch = termSheet.match(
        /(?:seller|developer|owner)[:\s"]+([A-Z][A-Za-z0-9\s,\.&'-]{2,60}?)(?:\s*[\("'"]|,|\n|LLC|Inc|Corp|Ltd|LP)/i
      );
      if (sellerMatch) analysis.deal.developer = sellerMatch[1].trim();
    }

    if (!analysis.deal.project) {
      const projectMatch = termSheet.match(
        /(?:project|facility)[:\s"]+([A-Z][A-Za-z0-9\s,\.&'-]{2,60}?)(?:\s*[\("'"]|,|\n|Solar|Wind|Project|Farm|Park)/i
      );
      if (projectMatch) analysis.deal.project = projectMatch[1].trim();
    }

    // Also try "between X and Y" pattern as last resort
    if (!analysis.deal.buyer || !analysis.deal.developer) {
      const betweenMatch = termSheet.match(
        /(?:by and between|between)\s+([A-Z][A-Za-z0-9\s,\.&'-]{2,60}?)\s+(?:\(["']?(?:buyer|purchaser|seller|developer)['"']?\)|and)\s+([A-Z][A-Za-z0-9\s,\.&'-]{2,60}?)(?:\s*\()/i
      );
      if (betweenMatch) {
        // We don't know which is buyer vs seller from this pattern alone, so only fill empty slots
        if (!analysis.deal.buyer && !analysis.deal.developer) {
          analysis.deal.buyer = betweenMatch[1].trim();
          analysis.deal.developer = betweenMatch[2].trim();
        }
      }
    }
    
    // Validate required fields
    if (!analysis.terms || typeof analysis.terms !== 'object') {
      throw new Error('Invalid terms structure');
    }
    
    analysis.unusualProvisions = analysis.unusualProvisions || [];
    analysis.missingProtections = analysis.missingProtections || [];
    
    // DEBUG: Include extraction result (remove once confirmed working)
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
