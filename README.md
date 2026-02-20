# PPA Deal Scorecard

An interactive web tool for analyzing renewable energy Power Purchase Agreement (PPA) term sheets.

## Features

- **22-term PPA analysis** across 7 categories
- **Interactive sliders** to simulate negotiation positions
- **Risk scoring** with financial impact calculations
- **AI term sheet analysis** (client-side or Netlify Functions)
- **Dark/light mode** toggle
- **Responsive design**

## Deployment

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/yourusername/ppa-scorecard)

## Local Development

```bash
# Clone the repository
git clone <repo-url>
cd ppa-scorecard

# Serve locally (any static server)
npx serve .
# or
python -m http.server 8000
```

## Project Structure

```
├── index.html          # Main entry point
├── css/
│   └── styles.css      # All styling
├── js/
│   ├── app.js          # Main application logic
│   ├── content.js      # Term content definitions
│   └── analyzer.js     # AI term sheet analysis
├── netlify.toml        # Netlify configuration
└── README.md
```

## Environment Variables

For AI analysis features (optional), set in Netlify:

- `OPENAI_API_KEY` - For GPT-4 term sheet analysis

## License

MIT
