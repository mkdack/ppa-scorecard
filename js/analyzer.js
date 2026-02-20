// ═══════════════════════════════════════════════════════════════
// PPA DEAL SCORECARD - ANTHROPIC CLAUDE ANALYZER
// ═══════════════════════════════════════════════════════════════

// Configuration
const USE_AI_ANALYSIS = true;  // Set to false to use rule-based fallback
const API_ENDPOINT = '/api/analyze';  // Netlify Function endpoint

// Modal functions
function openIntake() {
  document.getElementById('intakeOverlay').classList.add('open');
  document.getElementById('termsheetText').focus();
}

function closeIntake() {
  document.getElementById('intakeOverlay').classList.remove('open');
  document.getElementById('intakeError').style.display = 'none';
  document.getElementById('termsheetText').value = '';
  document.getElementById('uploadFilename').textContent = '';
}

function switchTab(tab) {
  document.querySelectorAll('.itab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.ipanel').forEach(p => p.classList.remove('active'));
  
  document.getElementById(`itab-${tab}`).classList.add('active');
  document.getElementById(`ipanel-${tab}`).classList.add('active');
}

// Drag and drop handlers
function handleDragOver(e) {
  e.preventDefault();
  e.currentTarget.classList.add('dragover');
}

function handleDrop(e) {
  e.preventDefault();
  e.currentTarget.classList.remove('dragover');
  
  const files = e.dataTransfer.files;
  if (files.length > 0) {
    handleFile(files[0]);
  }
}

function handleFileSelect(e) {
  const file = e.target.files[0];
  if (file) {
    handleFile(file);
  }
}

async function handleFile(file) {
  document.getElementById('uploadFilename').textContent = file.name;
  document.getElementById('intakeError').style.display = 'none';
  
  const fileName = file.name.toLowerCase();
  const isPDF = fileName.endsWith('.pdf');
  const isWord = fileName.endsWith('.doc') || fileName.endsWith('.docx');
  const isText = fileName.endsWith('.txt');
  
  if (!isPDF && !isWord && !isText) {
    showError('Unsupported file type. Please upload .txt, .pdf, .doc, or .docx files.');
    document.getElementById('uploadFilename').textContent = '';
    return;
  }
  
  // For text files, read directly
  if (isText) {
    const reader = new FileReader();
    reader.onload = (e) => {
      document.getElementById('termsheetText').value = e.target.result;
    };
    reader.readAsText(file);
    return;
  }
  
  // For PDF and Word, extract via server
  document.getElementById('uploadFilename').textContent = `${file.name} (extracting...)`;
  
  try {
    // Read file as base64
    const base64Data = await readFileAsBase64(file);
    
    // Send to extraction function
    const response = await fetch('/api/extract-text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fileData: base64Data,
        fileType: file.type,
        fileName: file.name
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Extraction failed');
    }
    
    const result = await response.json();
    document.getElementById('termsheetText').value = result.text;
    document.getElementById('uploadFilename').textContent = `${file.name} (${result.length} chars)`;
    
  } catch (err) {
    console.error('File upload error:', err);
    showError(`Could not extract text: ${err.message}. Try copying and pasting the text directly.`);
    document.getElementById('uploadFilename').textContent = '';
  }
}

function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result.split(',')[1]; // Remove data:... prefix
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ═══════════════════════════════════════════════════════════════
// MAIN ANALYSIS FUNCTION
// ═══════════════════════════════════════════════════════════════

async function analyzeTermSheet() {
  const text = document.getElementById('termsheetText').value.trim();
  
  if (!text) {
    showError('Please paste term sheet text or upload a file');
    return;
  }
  
  if (text.length < 100) {
    showError('Text too short. Please provide a complete term sheet (at least 100 characters).');
    return;
  }
  
  // Show analyzing overlay
  document.getElementById('analyzingOverlay').style.display = 'flex';
  updateProgress(10, 'Initializing analysis...', 'Preparing document');
  
  try {
    let analysis;
    
    if (USE_AI_ANALYSIS) {
      // Try AI analysis first
      try {
        analysis = await analyzeWithClaude(text);
      } catch (aiError) {
        console.warn('AI analysis failed, falling back to rules:', aiError);
        updateProgress(50, 'AI unavailable, using rule-based analysis...', 'Fallback mode');
        analysis = parseTermSheetRules(text);
      }
    } else {
      // Use rule-based only
      analysis = parseTermSheetRules(text);
    }
    
    updateProgress(90, 'Applying analysis...', 'Updating scorecard');
    
    // Apply the analysis
    applyAnalysis(analysis);
    
    // Hide overlay and modal
    updateProgress(100, 'Complete!', 'Scorecard updated');
    await sleep(300);
    document.getElementById('analyzingOverlay').style.display = 'none';
    closeIntake();
    
    // Store original analyzed values for reset functionality
    if (typeof storeOriginalAnalyzedValues === 'function') {
      storeOriginalAnalyzedValues(analysis);
    }
    
    // Refresh the scorecard with force flag
    console.log('Refreshing scorecard with updated values...');
    renderScorecard(true);
    updateSummary();
    
    // If Claude provided specific term details, update those too
    if (window.analysisData?.redFlags) {
      updateTermExposures(window.analysisData.redFlags);
    }
    
    // Display unusual provisions if any
    console.log('Checking for unusual provisions:', window.analysisData?.unusualProvisions);
    if (window.analysisData?.unusualProvisions && window.analysisData.unusualProvisions.length > 0) {
      console.log('Displaying unusual provisions:', window.analysisData.unusualProvisions.length);
      displayUnusualProvisions(window.analysisData.unusualProvisions);
    } else {
      console.log('No unusual provisions found');
      document.getElementById('unusualProvisionsSection').style.display = 'none';
    }
    
    // Display missing protections if any
    console.log('Checking for missing protections:', window.analysisData?.missingProtections);
    if (window.analysisData?.missingProtections && window.analysisData.missingProtections.length > 0) {
      console.log('Displaying missing protections:', window.analysisData.missingProtections.length);
      displayMissingProtections(window.analysisData.missingProtections);
    } else {
      console.log('No missing protections found');
      document.getElementById('missingProtectionsSection').style.display = 'none';
    }
    
  } catch (err) {
    document.getElementById('analyzingOverlay').style.display = 'none';
    showError('Analysis failed: ' + err.message);
    console.error('Analysis error:', err);
  }
}

