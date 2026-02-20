# Anthropic Claude Integration for PPA Scorecard

## Setup

1. Get your Anthropic API key from: https://console.anthropic.com/

2. Add to Netlify environment variables:
   - Go to Site Settings → Environment Variables
   - Add: `ANTHROPIC_API_KEY` = your_api_key_here

3. Deploy the functions:
   ```bash
   netlify deploy --prod
   ```

## API Usage

The function expects a POST request with:
```json
{
  "termSheet": "paste your term sheet text here..."
}
```

Returns:
```json
{
  "deal": {
    "iso": "ERCOT",
    "tech": "Solar", 
    "capacity": "160 MWac",
    "strikePrice": 45.00,
    "term": "15 years",
    "cod": "Apr 2026"
  },
  "terms": {
    "strike": 15,
    "curtailment": 90,
    "ia": 90,
    ...
  }
}
```

## Local Development

```bash
# Install Netlify CLI if needed
npm install -g netlify-cli

# Run locally with env vars
netlify env:set ANTHROPIC_API_KEY your_key_here
netlify dev
```
