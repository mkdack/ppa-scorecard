# Anthropic Claude Setup Guide

## Overview
This PPA Scorecard uses **Claude Sonnet 4.6** via the Anthropic API to perform comprehensive commercial analysis of renewable energy term sheets.

## 1. Get Your API Key

1. Go to https://console.anthropic.com/
2. Sign up or log in
3. Go to "API Keys" in the left sidebar
4. Click "Create Key"
5. Copy the key (starts with `sk-ant-...`)

## 2. Add to Netlify

### Option A: Netlify Dashboard (Recommended)
1. Push your code to GitHub
2. Connect repo to Netlify
3. Go to **Site Settings** → **Environment Variables**
4. Add new variable:
   - Key: `ANTHROPIC_API_KEY`
   - Value: your API key
5. Redeploy the site

### Option B: Netlify CLI
```bash
# Install CLI if needed
npm install -g netlify-cli

# Login
netlify login

# Link to your site
netlify link

# Set environment variable
netlify env:set ANTHROPIC_API_KEY sk-ant-your-key-here

# Deploy
netlify deploy --prod
```

## 3. Test the API

Once deployed, test with curl:
```bash
curl -X POST https://your-site.netlify.app/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "termSheet": "ERCOT Solar PPA. 160 MWac capacity. Strike price $45/MWh. 15 year term. No executed interconnection agreement. 100% buyer-borne economic curtailment. No delay damages defined."
  }'
```

## 4. Pricing

Anthropic Claude Sonnet 4.6 pricing (as of 2025):
- **Input:** $3 per million tokens
- **Output:** $15 per million tokens

A typical PPA term sheet analysis (~3000-5000 tokens) costs approximately **$0.02-0.08** per analysis.

## 5. Local Development

```bash
# Set your API key locally
export ANTHROPIC_API_KEY=sk-ant-your-key-here

# Run Netlify dev server
netlify dev

# The function will be available at:
# http://localhost:8888/.netlify/functions/analyze
```

## 6. What Claude Analyzes

The comprehensive prompt includes analysis of:

### Deal Structure
- ISO/RTO, technology, capacity
- Buyer's share, contract term
- Strike price with levelized cost calculation
- COD timeline and development status

### 22 Scored Terms
1. **Pricing:** Strike price, floating price formula, calculation interval
2. **Risk Protection:** Negative price floor, basis risk
3. **Settlement:** Invoicing, payment terms
4. **Shape & Curtailment:** Economic curtailment allocation
5. **Development:** Interconnection status, conditions precedent
6. **Performance:** Delay damages, availability guarantee
7. **Credit:** Buyer and seller performance assurance
8. **Contract:** Assignment rights, force majeure
9. **Default:** Events of default, cure periods
10. **Termination:** Early termination rights
11. **RECs:** Delivery, certification, replacement
12. **Legal:** Governing law, confidentiality
13. **Accounting:** ASC 815/IFRS 9 treatment flags

### Market Benchmarks
- ERCOT Solar: $40-60/MWh
- SPP Solar: $55-75/MWh
- MISO Solar: $65-85/MWh
- PJM Solar: $85-110/MWh
- CAISO Solar: $70-90/MWh

### Output Format
Claude returns:
- Deal summary with extracted parameters
- Pricing assessment vs. market
- 22 term scores (0-100)
- Red flags with dollar exposure
- Negotiation opportunities
- Buyer-favorable provisions
- Overall rating and rationale
- Ready-to-send negotiation memo

## 7. Troubleshooting

| Issue | Solution |
|-------|----------|
| "ANTHROPIC_API_KEY not configured" | Check environment variable is set in Netlify dashboard |
| "401 Unauthorized" | API key may be invalid — generate new one |
| "Function timeout" | Term sheet too long — limit to ~20,000 characters |
| "Failed to parse AI response" | Claude may have returned non-JSON; retry or use shorter term sheet |
| "Rate limit exceeded" | Wait a moment and retry; upgrade Anthropic plan if persistent |

## 8. Model Options

Current setup uses: `claude-sonnet-4-6-20250501`

Other options (edit `netlify/functions/analyze.js`):
- `claude-opus-4-1-20250501` — Most capable, most expensive
- `claude-sonnet-4-6-20250501` — Good balance (default)
- `claude-haiku-3-5-20250701` — Fastest, cheapest, less nuanced

## Security Notes

✅ API key stored server-side only (Netlify Function)  
✅ Key never exposed to browser  
✅ HTTPS enforced on all requests  
✅ CORS configured for your domain only  

**Never commit your API key to git!**

## Fallback Behavior

If Claude API fails:
- Automatically falls back to rule-based parser
- No user interruption
- Analysis continues with simplified scoring

To disable AI entirely, set `USE_AI_ANALYSIS = false` in `js/analyzer.js`