// ═══════════════════════════════════════════════════════════════
// ANTHROPIC CLAUDE API CALL
// ═══════════════════════════════════════════════════════════════

async function analyzeWithClaude(termSheet) {
  updateProgress(20, 'Sending to Claude...', 'AI analysis in progress');

  // Animate progress bar so it doesn't look frozen during API wait
  const messages = [
    [25, 'Reading term structure...'],
    [32, 'Scanning pricing terms...'],
    [40, 'Analyzing curtailment provisions...'],
    [47, 'Reviewing credit & collateral...'],
    [54, 'Checking project development terms...'],
    [61, 'Evaluating contract terms...'],
    [67, 'Scoring legal provisions...'],
  ];
  let msgIdx = 0;
  const progressTimer = setInterval(() => {
    if (msgIdx < messages.length) {
      const [pct, label] = messages[msgIdx++];
      updateProgress(pct, label, 'AI analysis in progress');
    }
  }, 2000);

  let response;
  const controller = new AbortController();
  const fetchTimeout = setTimeout(() => controller.abort(), 24000);
  try {
    response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ termSheet }),
      signal: controller.signal
    });
  } finally {
    clearTimeout(fetchTimeout);
    clearInterval(progressTimer);
  }

  updateProgress(75, 'Processing AI response...', 'Extracting scores');
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || `HTTP ${response.status}`);
  }
  
  const data = await response.json();
  
  // Validate the response structure
  if (!data.terms || typeof data.terms !== 'object') {
    throw new Error('Invalid response format from AI');
  }
  
  return data;
}

// ═══════════════════════════════════════════════════════════════
// RULE-BASED FALLBACK
// ═══════════════════════════════════════════════════════════════

