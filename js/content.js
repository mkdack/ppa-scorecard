// ═══════════════════════════════════════════════════════════════
// PPA DEAL SCORECARD - CONTENT DEFINITIONS
// ═══════════════════════════════════════════════════════════════

// Deal configuration - starts empty, populated when analyzing new term sheets
var DEAL = {
  strikePriceNumeric: 0,
  strikePriceDisplay: '—',
  escalator: 0,
  iso: '—',
  tech: '—',
  capacity: '—',
  term: '—',
  cod: '—',
  buyer: '—',
  seller: '—',
  projectName: '—',
  benchmarkMin: '—',
  benchmarkAvg: '—',
  benchmarkMax: '—',
  benchmarkLabel: 'Upload a term sheet to see analysis',
  marketMin: 0, 
  marketMax: 0,
  negPriceNote: ''
};

// Zone definitions for slider positions
const ZONES = [
  {min:0, max:25, label:'BUYER-FAVORABLE', badgeClass:'b-good', badgeText:'● BUYER-FAVORABLE', indClass:'ind-good', impClass:'ib-good', priority:'info'},
  {min:25, max:50, label:'AT MARKET', badgeClass:'b-neutral', badgeText:'AT MARKET', indClass:'ind-neutral', impClass:'ib-neutral', priority:'neutral'},
  {min:50, max:75, label:'SELLER-FAVORABLE', badgeClass:'b-moderate', badgeText:'● MODERATE', indClass:'ind-moderate', impClass:'ib-moderate', priority:'moderate'},
  {min:75, max:100, label:'RED FLAG', badgeClass:'b-critical', badgeText:'● CRITICAL', indClass:'ind-critical', impClass:'ib-critical', priority:'critical'}
];

function getZone(p) { return ZONES.find(z => p >= z.min && p < z.max) || ZONES[3]; }

// ═══════════════════════════════════════════════════════════════
// SCORECARD GROUPS AND TERMS
// ═══════════════════════════════════════════════════════════════

const SCORECARD_GROUPS = [
  {
    id: 'pricing',
    title: 'Pricing & Settlement',
    terms: ['strike', 'floating', 'interval', 'negprice', 'invoice', 'basis', 'marketdisrupt']
  },
  {
    id: 'shape',
    title: 'Shape & Curtailment',
    terms: ['curtailment']
  },
  {
    id: 'dev',
    title: 'Project Development',
    terms: ['ia', 'cp', 'delay', 'avail', 'permit', 'cod']
  },
  {
    id: 'credit',
    title: 'Credit & Collateral',
    terms: ['buyerpa', 'sellerpa']
  },
  {
    id: 'contract',
    title: 'Contract Terms',
    terms: ['assign', 'fm', 'eod', 'eterm', 'changeinlaw', 'reputation']
  },
  {
    id: 'recs',
    title: 'RECs & Facility Attributes',
    terms: ['product', 'recs', 'incentives']
  },
  {
    id: 'legal',
    title: 'Legal & Administrative',
    terms: ['govlaw', 'conf', 'excl', 'expenses', 'acct', 'publicity']
  }
];

// Term metadata with default positions - ALL START AT 0 (neutral/unset)
const TERM_META = {
  strike: { name: 'Strike Price', category: 'Pricing', icon: '💰', defaultPos: 0, group: 'pricing', flexibility: 'flexible' },
  floating: { name: 'Floating Price & Settlement Formula', category: 'Settlement Mechanics', icon: '📐', defaultPos: 0, group: 'pricing', flexibility: 'flexible' },
  interval: { name: 'Calculation Interval', category: 'Settlement Mechanics', icon: '⏲', defaultPos: 0, group: 'pricing', flexibility: 'flexible' },
  negprice: { name: 'Minimum Floating Price', category: 'Negative Price Protection', icon: '🛡', defaultPos: 0, group: 'pricing', flexibility: 'flexible' },
  invoice: { name: 'Invoicing & Payment Terms', category: 'Settlement Period', icon: '🧾', defaultPos: 0, group: 'pricing', flexibility: 'flexible' },
  basis: { name: 'Basis Risk', category: 'Settlement Point', icon: '📍', defaultPos: 0, group: 'pricing', flexibility: 'inflexible' },
  curtailment: { name: 'Economic Curtailment', category: 'Shape & Curtailment', icon: '⚡', defaultPos: 0, group: 'shape', flexibility: 'flexible' },
  ia: { name: 'Interconnection Status', category: 'Development Risk', icon: '🔌', defaultPos: 0, group: 'dev', flexibility: 'flexible' },
  cp: { name: 'Seller Conditions Precedent', category: 'Development Risk', icon: '📋', defaultPos: 0, group: 'dev', flexibility: 'flexible' },
  delay: { name: 'Delay & Shortfall Damages', category: 'COD Risk', icon: '📅', defaultPos: 0, group: 'dev', flexibility: 'inflexible' },
  avail: { name: 'Availability Guarantee', category: 'Project Performance', icon: '📊', defaultPos: 0, group: 'dev', flexibility: 'flexible' },
  permit: { name: 'New Permitting Requirements', category: 'Development Risk', icon: '📜', defaultPos: 0, group: 'dev', flexibility: 'inflexible' },
  buyerpa: { name: 'Buyer Performance Assurance', category: 'Credit', icon: '🏛', defaultPos: 0, group: 'credit', flexibility: 'inflexible' },
  sellerpa: { name: 'Seller Performance Assurance', category: 'Credit', icon: '🏦', defaultPos: 0, group: 'credit', flexibility: 'flexible' },
  assign: { name: 'Seller Assignment', category: 'Assignment', icon: '🔄', defaultPos: 0, group: 'contract', flexibility: 'flexible' },
  fm: { name: 'Force Majeure', category: 'Force Majeure', icon: '🌪', defaultPos: 0, group: 'contract', flexibility: 'flexible' },
  eod: { name: 'Events of Default', category: 'Default & Remedies', icon: '⚖️', defaultPos: 0, group: 'contract', flexibility: 'inflexible' },
  eterm: { name: 'Early Termination Rights', category: 'Termination', icon: '🚪', defaultPos: 0, group: 'contract', flexibility: 'flexible' },
  product: { name: 'Product & Facility Attributes', category: 'REC Delivery', icon: '📦', defaultPos: 0, group: 'recs', flexibility: 'flexible' },
  recs: { name: 'REC Delivery & Replacement', category: 'REC Delivery', icon: '🌿', defaultPos: 0, group: 'recs', flexibility: 'inflexible' },
  govlaw: { name: 'Governing Law', category: 'Legal', icon: '⚖️', defaultPos: 0, group: 'legal', flexibility: 'flexible' },
  conf: { name: 'Confidentiality', category: 'Legal', icon: '🔒', defaultPos: 0, group: 'legal', flexibility: 'inflexible' },
  excl: { name: 'Exclusivity', category: 'Legal', icon: '🤝', defaultPos: 0, group: 'legal', flexibility: 'flexible' },
  expenses: { name: 'Expenses & Cost Allocation', category: 'Legal', icon: '💼', defaultPos: 0, group: 'legal', flexibility: 'flexible' },
  acct: { name: 'Accounting Treatment', category: 'ASC 815', icon: '📈', defaultPos: 0, group: 'legal', flexibility: 'flexible' },
  marketdisrupt: { name: 'Market Disruption', category: 'Risk Management', icon: '📉', defaultPos: 0, group: 'pricing', flexibility: 'flexible' },
  cod: { name: 'Commercial Operation Date', category: 'Development Milestone', icon: '🎯', defaultPos: 0, group: 'dev', flexibility: 'inflexible' },
  changeinlaw: { name: 'Change in Law', category: 'Risk Management', icon: '📜', defaultPos: 0, group: 'contract', flexibility: 'inflexible' },
  reputation: { name: 'Reputational Disclosures', category: 'ESG & Reputation', icon: '🌟', defaultPos: 0, group: 'contract', flexibility: 'inflexible' },
  incentives: { name: 'Incentives & Facility Attributes', category: 'Additional Revenue', icon: '💎', defaultPos: 0, group: 'recs', flexibility: 'flexible' },
  publicity: { name: 'Publicity Rights', category: 'Legal', icon: '📢', defaultPos: 0, group: 'legal', flexibility: 'inflexible' }
};