function parseTermSheetRules(text) {
  const analysis = {
    deal: {},
    terms: {},
    analysis: {
      criticalIssues: [],
      keyInsights: 'Rule-based analysis (AI unavailable)'
    },
    unusualProvisions: [],
    missingProtections: []
  };
  
  const lower = text.toLowerCase();
  
  // Extract deal basics
  analysis.deal.iso = extractISO(text) || 'ERCOT';
  analysis.deal.tech = extractTechnology(text) || 'Solar';
  analysis.deal.capacity = extractCapacity(text) || '100 MWac';
  analysis.deal.strikePrice = extractStrikePrice(text) || 45.00;
  analysis.deal.term = extractTerm(text) || '15 years';
  analysis.deal.cod = extractCOD(text) || 'TBD';

  // Extract party names via regex (same logic as server-side)
  const buyerMatch =
    text.match(/^Buyer:\s*\n\n\s*(?:Buyer\s+)?([A-Z][^\n]+)/m) ||
    text.match(/([A-Z][A-Za-z0-9\s,\.&'-]{2,60}?)\s*\(on behalf of (?:Buyer|Purchaser)\)/i);
  if (buyerMatch) analysis.deal.buyer = buyerMatch[1].trim();

  const sellerMatch =
    text.match(/^Seller:\s*\n\n\s*(?:Developer\s+|Seller\s+)?([A-Z][^\n]+)/m) ||
    text.match(/([A-Z][A-Za-z0-9\s,\.&'-]{2,60}?)\s*\(on behalf of (?:Seller|Developer)\)/i);
  if (sellerMatch) analysis.deal.developer = sellerMatch[1].trim();

  const projectMatch = text.match(/^Project:\s*\n\n\s*([A-Z][^\n]+)/m);
  if (projectMatch) analysis.deal.project = projectMatch[1].trim();
  
  // Score each term
  analysis.terms.strike = scoreStrikePrice(text, analysis.deal.strikePrice);
  analysis.terms.curtailment = scoreCurtailment(text);
  analysis.terms.ia = scoreInterconnection(text);
  analysis.terms.delay = scoreDelayDamages(text);
  analysis.terms.fm = scoreForceMajeure(text);
  analysis.terms.floating = scoreFloatingPrice(text);
  analysis.terms.assign = scoreAssignment(text);
  analysis.terms.sellerpa = scoreSellerPA(text);
  analysis.terms.cp = scoreConditionsPrecedent(text);
  analysis.terms.interval = scoreInterval(text);
  analysis.terms.negprice = scoreNegPrice(text);
  analysis.terms.invoice = scoreInvoice(text);
  analysis.terms.basis = scoreBasis(text);
  analysis.terms.availmech = scoreAvailability(text);
  analysis.terms.availguaranteed = scoreGuaranteedAvailability(text);
  analysis.terms.permit = scorePermit(text);
  analysis.terms.cod = scoreCOD(text);
  analysis.terms.marketdisrupt = scoreMarketDisrupt(text);
  analysis.terms.scheduling = scoreScheduling(text);
  analysis.terms.nonecocurtail = scoreNonEcoCurtailment(text);
  analysis.terms.basiscurtail = scoreBasisCurtailment(text);
  analysis.terms.changeinlaw = scoreChangeInLaw(text);
  analysis.terms.reputation = scoreReputation(text);
  analysis.terms.incentives = scoreIncentives(text);
  analysis.terms.publicity = scorePublicity(text);
  analysis.terms.buyerpa = scoreBuyerPA(text);
  analysis.terms.eod = scoreEOD(text);
  analysis.terms.eterm = scoreETerm(text);
  analysis.terms.product = scoreProduct(text);
  analysis.terms.recs = scoreRECs(text);
  analysis.terms.govlaw = scoreGovLaw(text);
  analysis.terms.conf = scoreConf(text);
  analysis.terms.excl = scoreExcl(text);
  analysis.terms.expenses = scoreExpenses(text);
  analysis.terms.acct = scoreAcct(text);
  
  // Identify critical issues
  Object.entries(analysis.terms).forEach(([term, score]) => {
    if (score >= 75) {
      analysis.analysis.criticalIssues.push(term);
    }
  });
  
  // Detect unusual provisions (rule-based)
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('project replacement') || lowerText.includes('substitute project') || lowerText.includes('alternative project')) {
    analysis.unusualProvisions.push({
      provision: 'Project Replacement Rights',
      severity: 'CRITICAL',
      description: 'Seller can substitute original project with different project',
      impact: 'Buyer may end up with lower quality project, different location, or worse economics',
      recommendation: 'REJECT. Remove entirely or limit to force majeure with buyer consent.'
    });
  }
  
  if (lowerText.includes('most favored') || lowerText.includes('most-favored')) {
    analysis.unusualProvisions.push({
      provision: 'Most Favored Customer Clause',
      severity: 'ATTENTION',
      description: 'Buyer entitled to price reduction if seller offers lower price to any other customer',
      impact: 'May create disclosure obligations and monitoring burden',
      recommendation: 'Acceptable if limited to same technology/region/vintage; reject if overly broad'
    });
  }
  
  if (lowerText.includes('mac clause') || lowerText.includes('material adverse change')) {
    analysis.unusualProvisions.push({
      provision: 'Material Adverse Change (MAC) Clause',
      severity: 'CRITICAL',
      description: 'Allows renegotiation if market conditions become unfavorable',
      impact: 'Undermines fixed-price certainty of the contract',
      recommendation: 'REJECT. Fixed price must remain fixed regardless of market changes.'
    });
  }
  
  // Detect missing protections
  if (!lowerText.includes('negative price') && !lowerText.includes('price floor')) {
    analysis.missingProtections.push({
      protection: 'Negative Price Protection',
      standard: 'Zero-dollar price floor or economic non-settlement clause',
      risk: 'Buyer exposed to negative pricing hours; potential $500K+ annual cost in ERCOT'
    });
  }
  
  if (!lowerText.includes('availability') && !lowerText.includes('guaranteed availability')) {
    analysis.missingProtections.push({
      protection: 'Availability Guarantee',
      standard: '90-95% for wind, 94-99% for solar',
      risk: 'No performance guarantee; project could underperform without recourse'
    });
  }
  
  return analysis;
}

// ═══════════════════════════════════════════════════════════════
// EXTRACTOR FUNCTIONS
// ═══════════════════════════════════════════════════════════════

function extractISO(text) {
  const isos = ['ERCOT', 'PJM', 'CAISO', 'MISO', 'ISO-NE', 'NYISO', 'SPP', 'AESO'];
  for (const iso of isos) {
    if (text.toUpperCase().includes(iso)) return iso;
  }
  return null;
}

function extractTechnology(text) {
  const lower = text.toLowerCase();
  if (lower.includes('solar') || lower.includes('pv') || lower.includes('photovoltaic')) return 'Solar';
  if (lower.includes('wind')) return 'Wind';
  if (lower.includes('battery') || lower.includes('storage')) return 'Storage';
  return null;
}

function extractCapacity(text) {
  const match = text.match(/(\d+)\s*(MW|mw|megawatt)/);
  if (match) return `${match[1]} MWac`;
  return null;
}

function extractStrikePrice(text) {
  const patterns = [
    /\$(\d+\.?\d*)\s*\/\s*MWh/i,
    /strike\s*price.*?\$(\d+\.?\d*)/i,
    /fixed\s*price.*?\$(\d+\.?\d*)/i
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return parseFloat(match[1]);
  }
  return null;
}

function extractTerm(text) {
  const match = text.match(/(\d+)\s*(year|yr)/i);
  if (match) return `${match[1]} years`;
  return null;
}

function extractCOD(text) {
  const patterns = [
    // TCOD double-newline format: "Target Commercial Operation Date (TCOD):\n\nMarch 1, 2027"
    /Target(?:ed)?\s+Commercial\s+Operation\s+Date[^:]*:\s*\n\n\s*([A-Za-z]+\s+\d{1,2},?\s*\d{4})/im,
    /\bTCOD[^:]*:\s*\n\n\s*([A-Za-z]+\s+\d{1,2},?\s*\d{4})/im,
    // Inline TCOD: "TCOD: March 1, 2027"
    /\bTCOD[^:]*:\s*([A-Za-z]+\s+\d{1,2},?\s*\d{4}|Q\d[\s/]*\d{4})/i,
    // Target Commercial Operation Date: April 1, 2026
    /Target(?:ed)?\s+Commercial\s+Operation\s+Date[^:]*:\s*([A-Za-z]+\s+\d{1,2},?\s*\d{4}|Q\d[\s/]*\d{4})/i,
    // Generic COD: April 2026
    /(?:targeted|guaranteed|expected)?\s*cod[:\s]+([a-z]+\s+\d{1,2},?\s*\d{4}|q\d[\s/]*\d{4}|\d{4})/i,
    /commercial\s*(?:operation)?\s*date[:\s]+([a-z]+\s+\d{1,2},?\s*\d{4}|q\d[\s/]*\d{4}|\d{4})/i,
    /\bcod\s+([a-z]+\s+\d{4}|q\d[\s/]*\d{4})\b/i,
    /cod.*?\b(20\d{2})\b/i
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return match[1].trim();
    }
  }
  return null;
}

// ═══════════════════════════════════════════════════════════════
// SCORING FUNCTIONS
// ═══════════════════════════════════════════════════════════════

function scoreStrikePrice(text, price) {
  if (!price) return 50;
  if (price < 35) return 15;
  if (price < 50) return 35;
  if (price < 65) return 60;
  return 85;
}

function scoreCurtailment(text) {
  const lower = text.toLowerCase();
  if (lower.includes('seller borne') || lower.includes('seller risk')) return 15;
  if (lower.includes('50/50') || lower.includes('shared')) return 40;
  if (lower.includes('buyer borne') || lower.includes('100% buyer')) return 90;
  return 75;
}

function scoreInterconnection(text) {
  const lower = text.toLowerCase();
  if (lower.includes('executed ia')) return 20;
  if (lower.includes('ia condition precedent')) return 40;
  if (lower.includes('queue position') || lower.includes('no ia')) return 90;
  return 65;
}

function scoreDelayDamages(text) {
  const lower = text.toLowerCase();
  if (lower.includes('delay damages') && lower.includes('$250')) return 25;
  if (lower.includes('delay damages') && lower.includes('$200')) return 45;
  if (lower.includes('delay damages') && lower.includes('$100')) return 70;
  if (!lower.includes('delay damages')) return 88;
  return 60;
}

function scoreForceMajeure(text) {
  const lower = text.toLowerCase();
  // CEBA guidance: 12-month cap is standard, exclude market rule changes & pandemic
  let score = 50;
  
  // Duration cap scoring
  if (lower.includes('6 month')) score = 20;
  else if (lower.includes('12 month')) score = 40;
  else if (lower.includes('18 month')) score = 60;
  else if (!lower.includes('month') && lower.includes('cap')) score = 70;
  else if (!lower.includes('cap')) score = 85; // No cap is bad
  
  // Penalize for problematic inclusions (CEBA red flags)
  if (lower.includes('market rule') || lower.includes('market disruption')) score += 15;
  if (lower.includes('permitting delay') || lower.includes('interconnection delay')) score += 15;
  if (lower.includes('supply chain')) score += 10;
  if (lower.includes('pandemic') && !lower.includes('new pandemic')) score += 10;
  
  // Bonus for exclusions
  if (lower.includes('not force majeure') && lower.includes('covid')) score -= 10;
  if (lower.includes('grid unavailability')) score -= 5; // Good addition per CEBA
  
  return Math.min(100, Math.max(0, score));
}

function scoreFloatingPrice(text) {
  const lower = text.toLowerCase();
  if (lower.includes('hub lmp') && lower.includes('defined')) return 40;
  if (lower.includes('adjusted floating') && lower.includes('undefined')) return 78;
  if (!lower.includes('settlement formula')) return 75;
  return 50;
}

function scoreInterval(text) {
  const lower = text.toLowerCase();
  if (lower.includes('5-minute') || lower.includes('5 minute') || lower.includes('five-minute') || lower.includes('five minute')) return 15;
  if (lower.includes('15-minute') || lower.includes('15 minute')) return 25;
  if (lower.includes('hourly')) return 35;
  if (lower.includes('monthly averaging') || lower.includes('monthly average')) return 70;
  if (lower.includes('monthly')) return 62;
  return 50;
}

function scoreNegPrice(text) {
  const lower = text.toLowerCase();
  if (lower.includes('zero dollar') || lower.includes('$0 floor')) return 12;
  if (lower.includes('non-settlement')) return 55;
  if (lower.includes('no protection')) return 85;
  return 50;
}

function scoreInvoice(text) {
  const lower = text.toLowerCase();
  if (lower.includes('net 20') || lower.includes('net 30')) return 35;
  if (lower.includes('net 45')) return 58;
  return 50;
}

function scoreBasis(text) {
  const lower = text.toLowerCase();
  if (lower.includes('hub lmp') && !lower.includes('election')) return 30;
  if (lower.includes('seller election') || lower.includes('cherry-pick')) return 75;
  return 50;
}

function scoreAvailability(text) {
  const lower = text.toLowerCase();
  // CEBA guidance: Wind 90-95%, Solar 94-99%
  const tech = extractTechnology(text) || 'Solar';
  const minThreshold = tech === 'Wind' ? 90 : 94;
  
  const availMatch = text.match(/(\d+)%\s*(?:mechanical\s*)?availability/i);
  if (availMatch) {
    const avail = parseInt(availMatch[1]);
    if (avail >= minThreshold + 4) return 25; // Excellent (95% wind, 98-99% solar)
    if (avail >= minThreshold) return 40; // Good (90-95% wind, 94-97% solar)
    if (avail >= minThreshold - 4) return 60; // Below standard
    return 85; // Poor availability guarantee
  }
  
  if (lower.includes('availability') && lower.includes('guarantee')) return 45;
  if (lower.includes('production target')) return 70;
  return 77;
}

function scorePermit(text) {
  const lower = text.toLowerCase();
  if (lower.includes('fm') && lower.includes('permit')) return 65;
  return 50;
}

function scoreGuaranteedAvailability(text) {
  const lower = text.toLowerCase();
  if (lower.includes('no guaranteed') || lower.includes('not guarantee') || lower.includes('percentage of')) return 20;
  if (lower.includes('guaranteed annual production') || lower.includes('fixed mwh')) return 78;
  if (lower.includes('buyer\'s share') && lower.includes('%')) return 25;
  return 50;
}

function scoreCOD(text) {
  const lower = text.toLowerCase();
  if (lower.includes('outside commercial operation') || lower.includes('ocod')) {
    if (lower.includes('180 days') || lower.includes('six months')) return 22;
    if (lower.includes('12 months') || lower.includes('one year')) return 55;
    return 40;
  }
  if (lower.includes('target cod') || lower.includes('target commercial operation')) return 35;
  return 70; // No OCOD defined is seller-favorable/red
}

function scoreMarketDisrupt(text) {
  const lower = text.toLowerCase();
  if (lower.includes('market disruption') && lower.includes('good faith')) return 35;
  if (lower.includes('seller') && lower.includes('reference price')) return 85;
  if (lower.includes('historic average') || lower.includes('true-up')) return 30;
  if (!lower.includes('market disruption')) return 45;
  return 50;
}

function scoreScheduling(text) {
  const lower = text.toLowerCase();
  if (lower.includes('qualified scheduling entity') || lower.includes('qse') || lower.includes('market participant')) {
    if (lower.includes('seller shall act') || lower.includes('seller acts')) return 25;
    return 40;
  }
  if (lower.includes('third party') && lower.includes('schedul')) return 65;
  return 55; // No provision defaults to seller-favorable
}

function scoreNonEcoCurtailment(text) {
  const lower = text.toLowerCase();
  if (lower.includes('non-economic curtailment') || lower.includes('non economic curtailment')) {
    if (lower.includes('system emergency') && lower.includes('forced outage')) return 25;
    if (lower.includes('maintenance')) return 68; // Broad definition
    return 40;
  }
  if (lower.includes('iso/rto') && lower.includes('curtailment')) return 35;
  return 55;
}

function scoreBasisCurtailment(text) {
  const lower = text.toLowerCase();
  if (lower.includes('deemed generation') && lower.includes('basis')) return 20;
  if (lower.includes('rec replacement') && lower.includes('congestion')) return 38;
  if (lower.includes('basis curtailment') && lower.includes('excused')) return 65;
  if (lower.includes('busbar') || lower.includes('nodal') && lower.includes('curtail')) return 50;
  return 60; // Most deals have no basis curtailment protection
}

function scoreChangeInLaw(text) {
  const lower = text.toLowerCase();
  if (lower.includes('change in law') || lower.includes('change of law')) {
    if (lower.includes('fixed price') && (lower.includes('not affected') || lower.includes('shall not be affected'))) return 22;
    if (lower.includes('renegotiat') || lower.includes('re-negotiat')) return 65;
    if (lower.includes('seller') && lower.includes('terminat')) return 82;
    if (lower.includes('cost pass')) return 88;
    return 40;
  }
  return 50;
}

function scoreReputation(text) {
  const lower = text.toLowerCase();
  if (lower.includes('reputational') || lower.includes('public opposition') || lower.includes('wildlife')) {
    if (lower.includes('ongoing') || lower.includes('notify') || lower.includes('cooperat')) return 20;
    return 38;
  }
  if (lower.includes('esg') || lower.includes('environmental stewardship')) return 30;
  return 55;
}

function scoreIncentives(text) {
  const lower = text.toLowerCase();
  if (lower.includes('ancillary') && lower.includes('buyer')) {
    if (lower.includes('net revenue') || lower.includes('share')) return 22;
  }
  if (lower.includes('seller retain') && lower.includes('capacity')) return 55;
  if (lower.includes('itc') || lower.includes('investment tax credit')) return 45;
  return 50;
}

function scorePublicity(text) {
  const lower = text.toLowerCase();
  if (lower.includes('prior written consent') || lower.includes('mutual consent')) return 22;
  if (lower.includes('buyer consent') && lower.includes('public')) return 30;
  if (lower.includes('seller may') && lower.includes('announce')) return 72;
  if (!lower.includes('publicity') && !lower.includes('press release')) return 60;
  return 45;
}

function scoreBuyerPA(text) {
  const lower = text.toLowerCase();
  if (lower.includes('parent guarantee')) return 22;
  if (lower.includes('lc required')) return 45;
  return 30;
}

function scoreSellerPA(text) {
  const lower = text.toLowerCase();
  if (lower.includes('seller lc') || lower.includes('seller performance assurance')) return 40;
  if (lower.includes('no seller pa')) return 82;
  return 70;
}

function scoreAssignment(text) {
  const lower = text.toLowerCase();
  if (lower.includes('buyer consent') && lower.includes('third')) return 30;
  if (lower.includes('unrestricted')) return 82;
  return 55;
}

function scoreEOD(text) {
  const lower = text.toLowerCase();
  if (lower.includes('symmetric') || lower.includes('mutual')) return 40;
  if (lower.includes('buyer: 5') && lower.includes('seller: 3')) return 62;
  return 50;
}

function scoreETerm(text) {
  const lower = text.toLowerCase();
  if (lower.includes('mtm') && lower.includes('both directions')) return 42;
  return 50;
}

function scoreProduct(text) {
  return 40;
}

function scoreRECs(text) {
  const lower = text.toLowerCase();
  if (lower.includes('replacement obligation')) return 35;
  if (!lower.includes('replacement')) return 55;
  return 50;
}

function scoreGovLaw(text) {
  const lower = text.toLowerCase();
  if (lower.includes('new york') || lower.includes('ny law')) return 18;
  return 25;
}

function scoreConf(text) {
  const lower = text.toLowerCase();
  if (lower.includes('3 year') || lower.includes('5 year')) return 35;
  if (lower.includes('1 year')) return 44;
  return 40;
}

function scoreExcl(text) {
  const lower = text.toLowerCase();
  if (lower.includes('no exclusivity')) return 15;
  return 30;
}

function scoreExpenses(text) {
  return 38;
}

function scoreAcct(text) {
  return 48;
}

function scoreConditionsPrecedent(text) {
  const lower = text.toLowerCase();
  if (lower.includes('executed ia') && lower.includes('permits')) return 35;
  if (lower.includes('no cp')) return 80;
  return 60;
}

// ═══════════════════════════════════════════════════════════════
// UI HELPERS
// ═══════════════════════════════════════════════════════════════

function updateProgress(percent, label, sub) {
  document.getElementById('analyzingBar').style.width = `${percent}%`;
  if (label) document.getElementById('analyzingLabel').textContent = label;
  if (sub) document.getElementById('analyzingSub').textContent = sub;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function showError(msg) {
  const el = document.getElementById('intakeError');
  el.textContent = msg;
  el.style.display = 'block';
}

// ═══════════════════════════════════════════════════════════════
// DISPLAY FULL ANALYSIS REPORT
// ═══════════════════════════════════════════════════════════════

function showFullAnalysisReport() {
  const data = window.analysisData;
  if (!data) {
    alert('No analysis data available. Please analyze a term sheet first.');
    return;
  }
  
  let reportHTML = `
    <div style="max-width:800px;max-height:90vh;overflow-y:auto;background:var(--surface);padding:30px;border-radius:12px;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
        <h2 style="font-family:'Fraunces',serif;font-size:22px;">ClearPath Analysis Report</h2>
        <button onclick="this.closest('.report-modal').remove()" style="background:none;border:none;font-size:20px;cursor:pointer;">✕</button>
      </div>
      
      <div style="margin-bottom:20px;">
        <div style="font-family:'DM Mono',monospace;font-size:11px;color:var(--text-muted);margin-bottom:5px;">OVERALL RATING</div>
        <div style="font-family:'Fraunces',serif;font-size:24px;font-weight:700;color:var(--critical);">${data.overallRating || 'N/A'}</div>
        <div style="font-size:13px;color:var(--text-dim);margin-top:8px;">${data.overallRationale || ''}</div>
      </div>
  `;
  
  if (data.pricingAssessment) {
    reportHTML += `
      <div style="margin-bottom:20px;padding:15px;background:var(--surface2);border-radius:8px;">
        <div style="font-family:'DM Mono',monospace;font-size:10px;color:var(--text-muted);margin-bottom:8px;">PRICING ASSESSMENT</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;font-size:12px;">
          <div>vs Market: <strong>${data.pricingAssessment.vsMarket}</strong></div>
          <div>Benchmark: ${data.pricingAssessment.benchmarkRange}</div>
          <div>Spread: ${data.pricingAssessment.spreadPerMWh > 0 ? '+' : ''}${data.pricingAssessment.spreadPerMWh}/MWh</div>
          <div>Annual Value: ${data.pricingAssessment.annualValue}</div>
        </div>
      </div>
    `;
  }
  
  if (data.redFlags && data.redFlags.length > 0) {
    reportHTML += `
      <div style="margin-bottom:20px;">
        <div style="font-family:'DM Mono',monospace;font-size:10px;color:var(--critical);margin-bottom:10px;">🔴 RED FLAGS (${data.redFlags.length})</div>
    `;
    data.redFlags.forEach(flag => {
      reportHTML += `
        <div style="margin-bottom:12px;padding:12px;background:var(--critical-bg);border-left:3px solid var(--critical);border-radius:0 6px 6px 0;">
          <div style="font-weight:600;font-size:13px;margin-bottom:4px;">${flag.term}: ${flag.issue}</div>
          <div style="font-size:12px;color:var(--text-dim);margin-bottom:6px;">${flag.exposure}</div>
          <div style="font-size:11px;color:var(--accent);">${flag.recommendation}</div>
        </div>
      `;
    });
    reportHTML += '</div>';
  }
  
  if (data.negotiationOpportunities && data.negotiationOpportunities.length > 0) {
    reportHTML += `
      <div style="margin-bottom:20px;">
        <div style="font-family:'DM Mono',monospace;font-size:10px;color:var(--moderate);margin-bottom:10px;">🟡 NEGOTIATION OPPORTUNITIES (${data.negotiationOpportunities.length})</div>
    `;
    data.negotiationOpportunities.forEach(opp => {
      reportHTML += `
        <div style="margin-bottom:10px;padding:10px;background:var(--moderate-bg);border-left:3px solid var(--moderate);border-radius:0 6px 6px 0;">
          <div style="font-weight:600;font-size:12px;margin-bottom:2px;">${opp.term}</div>
          <div style="font-size:11px;color:var(--text-dim);">${opp.recommendation}</div>
        </div>
      `;
    });
    reportHTML += '</div>';
  }
  
  if (data.negotiationMemo) {
    reportHTML += `
      <div style="margin-bottom:20px;">
        <div style="font-family:'DM Mono',monospace;font-size:10px;color:var(--accent);margin-bottom:10px;">💬 NEGOTIATION MEMO</div>
        <div style="padding:15px;background:var(--accent-bg);border-radius:8px;font-size:12px;line-height:1.6;white-space:pre-wrap;">${data.negotiationMemo}</div>
      </div>
    `;
  }
  
  reportHTML += `
      <div style="margin-top:30px;padding:15px;background:var(--info-bg);border-radius:8px;font-size:11px;color:var(--text-muted);line-height:1.5;">
        <strong>Disclaimer:</strong> This is a commercial analysis only. It does not constitute legal advice and should not be relied upon as such. ClearPath Energy identifies commercial risks and market benchmarks — not legal rights, obligations, or remedies. Users should engage qualified energy counsel before executing any contract.
      </div>
    </div>
  `;
  
  const modal = document.createElement('div');
  modal.className = 'report-modal';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.75);backdrop-filter:blur(8px);z-index:2000;display:flex;align-items:center;justify-content:center;padding:20px;';
  modal.innerHTML = reportHTML;
  document.body.appendChild(modal);
  
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.remove();
  });
}

// Market benchmarks by ISO and Technology
const ISO_BENCHMARKS = {
  'ERCOT': {
    'Solar': { min: 40, max: 60, minLabel: '$40–45', avgLabel: '$48–52', maxLabel: '$55–60+' },
    'Wind': { min: 45, max: 70, minLabel: '$45–50', avgLabel: '$52–60', maxLabel: '$60–70+', note: 'Wind data is algorithmic/modeled due to low transaction volume' }
  },
  'SPP': {
    'Solar': { min: 55, max: 75, minLabel: '~$55', avgLabel: '$55–65', maxLabel: '$65–75' },
    'Wind': { min: 40, max: 65, minLabel: '$40–48', avgLabel: '$48–55', maxLabel: '$55–65' }
  },
  'MISO': {
    'Solar': { min: 65, max: 85, minLabel: '~$65', avgLabel: '$65–75', maxLabel: '$75–85' },
    'Wind': { min: 50, max: 78, minLabel: '$50–58', avgLabel: '$58–68', maxLabel: '$68–78' }
  },
  'PJM': {
    'Solar': { min: 81, max: 110, minLabel: '~$81', avgLabel: '$85–95', maxLabel: '$95–110+' },
    'Wind': { min: 70, max: 105, minLabel: '$70–80', avgLabel: '$80–92', maxLabel: '$92–105+' }
  },
  'CAISO': {
    'Solar': { min: 62, max: 90, minLabel: '~$62', avgLabel: '$70–80', maxLabel: '$80–90+' },
    'Wind': { min: 55, max: 85, minLabel: '$55–65', avgLabel: '$65–75', maxLabel: '$75–85+' }
  },
  'ISO-NE': {
    'Solar': { min: 70, max: 95, minLabel: '~$70', avgLabel: '$75–85', maxLabel: '$85–95+' },
    'Wind': { min: 65, max: 90, minLabel: '$65–75', avgLabel: '$72–82', maxLabel: '$82–92' }
  },
  'NYISO': {
    'Solar': { min: 65, max: 90, minLabel: '~$65', avgLabel: '$70–80', maxLabel: '$80–90+' },
    'Wind': { min: 60, max: 85, minLabel: '$60–70', avgLabel: '$68–78', maxLabel: '$78–88' }
  }
};

function applyAnalysis(analysis) {
  if (analysis.deal) {
    if (analysis.deal.iso) {
      DEAL.iso = analysis.deal.iso;
      document.getElementById('metaISO').textContent = analysis.deal.iso;
    }
    if (analysis.deal.project !== undefined && analysis.deal.project !== null) {
      DEAL.projectName = analysis.deal.project || '—';
      document.getElementById('metaProject').textContent = DEAL.projectName;
    }
    if (analysis.deal.developer !== undefined && analysis.deal.developer !== null) {
      DEAL.seller = analysis.deal.developer || '—';
      document.getElementById('metaSeller').textContent = DEAL.seller;
    }
    if (analysis.deal.buyer !== undefined && analysis.deal.buyer !== null) {
      DEAL.buyer = analysis.deal.buyer || '—';
      document.getElementById('metaBuyer').textContent = DEAL.buyer;
    }
    if (analysis.deal.iso) {
      const isoKey = analysis.deal.iso.toUpperCase();
      const techKey = analysis.deal.tech || 'Solar';
      
      let benchmarks = null;
      if (ISO_BENCHMARKS[isoKey]) {
        benchmarks = ISO_BENCHMARKS[isoKey][techKey] || ISO_BENCHMARKS[isoKey]['Solar'];
      }
      
      if (benchmarks) {
        DEAL.marketMin = benchmarks.min;
        DEAL.marketMax = benchmarks.max;
        DEAL.benchmarkMin = benchmarks.minLabel;
        DEAL.benchmarkAvg = benchmarks.avgLabel;
        DEAL.benchmarkMax = benchmarks.maxLabel;
        DEAL.benchmarkLabel = `${isoKey} ${techKey} · ${DEAL.term} · Q4 2025`;
        
        if (benchmarks.note) {
          DEAL.benchmarkNote = benchmarks.note;
        } else {
          delete DEAL.benchmarkNote;
        }
      }
    }
    if (analysis.deal.tech) {
      DEAL.tech = analysis.deal.tech;
      const capacity = analysis.deal.capacity || '100 MWac';
      document.getElementById('metaTech').textContent = `${analysis.deal.tech} · ${capacity}`;
    }
    if (analysis.deal.strikePrice) {
      DEAL.strikePriceNumeric = analysis.deal.strikePrice;
      DEAL.strikePriceDisplay = `$${analysis.deal.strikePrice.toFixed(2)}/MWh`;
      document.getElementById('metaStrike').textContent = DEAL.strikePriceDisplay;
    }
    // Capture escalator if present
    if (analysis.deal.escalator !== undefined) {
      DEAL.escalator = analysis.deal.escalator;
    } else {
      DEAL.escalator = 0; // Default to 0 if not specified
    }
    if (analysis.deal.term) {
      DEAL.term = analysis.deal.term;
      document.getElementById('metaTerm').textContent = analysis.deal.term;
    }
    if (analysis.deal.cod !== undefined && analysis.deal.cod !== null && analysis.deal.cod !== '') {
      DEAL.cod = analysis.deal.cod;
      document.getElementById('metaCOD').textContent = DEAL.cod;
    } else if (analysis.deal.targetedCOD !== undefined && analysis.deal.targetedCOD !== null && analysis.deal.targetedCOD !== '') {
      DEAL.cod = analysis.deal.targetedCOD;
      document.getElementById('metaCOD').textContent = DEAL.cod;
    }
    if (analysis.deal.buyerShare) {
      DEAL.buyerShare = analysis.deal.buyerShare;
    }
  }
  
  if (analysis.terms) {
    Object.keys(analysis.terms).forEach(termId => {
      const score = analysis.terms[termId];
      sliderValues[termId] = Math.max(0, Math.min(100, score));
    });
  }
  
  window.analysisData = analysis;
  
  const iso = analysis.deal?.iso || 'Unknown';
  const rating = analysis.overallRating || 'Analysis';
  document.getElementById('dealTitle').textContent = `${iso} · ${rating}`;
  
  updateHeaderDisplay();
  
  console.log('Analysis applied:', {
    iso: DEAL.iso,
    tech: DEAL.tech,
    strikePrice: DEAL.strikePriceNumeric,
    buyer: DEAL.buyer,
    seller: DEAL.seller,
    project: DEAL.projectName,
    benchmarks: {
      min: DEAL.benchmarkMin,
      avg: DEAL.benchmarkAvg,
      max: DEAL.benchmarkMax
    },
    terms: Object.keys(sliderValues).length + ' terms scored',
    rawDeal: analysis.deal
  });
  
  // Alert for debugging - remove after fixing
  const debugInfo = analysis._debug || {};
  alert(`DEAL EXTRACTED:\nBuyer: ${DEAL.buyer}\nSeller: ${DEAL.seller}\nProject: ${DEAL.projectName}\nCOD: ${DEAL.cod}\n\nRAW CLAUDE RESPONSE:\n${debugInfo.rawClaudeResponse || 'N/A'}`);
}

function updateHeaderDisplay() {
  document.getElementById('metaProject').textContent = DEAL.projectName;
  document.getElementById('metaBuyer').textContent = DEAL.buyer;
  document.getElementById('metaSeller').textContent = DEAL.seller;
  document.getElementById('metaISO').textContent = DEAL.iso;
  document.getElementById('metaTech').textContent = `${DEAL.tech} · ${DEAL.capacity || '100 MWac'}`;
  document.getElementById('metaStrike').textContent = DEAL.strikePriceDisplay;
  document.getElementById('metaTerm').textContent = DEAL.term;
  document.getElementById('metaCOD').textContent = DEAL.cod;
}

function updateTermExposures(redFlags) {
  redFlags.forEach(flag => {
    const termId = flag.term;
    const row = document.getElementById(`row-${termId}`);
    if (row && flag.exposure) {
      const exposureEl = row.querySelector('.row-exposure');
      if (exposureEl) {
        exposureEl.textContent = flag.exposure;
      }
    }
  });
}

// Display unusual provisions detected by Claude
function displayUnusualProvisions(provisions) {
  const container = document.getElementById('unusualProvisionsSection');
  const list = document.getElementById('unusualProvisionsList');
  
  let html = '';
  provisions.forEach(prov => {
    const severityColor = prov.severity === 'CRITICAL' ? 'var(--critical)' : 
                         prov.severity === 'ATTENTION' ? 'var(--moderate)' : 'var(--info)';
    const severityBg = prov.severity === 'CRITICAL' ? 'var(--critical-bg)' : 
                      prov.severity === 'ATTENTION' ? 'var(--moderate-bg)' : 'var(--info-bg)';
    
    html += `
      <div style="margin-bottom:15px; padding:12px; background:${severityBg}; border-left:3px solid ${severityColor}; border-radius:0 6px 6px 0;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
          <strong style="font-size:13px;">${prov.provision}</strong>
          <span style="font-family:'DM Mono',monospace; font-size:10px; padding:2px 8px; background:${severityColor}; color:white; border-radius:4px;">${prov.severity}</span>
        </div>
        <div style="font-size:12px; color:var(--text-dim); margin-bottom:6px;">${prov.description}</div>
        ${prov.impact ? `<div style="font-size:11px; color:var(--text-muted); margin-bottom:6px;">💰 ${prov.impact}</div>` : ''}
        <div style="font-size:11px; color:var(--accent);">→ ${prov.recommendation}</div>
      </div>
    `;
  });
  
  list.innerHTML = html;
  container.style.display = 'block';
  
  // Scroll to it
  container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Display missing standard protections
function displayMissingProtections(protections) {
  const container = document.getElementById('missingProtectionsSection');
  const list = document.getElementById('missingProtectionsList');
  
  let html = '';
  protections.forEach(prot => {
    html += `
      <div style="margin-bottom:12px; padding:12px; background:var(--warning-bg); border-left:3px solid var(--warning); border-radius:0 6px 6px 0;">
        <div style="font-weight:600; font-size:13px; margin-bottom:4px;">⚠️ Missing: ${prot.protection}</div>
        <div style="font-size:12px; color:var(--text-dim); margin-bottom:4px;">Standard: ${prot.standard}</div>
        <div style="font-size:11px; color:var(--critical);">Risk: ${prot.risk}</div>
      </div>
    `;
  });
  
  list.innerHTML = html;
  container.style.display = 'block';
}