// ═══════════════════════════════════════════════════════════════
// DYNAMIC CONTENT GENERATORS
// ═══════════════════════════════════════════════════════════════

const CONTENT = {
  strike: {
    getContent(p) {
      const zone = getZone(p);
      const marketMin = DEAL.marketMin || 25;
      const marketMax = DEAL.marketMax || 45;
      const marketMid = (marketMin + marketMax) / 2;
      const priceRange = (marketMax - marketMin) + 30;
      const minPrice = marketMin - 15;
      const negotiatedStrike = minPrice + (p / 100 * priceRange);
      const spreadFromMarket = negotiatedStrike - marketMid;
      const escalatorText = DEAL.escalator && DEAL.escalator > 0 ? `${DEAL.escalator}% annual escalator` : 'no escalator';
      
      let positionLabel = '', annualSavings = '';
      const annualMWh = 100000;
      
      if (spreadFromMarket < -5) {
        positionLabel = 'BELOW MARKET';
        annualSavings = `Save ~$${(Math.abs(spreadFromMarket) * annualMWh / 1000000).toFixed(1)}M/year vs market`;
      } else if (spreadFromMarket < 5) {
        positionLabel = 'AT MARKET';
        annualSavings = 'Market-standard pricing';
      } else if (spreadFromMarket < 15) {
        positionLabel = 'ABOVE MARKET';
        annualSavings = `Pay ~$${(spreadFromMarket * annualMWh / 1000000).toFixed(1)}M/year extra vs market`;
      } else {
        positionLabel = 'EXCESSIVE';
        annualSavings = `Overpay ~$${(spreadFromMarket * annualMWh / 1000000).toFixed(1)}M/year vs market`;
      }
      
      const actualStrike = DEAL.strikePriceNumeric || negotiatedStrike;
      
      return {
        term: `<strong>$${negotiatedStrike.toFixed(2)}/MWh fixed,</strong> ${escalatorText}. <br><em>Original term sheet: $${actualStrike.toFixed(2)}/MWh</em>`,
        bench: `Market Range: Min ${DEAL.benchmarkMin} / Avg ${DEAL.benchmarkAvg} / Max ${DEAL.benchmarkMax}.`,
        impact: positionLabel,
        impactsub: `${annualSavings}<br>vs market avg ~$${marketMid.toFixed(0)}/MWh`,
        rec: zone.priority === 'critical' ? `Significantly overpaying. Target $${marketMid.toFixed(0)}/MWh or below.` : zone.priority === 'moderate' ? `Negotiate down to $${(marketMid + 5).toFixed(0)}/MWh range.` : 'Pricing position acceptable.',
        reclabel: zone.priority === 'critical' ? 'Strategy — Renegotiate' : zone.priority === 'moderate' ? 'Strategy — Negotiate Down' : 'Strategy — Acceptable'
      };
    }
  },

  floating: {
    getContent(p) {
      const key = p <= 25 ? 'buyer' : p <= 50 ? 'market' : p <= 75 ? 'seller' : 'red';
      const iso = DEAL.iso || 'ERCOT';
      
      const terms = {
        buyer: `<strong>Fixed-for-floating swap using ${iso} Hourly Real-Time LMP</strong> at Hub. Settlement formula clearly defined.`,
        market: `<strong>Fixed-for-floating swap using ${iso} Hourly LMP</strong> at defined Hub. Standard settlement formula.`,
        seller: `<strong>Fixed-for-floating swap with undefined adjustment methodology.</strong> Seller has discretion.`,
        red: `<strong>Floating price definition incomplete.</strong> Settlement formula not specified.`
      };
      
      return {
        term: terms[key],
        bench: `Standard: ${iso} Hourly Real-Time LMP at Hub, settled monthly.`,
        impact: key === 'buyer' ? 'TRANSPARENT' : key === 'market' ? 'STANDARD' : key === 'seller' ? 'OPAQUE' : 'UNDEFINED',
        impactsub: key === 'buyer' ? 'Formula defined<br>calculation clear' : key === 'market' ? 'Hourly LMP swap<br>monthly settlement' : key === 'seller' ? 'Partial discretion<br>on adjustments' : 'No settlement<br>formula specified',
        rec: key === 'red' ? 'Define explicit settlement formula with Hub LMP.' : key === 'seller' ? 'Push for transparent formula definition.' : 'Settlement formula acceptable.',
        reclabel: key === 'red' ? 'Priority — Define Formula' : key === 'seller' ? 'Still Negotiating' : 'Outcome — Acceptable'
      };
    }
  },

  interval: {
    getContent(p) {
      const key = p <= 25 ? 'buyer' : p <= 50 ? 'market' : p <= 75 ? 'seller' : 'red';
      
      return {
        term: key === 'buyer' ? '<strong>Hourly settlement interval</strong> matched to ISO real-time market.' :
              key === 'market' ? '<strong>Hourly settlement interval</strong> — standard for most ISO markets.' :
              '<strong>Daily or monthly settlement interval</strong> — less granular, more settlement risk.',
        bench: 'Standard: Hourly settlement matching ISO market intervals.',
        impact: key === 'buyer' ? 'HOURLY' : key === 'market' ? 'STANDARD' : 'DELAYED',
        impactsub: key === 'buyer' ? 'Hourly settlement<br>maximum transparency' : key === 'market' ? 'Hourly settlement<br>market standard' : 'Daily/monthly<br>reduced transparency',
        rec: key === 'red' ? 'Push for hourly settlement interval.' : 'Hourly settlement acceptable.',
        reclabel: key === 'red' ? 'Priority — Push For' : 'Outcome — Acceptable'
      };
    }
  },

  negprice: {
    getContent(p) {
      const key = p <= 25 ? 'buyer' : p <= 50 ? 'market' : p <= 75 ? 'seller' : 'red';
      
      return {
        term: key === 'buyer' ? '<strong>Zero-dollar price floor (Option 2).</strong> Floating price deemed $0 when negative.' :
              key === 'market' ? '<strong>Economic non-settlement (Option 1).</strong> No settlement when price negative.' :
              '<strong>No negative price protection.</strong> Buyer exposed to full negative pricing.',
        bench: 'Standard: Zero price floor or economic non-settlement clause.',
        impact: key === 'buyer' ? 'PROTECTED' : key === 'market' ? 'STANDARD' : 'EXPOSED',
        impactsub: key === 'buyer' ? 'Zero price floor<br>RECs preserved' : key === 'market' ? 'Non-settlement<br>no RECs during negative' : 'No protection<br>significant cost risk',
        rec: key === 'red' ? 'Add zero-dollar price floor or economic non-settlement.' : 'Negative price protection acceptable.',
        reclabel: key === 'red' ? 'Priority 1 — Push For' : 'Outcome — Protected'
      };
    }
  },

  invoice: {
    getContent(p) {
      const key = p <= 25 ? 'buyer' : p <= 50 ? 'market' : p <= 75 ? 'seller' : 'red';
      
      return {
        term: key === 'buyer' ? '<strong>Net 20 payment terms.</strong> Fast settlement cycle.' :
              key === 'market' ? '<strong>Net 30 payment terms.</strong> Standard payment period.' :
              '<strong>Net 45+ payment terms.</strong> Extended terms or high interest.',
        bench: 'Standard: Net 30 payment terms.',
        impact: key === 'buyer' ? 'NET 20' : key === 'market' ? 'NET 30' : 'EXTENDED',
        impactsub: key === 'buyer' ? 'Fast payment cycle' : key === 'market' ? 'Standard 30-day terms' : 'Extended terms',
        rec: key === 'red' ? 'Negotiate to Net 30 maximum.' : 'Payment terms acceptable.',
        reclabel: key === 'red' ? 'Priority — Fix Terms' : 'Outcome — Acceptable'
      };
    }
  },

  basis: {
    getContent(p) {
      const key = p <= 25 ? 'buyer' : p <= 50 ? 'market' : p <= 75 ? 'seller' : 'red';
      const iso = DEAL.iso || 'ERCOT';
      
      return {
        term: key === 'buyer' ? `<strong>Hub settlement at ${iso} North Hub.</strong> Seller bears basis risk.` :
              key === 'market' ? `<strong>Hub settlement.</strong> Standard hub LMP pricing.` :
              `<strong>Node/bus bar settlement.</strong> Buyer bears basis risk.`,
        bench: `Standard: Hub settlement at ${iso} Hub.`,
        impact: key === 'buyer' ? 'HUB' : key === 'market' ? 'STANDARD' : 'BASIS RISK',
        impactsub: key === 'buyer' ? 'Seller bears basis risk' : key === 'market' ? 'Hub LMP standard' : 'Buyer bears basis risk',
        rec: key === 'red' ? 'Push for hub settlement.' : 'Settlement point acceptable.',
        reclabel: key === 'red' ? 'Priority — Fix' : 'Outcome — Acceptable'
      };
    }
  },

  curtailment: {
    getContent(p) {
      const key = p <= 25 ? 'buyer' : p <= 50 ? 'market' : p <= 75 ? 'seller' : 'red';
      
      const terms = {
        buyer: '<strong>Seller-borne</strong> economic curtailment — best outcome.',
        market: '<strong>50/50 shared</strong> economic curtailment.',
        seller: '<strong>75% buyer-borne</strong> economic curtailment.',
        red: '<strong>100% buyer-borne</strong> economic curtailment.'
      };
      
      return {
        term: terms[key],
        bench: 'Market standard: 50/50 shared or seller-borne.',
        impact: key === 'buyer' ? 'SELLER-BORNE' : key === 'market' ? '50/50' : key === 'seller' ? '75% BUYER' : '100% BUYER',
        impactsub: key === 'buyer' ? 'Seller bears all risk' : key === 'market' ? 'Shared risk' : 'Buyer bears most/all risk',
        rec: key === 'red' ? 'Push for 50/50 shared. Do not sign 100% buyer-borne.' : 'Curtailment allocation acceptable.',
        reclabel: key === 'red' ? 'Priority 1 — Push For' : 'Outcome — Acceptable'
      };
    }
  },

  ia: {
    getContent(p) {
      const key = p <= 25 ? 'buyer' : p <= 50 ? 'market' : p <= 75 ? 'seller' : 'red';
      
      return {
        term: key === 'buyer' ? '<strong>Executed Interconnection Agreement</strong> as condition precedent.' :
              key === 'market' ? '<strong>IA condition precedent</strong> or 90-day termination right.' :
              '<strong>No executed IA.</strong> Queue position only.',
        bench: 'Standard: Executed IA as CP or termination right.',
        impact: key === 'buyer' ? 'LOW RISK' : key === 'market' ? 'MANAGED' : 'HIGH RISK',
        impactsub: key === 'buyer' ? 'IA executed' : key === 'market' ? 'Exit right if no IA' : 'COD delay likely',
        rec: key === 'red' ? 'Require executed IA as CP or 90-day termination right.' : 'Interconnection protection acceptable.',
        reclabel: key === 'red' ? 'Priority 1 — Push For' : 'Outcome — Acceptable'
      };
    }
  },

  delay: {
    getContent(p) {
      const key = p <= 25 ? 'buyer' : p <= 50 ? 'market' : p <= 75 ? 'seller' : 'red';
      
      return {
        term: key === 'buyer' ? '<strong>$250/MW/day Delay Damages.</strong> Full remedy suite.' :
              key === 'market' ? '<strong>$200/MW/day Delay Damages.</strong> Standard remedy.' :
              '<strong>No Delay Damages defined.</strong> No financial consequence.',
        bench: 'Standard: $200-250/MW/day after Guaranteed COD.',
        impact: key === 'buyer' ? '$250/MW/day' : key === 'market' ? '$200/MW/day' : '$0',
        impactsub: key === 'buyer' ? 'Full remedies' : key === 'market' ? 'Standard damages' : 'No consequence',
        rec: key === 'red' ? 'Add $250/MW/day Delay Damages and termination right.' : 'Delay damages acceptable.',
        reclabel: key === 'red' ? 'Priority 1 — Push For' : 'Outcome — Acceptable'
      };
    }
  },

  avail: {
    getContent(p) {
      const key = p <= 25 ? 'buyer' : p <= 50 ? 'market' : p <= 75 ? 'seller' : 'red';
      const tech = DEAL.tech || 'Solar';
      const minAvail = tech === 'Wind' ? '90%' : '94%';
      const targetAvail = tech === 'Wind' ? '95%' : '98%';
      
      return {
        term: key === 'buyer' ? `<strong>${targetAvail} availability guarantee</strong> with meaningful damages.` :
              key === 'market' ? `<strong>${minAvail} Year 1</strong> availability guarantee.` :
              `<strong>Below-standard availability</strong> or weak damages.`,
        bench: `Standard: ${tech === 'Wind' ? '90-95%' : '94-99%'} availability guarantee.`,
        impact: key === 'buyer' ? 'STRONG' : key === 'market' ? 'STANDARD' : 'WEAK',
        impactsub: key === 'buyer' ? `${targetAvail} guarantee` : key === 'market' ? `${minAvail} Year 1` : 'Weak guarantee',
        rec: key === 'red' ? `Push for ${targetAvail} availability with meaningful damages.` : 'Availability guarantee acceptable.',
        reclabel: key === 'red' ? 'Priority — Strengthen' : 'Outcome — Acceptable'
      };
    }
  },

  recs: {
    getContent(p) {
      const key = p <= 25 ? 'buyer' : p <= 50 ? 'market' : p <= 75 ? 'seller' : 'red';
      
      return {
        term: key === 'buyer' ? '<strong>Green-e certified RECs</strong> with 2-year replacement obligation.' :
              key === 'market' ? '<strong>Project RECs delivered monthly</strong> with standard replacement.' :
              '<strong>Limited REC protections.</strong> No replacement obligation.',
        bench: 'Standard: Green-e certified with 2-year replacement.',
        impact: key === 'buyer' ? 'FULL' : key === 'market' ? 'STANDARD' : 'LIMITED',
        impactsub: key === 'buyer' ? 'Green-e + replacement' : key === 'market' ? 'Standard replacement' : 'Limited protection',
        rec: key === 'red' ? 'Add 2-year replacement obligation.' : 'REC terms acceptable.',
        reclabel: key === 'red' ? 'Priority — Add' : 'Outcome — Acceptable'
      };
    }
  },

  sellerpa: {
    getContent(p) {
      const key = p <= 25 ? 'buyer' : p <= 50 ? 'market' : p <= 75 ? 'seller' : 'red';
      
      return {
        term: key === 'buyer' ? '<strong>Letter of Credit</strong> from Qualified Institution. $100K/MW pre-COD.' :
              key === 'market' ? '<strong>LC or Parent Guarantee</strong> from investment-grade entity.' :
              '<strong>Weak or no seller credit support.</strong>',
        bench: 'Standard: LC $100K/MW pre-COD, $75K/MW post-COD.',
        impact: key === 'buyer' ? 'LC REQUIRED' : key === 'market' ? 'STANDARD' : 'WEAK',
        impactsub: key === 'buyer' ? 'Strong credit support' : key === 'market' ? 'Acceptable support' : 'Counterparty risk',
        rec: key === 'red' ? 'Require LC from Qualified Institution.' : 'Seller credit support acceptable.',
        reclabel: key === 'red' ? 'Priority 1 — Push For' : 'Outcome — Protected'
      };
    }
  },

  buyerpa: {
    getContent(p) {
      const key = p <= 25 ? 'buyer' : p <= 50 ? 'market' : p <= 75 ? 'seller' : 'red';
      
      return {
        term: key === 'buyer' ? '<strong>Parent Guarantee only.</strong> No LC required.' :
              key === 'market' ? '<strong>Parent Guarantee or LC.</strong> Standard credit support.' :
              '<strong>LC required or excessive support.</strong>',
        bench: 'Standard: Parent Guarantee for investment grade buyers.',
        impact: key === 'buyer' ? 'PARENT ONLY' : key === 'market' ? 'STANDARD' : 'EXCESSIVE',
        impactsub: key === 'buyer' ? 'No LC burden' : key === 'market' ? 'Parent or LC' : 'LC required',
        rec: key === 'red' ? 'Push for Parent Guarantee only.' : 'Buyer credit support acceptable.',
        reclabel: key === 'red' ? 'Priority — Reduce' : 'Outcome — Acceptable'
      };
    }
  },

  assign: {
    getContent(p) {
      const key = p <= 25 ? 'buyer' : p <= 50 ? 'market' : p <= 75 ? 'seller' : 'red';
      
      return {
        term: key === 'buyer' ? '<strong>Buyer consent required</strong> for all third-party assignments.' :
              key === 'market' ? '<strong>Consent for unaffiliated</strong> third-party assignment.' :
              '<strong>Unrestricted third-party assignment</strong> — no consent.',
        bench: 'Standard: Buyer consent for unaffiliated third-party assignment.',
        impact: key === 'buyer' ? 'PROTECTED' : key === 'market' ? 'STANDARD' : 'EXPOSED',
        impactsub: key === 'buyer' ? 'Full consent right' : key === 'market' ? 'Consent for unaffiliated' : 'No consent required',
        rec: key === 'red' ? 'Require buyer consent for third-party assignment.' : 'Assignment terms acceptable.',
        reclabel: key === 'red' ? 'Priority — Push For' : 'Outcome — Acceptable'
      };
    }
  },

  fm: {
    getContent(p) {
      const key = p <= 25 ? 'buyer' : p <= 50 ? 'market' : p <= 75 ? 'seller' : 'red';
      
      return {
        term: key === 'buyer' ? '<strong>Narrow FM with 6-month cap.</strong> Excludes market rules, pandemic.' :
              key === 'market' ? '<strong>Standard FM with 12-month cap.</strong> Excludes COVID-19.' :
              '<strong>Broad FM with 18+ month cap.</strong> Includes market rules.',
        bench: 'Standard: 12-month cap, excludes COVID-19.',
        impact: key === 'buyer' ? 'NARROW' : key === 'market' ? 'STANDARD' : 'BROAD',
        impactsub: key === 'buyer' ? '6-month cap' : key === 'market' ? '12-month cap' : '18+ month cap',
        rec: key === 'red' ? 'Narrow FM to 12-month cap. Exclude market rules.' : 'FM terms acceptable.',
        reclabel: key === 'red' ? 'Priority — Narrow FM' : 'Outcome — Acceptable'
      };
    }
  }
};

// Helper function for terms without detailed content
function generateSimpleContent(termId, pos) {
  const zone = getZone(pos);
  const meta = TERM_META[termId];
  
  return {
    term: `<strong>${meta.name}</strong> at ${zone.label.toLowerCase()} position.`,
    bench: 'Standard market terms apply.',
    impact: zone.priority === 'info' ? 'FAVORABLE' : zone.priority === 'neutral' ? 'AT MARKET' : zone.priority === 'moderate' ? 'ATTENTION' : 'CRITICAL',
    impactsub: zone.priority === 'info' ? 'Strong position' : zone.priority === 'neutral' ? 'Standard terms' : zone.priority === 'moderate' ? 'Negotiate improvements' : 'Must renegotiate',
    rec: zone.priority === 'critical' ? 'Renegotiate before signing.' : zone.priority === 'moderate' ? 'Push for improvements.' : 'Position acceptable.',
    reclabel: zone.priority === 'critical' ? 'Priority — Push' : zone.priority === 'moderate' ? 'Priority — Improve' : 'Outcome — Acceptable'
  };
}

// Export for use in app.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { DEAL, ZONES, getZone, SCORECARD_GROUPS, TERM_META, CONTENT, generateSimpleContent };
}
