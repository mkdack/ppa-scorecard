// ═══════════════════════════════════════════════════════════════
// PPA DEAL SCORECARD - CONTENT DEFINITIONS
// ═══════════════════════════════════════════════════════════════

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

const ZONES = [
  {min:0,  max:25,  label:'BUYER-FAVORABLE',  badgeClass:'b-good',     badgeText:'● BUYER-FAVORABLE', indClass:'ind-good',     impClass:'ib-good',     priority:'info'},
  {min:25, max:50,  label:'AT MARKET',         badgeClass:'b-neutral',  badgeText:'AT MARKET',         indClass:'ind-neutral',  impClass:'ib-neutral',  priority:'neutral'},
  {min:50, max:75,  label:'SELLER-FAVORABLE',  badgeClass:'b-moderate', badgeText:'● MODERATE',        indClass:'ind-moderate', impClass:'ib-moderate', priority:'moderate'},
  {min:75, max:100, label:'RED FLAG',           badgeClass:'b-critical', badgeText:'● CRITICAL',        indClass:'ind-critical', impClass:'ib-critical', priority:'critical'}
];

function getZone(p) { return ZONES.find(z => p >= z.min && p < z.max) || ZONES[3]; }

// ═══════════════════════════════════════════════════════════════
// SCORECARD GROUPS AND TERMS
// ═══════════════════════════════════════════════════════════════

const SCORECARD_GROUPS = [
  { id: 'pricing', title: 'Pricing & Settlement',       terms: ['strike', 'floating', 'interval', 'negprice', 'invoice', 'basis', 'marketdisrupt'] },
  { id: 'shape',   title: 'Shape & Curtailment',        terms: ['curtailment'] },
  { id: 'dev',     title: 'Project Development',        terms: ['ia', 'cp', 'delay', 'avail', 'permit', 'cod'] },
  { id: 'credit',  title: 'Credit & Collateral',        terms: ['buyerpa', 'sellerpa'] },
  { id: 'contract',title: 'Contract Terms',             terms: ['assign', 'fm', 'eod', 'eterm', 'changeinlaw', 'reputation'] },
  { id: 'recs',    title: 'RECs & Facility Attributes', terms: ['product', 'recs', 'incentives'] },
  { id: 'legal',   title: 'Legal & Administrative',     terms: ['govlaw', 'conf', 'excl', 'expenses', 'acct', 'publicity'] }
];

const TERM_META = {
  strike:       { name: 'Strike Price',                    category: 'Pricing',                  icon: '💰', defaultPos: 0, group: 'pricing',  flexibility: 'flexible' },
  floating:     { name: 'Floating Price & Settlement Formula', category: 'Settlement Mechanics',  icon: '📐', defaultPos: 0, group: 'pricing',  flexibility: 'flexible' },
  interval:     { name: 'Calculation Interval',            category: 'Settlement Mechanics',      icon: '⏲',  defaultPos: 0, group: 'pricing',  flexibility: 'flexible' },
  negprice:     { name: 'Minimum Floating Price',          category: 'Negative Price Protection', icon: '🛡',  defaultPos: 0, group: 'pricing',  flexibility: 'flexible' },
  invoice:      { name: 'Invoicing & Payment Terms',       category: 'Settlement Period',         icon: '🧾', defaultPos: 0, group: 'pricing',  flexibility: 'flexible' },
  basis:        { name: 'Basis Risk',                      category: 'Settlement Point',          icon: '📍', defaultPos: 0, group: 'pricing',  flexibility: 'inflexible' },
  curtailment:  { name: 'Economic Curtailment',            category: 'Shape & Curtailment',       icon: '⚡', defaultPos: 0, group: 'shape',    flexibility: 'flexible' },
  ia:           { name: 'Interconnection Status',          category: 'Development Risk',          icon: '🔌', defaultPos: 0, group: 'dev',      flexibility: 'flexible' },
  cp:           { name: 'Seller Conditions Precedent',     category: 'Development Risk',          icon: '📋', defaultPos: 0, group: 'dev',      flexibility: 'flexible' },
  delay:        { name: 'Delay & Shortfall Damages',       category: 'COD Risk',                  icon: '📅', defaultPos: 0, group: 'dev',      flexibility: 'inflexible' },
  avail:        { name: 'Availability Guarantee',          category: 'Project Performance',       icon: '📊', defaultPos: 0, group: 'dev',      flexibility: 'flexible' },
  permit:       { name: 'New Permitting Requirements',     category: 'Development Risk',          icon: '📜', defaultPos: 0, group: 'dev',      flexibility: 'inflexible' },
  buyerpa:      { name: 'Buyer Performance Assurance',     category: 'Credit',                    icon: '🏛',  defaultPos: 0, group: 'credit',   flexibility: 'inflexible' },
  sellerpa:     { name: 'Seller Performance Assurance',    category: 'Credit',                    icon: '🏦', defaultPos: 0, group: 'credit',   flexibility: 'flexible' },
  assign:       { name: 'Seller Assignment',               category: 'Assignment',                icon: '🔄', defaultPos: 0, group: 'contract', flexibility: 'flexible' },
  fm:           { name: 'Force Majeure',                   category: 'Force Majeure',             icon: '🌪',  defaultPos: 0, group: 'contract', flexibility: 'flexible' },
  eod:          { name: 'Events of Default',               category: 'Default & Remedies',        icon: '⚖️', defaultPos: 0, group: 'contract', flexibility: 'inflexible' },
  eterm:        { name: 'Early Termination Rights',        category: 'Termination',               icon: '🚪', defaultPos: 0, group: 'contract', flexibility: 'flexible' },
  product:      { name: 'Product & Facility Attributes',   category: 'REC Delivery',              icon: '📦', defaultPos: 0, group: 'recs',     flexibility: 'flexible' },
  recs:         { name: 'REC Delivery & Replacement',      category: 'REC Delivery',              icon: '🌿', defaultPos: 0, group: 'recs',     flexibility: 'inflexible' },
  govlaw:       { name: 'Governing Law',                   category: 'Legal',                     icon: '⚖️', defaultPos: 0, group: 'legal',    flexibility: 'flexible' },
  conf:         { name: 'Confidentiality',                 category: 'Legal',                     icon: '🔒', defaultPos: 0, group: 'legal',    flexibility: 'inflexible' },
  excl:         { name: 'Exclusivity',                     category: 'Legal',                     icon: '🤝', defaultPos: 0, group: 'legal',    flexibility: 'flexible' },
  expenses:     { name: 'Expenses & Cost Allocation',      category: 'Legal',                     icon: '💼', defaultPos: 0, group: 'legal',    flexibility: 'flexible' },
  acct:         { name: 'Accounting Treatment',            category: 'ASC 815',                   icon: '📈', defaultPos: 0, group: 'legal',    flexibility: 'flexible' },
  marketdisrupt:{ name: 'Market Disruption',               category: 'Risk Management',           icon: '📉', defaultPos: 0, group: 'pricing',  flexibility: 'flexible' },
  cod:          { name: 'Commercial Operation Date',       category: 'Development Milestone',     icon: '🎯', defaultPos: 0, group: 'dev',      flexibility: 'inflexible' },
  changeinlaw:  { name: 'Change in Law',                   category: 'Risk Management',           icon: '📜', defaultPos: 0, group: 'contract', flexibility: 'inflexible' },
  reputation:   { name: 'Reputational Disclosures',        category: 'ESG & Reputation',          icon: '🌟', defaultPos: 0, group: 'contract', flexibility: 'inflexible' },
  incentives:   { name: 'Incentives & Facility Attributes',category: 'Additional Revenue',        icon: '💎', defaultPos: 0, group: 'recs',     flexibility: 'flexible' },
  publicity:    { name: 'Publicity Rights',                category: 'Legal',                     icon: '📢', defaultPos: 0, group: 'legal',    flexibility: 'inflexible' }
};

// ═══════════════════════════════════════════════════════════════
// DYNAMIC CONTENT GENERATORS
// ═══════════════════════════════════════════════════════════════

const CONTENT = {

  // ─── PRICING & SETTLEMENT ───────────────────────────────────

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
      const annualMWh = 100000;
      let positionLabel = '', annualSavings = '';
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
        rec: zone.priority === 'critical' ? `Significantly overpaying. Target $${marketMid.toFixed(0)}/MWh or below. Consider walking away.` : zone.priority === 'moderate' ? `Push to $${(marketMid + 5).toFixed(0)}/MWh range. Use competing bids as leverage.` : 'Pricing within acceptable range. Lock in.',
        reclabel: zone.priority === 'critical' ? 'Strategy — Renegotiate' : zone.priority === 'moderate' ? 'Strategy — Push Down' : 'Strategy — Acceptable'
      };
    }
  },

  floating: {
    getContent(p) {
      const key = p <= 25 ? 'buyer' : p <= 50 ? 'market' : p <= 75 ? 'seller' : 'red';
      const iso = DEAL.iso || 'ERCOT';
      return {
        term: key === 'buyer' ? `<strong>Fixed-for-floating swap at ${iso} Hub Real-Time LMP.</strong> Hourly settlement, formula fully defined with no seller discretion.` :
              key === 'market' ? `<strong>Fixed-for-floating swap at ${iso} Hub Real-Time LMP.</strong> Standard formula, monthly settlement.` :
              key === 'seller' ? `<strong>Settlement formula contains discretionary adjustments.</strong> Seller may elect between node and hub pricing in certain intervals.` :
              `<strong>Floating price definition incomplete or absent.</strong> Settlement methodology not specified — creates material financial exposure.`,
        bench: `Standard: ${iso} Hub Real-Time LMP, hourly calculation interval, monthly settlement. No seller election rights.`,
        impact: key === 'buyer' ? 'TRANSPARENT' : key === 'market' ? 'STANDARD' : key === 'seller' ? 'OPAQUE' : 'UNDEFINED',
        impactsub: key === 'buyer' ? 'Fully defined formula<br>no seller discretion' : key === 'market' ? 'Hub LMP, monthly settle' : key === 'seller' ? 'Seller election rights<br>creates cherry-picking risk' : 'No formula specified<br>financial exposure unknown',
        rec: key === 'red' ? 'Reject. Define explicit Hub LMP formula. No seller election rights on settlement point.' : key === 'seller' ? 'Remove seller election rights. Fix settlement point at hub.' : 'Settlement formula acceptable.',
        reclabel: key === 'red' ? 'Priority 1 — Define Formula' : key === 'seller' ? 'Priority — Remove Election' : 'Outcome — Acceptable'
      };
    }
  },

  interval: {
    getContent(p) {
      const key = p <= 25 ? 'buyer' : p <= 50 ? 'market' : p <= 75 ? 'seller' : 'red';
      const iso = DEAL.iso || 'ERCOT';
      return {
        term: key === 'buyer' ? `<strong>15-minute or hourly calculation interval</strong> aligned to ${iso} real-time market dispatch intervals. Maximum granularity.` :
              key === 'market' ? `<strong>Hourly calculation interval</strong> aligned to ${iso} real-time market. Market standard.` :
              `<strong>Daily or monthly calculation interval.</strong> Aggregation masks intra-day price volatility and inflates seller-favorable settlement outcomes.`,
        bench: `Standard: Hourly or 15-minute intervals matching ${iso} real-time settlement. Monthly averaging is seller-favorable and non-standard.`,
        impact: key === 'buyer' ? 'GRANULAR' : key === 'market' ? 'HOURLY' : 'AGGREGATED',
        impactsub: key === 'buyer' ? '15-min / hourly intervals<br>maximum accuracy' : key === 'market' ? 'Hourly, market standard' : 'Daily/monthly aggregation<br>hides unfavorable hours',
        rec: key === 'red' ? 'Require hourly or 15-minute settlement intervals. Monthly averaging systematically benefits seller.' : key === 'seller' ? 'Push for hourly intervals. Daily aggregation disadvantages buyer in high-volatility markets.' : 'Calculation interval acceptable.',
        reclabel: key === 'red' ? 'Priority — Fix Interval' : key === 'seller' ? 'Priority — Improve' : 'Outcome — Acceptable'
      };
    }
  },

  negprice: {
    getContent(p) {
      const key = p <= 25 ? 'buyer' : p <= 50 ? 'market' : p <= 75 ? 'seller' : 'red';
      const iso = DEAL.iso || 'ERCOT';
      const isERCOT = iso.toUpperCase().includes('ERCOT');
      const negPriceContext = isERCOT ? 'ERCOT experiences 300–800+ negative price hours annually. Exposure can exceed $500K/year on a 100MW deal.' : 'Negative pricing occurs in most ISO markets, particularly overnight and during high renewable output periods.';
      return {
        term: key === 'buyer' ? `<strong>Zero-dollar price floor (Option 2).</strong> Floating price floored at $0/MWh in any negative pricing hour. Buyer pays fixed price; RECs still delivered.` :
              key === 'market' ? `<strong>Economic non-settlement (Option 1).</strong> No settlement obligation when real-time price is negative. RECs not delivered in non-settlement hours.` :
              `<strong>No negative price protection.</strong> Buyer owes fixed price AND negative floating price in negative hours — double payment exposure.`,
        bench: `Standard: Zero-dollar floor or economic non-settlement clause. ${negPriceContext}`,
        impact: key === 'buyer' ? 'PROTECTED' : key === 'market' ? 'NON-SETTLE' : 'EXPOSED',
        impactsub: key === 'buyer' ? 'Zero floor, RECs preserved<br>no double payment risk' : key === 'market' ? 'No settle in neg hours<br>RECs not delivered' : `No protection<br>${isERCOT ? '~$500K+/year exposure' : 'significant cost risk'}`,
        rec: key === 'red' ? `Add zero-dollar price floor (preferred) or economic non-settlement clause. ${isERCOT ? 'ERCOT negative price exposure is material — this is non-negotiable.' : 'Negative price exposure is material.'}` : key === 'seller' ? 'Add negative price protection. Economic non-settlement is minimum acceptable.' : 'Negative price protection acceptable.',
        reclabel: key === 'red' ? 'Priority 1 — Non-Negotiable' : key === 'seller' ? 'Priority — Add Protection' : 'Outcome — Protected'
      };
    }
  },

  invoice: {
    getContent(p) {
      const key = p <= 25 ? 'buyer' : p <= 50 ? 'market' : p <= 75 ? 'seller' : 'red';
      return {
        term: key === 'buyer' ? `<strong>Seller invoices within 10 business days of month end.</strong> Buyer pays within 20 business days of receipt. Net 20 effective cycle.` :
              key === 'market' ? `<strong>Seller invoices within 15 business days of month end.</strong> Buyer pays within 30 days of invoice. Standard Net 30 cycle.` :
              key === 'seller' ? `<strong>Net 45 payment terms with late payment interest at prime + 2%.</strong> Extended cycle and punitive interest rate.` :
              `<strong>Net 60+ payment terms or no defined payment timeline.</strong> Undefined payment terms create cash flow uncertainty and dispute risk.`,
        bench: 'Standard: Seller invoices within 15 business days of month end; buyer pays Net 30 from invoice receipt. Late interest at prime + 1% or lower.',
        impact: key === 'buyer' ? 'NET 20' : key === 'market' ? 'NET 30' : key === 'seller' ? 'NET 45' : 'UNDEFINED',
        impactsub: key === 'buyer' ? 'Fast cycle, low float cost' : key === 'market' ? 'Standard 30-day terms' : key === 'seller' ? 'Extended; punitive interest' : 'No defined timeline',
        rec: key === 'red' ? 'Define payment timeline — Net 30 maximum. Cap late payment interest at prime + 1%.' : key === 'seller' ? 'Negotiate to Net 30. Reduce interest rate to prime + 1%.' : 'Payment terms acceptable.',
        reclabel: key === 'red' ? 'Priority — Define Terms' : key === 'seller' ? 'Priority — Negotiate Down' : 'Outcome — Acceptable'
      };
    }
  },

  basis: {
    getContent(p) {
      const key = p <= 25 ? 'buyer' : p <= 50 ? 'market' : p <= 75 ? 'seller' : 'red';
      const iso = DEAL.iso || 'ERCOT';
      return {
        term: key === 'buyer' ? `<strong>Settlement at ${iso} Hub (e.g., North Hub / SP15 / AEP).</strong> Seller bears full basis risk between project node and hub.` :
              key === 'market' ? `<strong>Settlement at ${iso} Hub.</strong> Hub-to-node spread managed by seller. Standard for most VPPAs.` :
              key === 'seller' ? `<strong>Settlement at project bus bar or gen-tie node.</strong> Buyer exposed to hub-to-node basis differential — can be $3–8/MWh.` :
              `<strong>Seller election between hub and node settlement depending on interval.</strong> Seller cherry-picks favorable settlement point each hour — severe buyer exposure.`,
        bench: `Standard: Hub settlement at ${iso} Hub. Node settlement transfers basis risk to buyer and is non-standard for VPPAs. Hub-to-node spread in ERCOT can average $2–5/MWh annually.`,
        impact: key === 'buyer' ? 'HUB — PROTECTED' : key === 'market' ? 'HUB STANDARD' : key === 'seller' ? 'NODE EXPOSURE' : 'CHERRY-PICK RISK',
        impactsub: key === 'buyer' ? 'Seller bears basis risk<br>hub settlement locked' : key === 'market' ? 'Hub LMP, seller bears spread' : key === 'seller' ? 'Buyer bears $2–5/MWh<br>annual basis risk' : 'Seller picks best point<br>per hour — severe exposure',
        rec: key === 'red' ? 'REJECT seller election right. Fix settlement at Hub. Node settlement is a red flag — $2–5/MWh annual drag on economics.' : key === 'seller' ? 'Push for hub settlement. Node exposure is significant on large MW deals.' : 'Hub settlement acceptable.',
        reclabel: key === 'red' ? 'Priority 1 — Fix to Hub' : key === 'seller' ? 'Priority — Push to Hub' : 'Outcome — Acceptable'
      };
    }
  },

  marketdisrupt: {
    getContent(p) {
      const key = p <= 25 ? 'buyer' : p <= 50 ? 'market' : p <= 75 ? 'seller' : 'red';
      return {
        term: key === 'buyer' ? `<strong>No market disruption provision.</strong> All settlement occurs at published ISO prices regardless of market conditions.` :
              key === 'market' ? `<strong>Narrow market disruption clause.</strong> Applies only to ISO settlement suspension lasting 3+ consecutive days. Fallback to day-ahead prices.` :
              key === 'seller' ? `<strong>Broad market disruption clause.</strong> Seller may invoke for price spikes, settlement delays, or ISO rule changes — with fallback to seller-calculated reference price.` :
              `<strong>Market disruption clause with seller-defined fallback pricing.</strong> Seller controls reference price methodology — creates significant financial exposure during volatile periods.`,
        bench: 'Standard: No market disruption clause, or narrow clause limited to multi-day ISO settlement suspension with day-ahead price fallback. Seller-controlled reference prices are non-standard.',
        impact: key === 'buyer' ? 'NO CLAUSE' : key === 'market' ? 'NARROW' : key === 'seller' ? 'BROAD' : 'SELLER-CONTROLLED',
        impactsub: key === 'buyer' ? 'ISO prices always apply<br>no disruption carve-out' : key === 'market' ? 'ISO suspension only<br>day-ahead fallback' : key === 'seller' ? 'Broad trigger rights<br>seller reference price' : 'Seller sets fallback price<br>extreme exposure',
        rec: key === 'red' ? 'Reject seller-defined reference pricing. If market disruption clause exists, fallback must be published ISO day-ahead prices only.' : key === 'seller' ? 'Narrow the trigger to multi-day ISO settlement suspension only. Remove seller-calculated fallback.' : 'Market disruption terms acceptable.',
        reclabel: key === 'red' ? 'Priority 1 — Reject' : key === 'seller' ? 'Priority — Narrow Scope' : 'Outcome — Acceptable'
      };
    }
  },

  // ─── SHAPE & CURTAILMENT ────────────────────────────────────

  curtailment: {
    getContent(p) {
      const key = p <= 25 ? 'buyer' : p <= 50 ? 'market' : p <= 75 ? 'seller' : 'red';
      return {
        term: key === 'buyer' ? `<strong>Seller-borne economic curtailment.</strong> When ISO dispatches curtailment at negative or zero prices, seller bears 100% of lost generation — buyer obligation unaffected.` :
              key === 'market' ? `<strong>50/50 shared economic curtailment.</strong> Curtailment hours split equally — buyer and seller share the revenue loss. CEBA-aligned standard.` :
              key === 'seller' ? `<strong>75% buyer-borne economic curtailment.</strong> Buyer absorbs majority of curtailment hours. Significantly above market.` :
              `<strong>100% buyer-borne economic curtailment.</strong> Buyer bears all curtailment risk — pays fixed price with no offsetting floating payment during curtailment hours.`,
        bench: 'CEBA/REBA standard: 50/50 shared or seller-borne. 100% buyer-borne is a hard red flag. In ERCOT, economic curtailment during negative price events can represent 5–15% of annual hours.',
        impact: key === 'buyer' ? 'SELLER-BORNE' : key === 'market' ? '50/50 SHARED' : key === 'seller' ? '75% BUYER' : '100% BUYER',
        impactsub: key === 'buyer' ? 'Seller absorbs all<br>curtailment exposure' : key === 'market' ? 'Risk shared equally<br>CEBA standard' : key === 'seller' ? '75% buyer-borne<br>above market' : '100% on buyer<br>do not sign',
        rec: key === 'red' ? 'REJECT. 100% buyer-borne curtailment is unacceptable market practice. Minimum: 50/50 shared. Push for seller-borne.' : key === 'seller' ? 'Negotiate to 50/50. 75% buyer-borne is significantly above market.' : 'Curtailment allocation acceptable.',
        reclabel: key === 'red' ? 'Priority 1 — Reject' : key === 'seller' ? 'Priority — Negotiate to 50/50' : 'Outcome — Acceptable'
      };
    }
  },

  // ─── PROJECT DEVELOPMENT ────────────────────────────────────

  ia: {
    getContent(p) {
      const key = p <= 25 ? 'buyer' : p <= 50 ? 'market' : p <= 75 ? 'seller' : 'red';
      return {
        term: key === 'buyer' ? `<strong>Executed Interconnection Agreement (IA) in place</strong> as a condition precedent to VPPA effectiveness. Project has cleared interconnection queue.` :
              key === 'market' ? `<strong>IA required as condition precedent</strong> within defined cure period (typically Q3–Q4 of signing year), with buyer termination right if not satisfied.` :
              key === 'seller' ? `<strong>No IA condition precedent.</strong> Project has active queue position but no executed IA — COD timeline is speculative. Average interconnection queue delays: 2–4 years.` :
              `<strong>No IA and no queue position disclosed.</strong> Project is pre-queue — extreme COD uncertainty. Developer is selling capacity it does not yet have the right to interconnect.`,
        bench: 'Standard: Executed IA as CP, or IA CP with buyer termination right if not satisfied within 90–180 days. Projects without executed IAs carry 2–4 year COD risk.',
        impact: key === 'buyer' ? 'IA EXECUTED' : key === 'market' ? 'IA AS CP' : key === 'seller' ? 'QUEUE ONLY' : 'PRE-QUEUE',
        impactsub: key === 'buyer' ? 'Interconnection secured<br>COD timeline reliable' : key === 'market' ? 'IA CP with exit right<br>managed risk' : key === 'seller' ? '2–4yr queue risk<br>COD highly uncertain' : 'No queue position<br>extreme COD risk',
        rec: key === 'red' ? 'REJECT or require minimum queue position disclosure + aggressive delay damages. Pre-queue projects should not be signed without significant financial protections.' : key === 'seller' ? 'Add IA as condition precedent with 180-day cure period and buyer termination right.' : 'Interconnection protection acceptable.',
        reclabel: key === 'red' ? 'Priority 1 — Reject / Protect' : key === 'seller' ? 'Priority — Add IA CP' : 'Outcome — Acceptable'
      };
    }
  },

  cp: {
    getContent(p) {
      const key = p <= 25 ? 'buyer' : p <= 50 ? 'market' : p <= 75 ? 'seller' : 'red';
      return {
        term: key === 'buyer' ? `<strong>Executed IA + all major permits + offtake coverage for remaining capacity</strong> as conditions precedent. Hard deadlines with buyer termination right.` :
              key === 'market' ? `<strong>Executed IA + major permits</strong> as conditions precedent, with defined outside dates and mutual termination rights.` :
              key === 'seller' ? `<strong>CPs limited to IA only.</strong> No permitting CP, no outside date for offtake coverage — seller can delay indefinitely without consequence.` :
              `<strong>No meaningful conditions precedent.</strong> VPPA becomes binding on signature regardless of project development status. Buyer has no exit if seller fails to develop.`,
        bench: 'Standard: Executed IA + major permits as CPs with outside dates (typically 12–18 months). No CPs means buyer is locked in even if the project never breaks ground.',
        impact: key === 'buyer' ? 'FULLY PROTECTED' : key === 'market' ? 'STANDARD CPs' : key === 'seller' ? 'LIMITED CPs' : 'NO CPs',
        impactsub: key === 'buyer' ? 'IA + permits + offtake<br>hard deadlines' : key === 'market' ? 'IA + permits<br>with outside dates' : key === 'seller' ? 'IA only, no outside date<br>seller can drag' : 'Binding on signature<br>no exit rights',
        rec: key === 'red' ? 'REJECT or add minimum CPs: executed IA with outside date + buyer termination right. A VPPA with no CPs is a blank check to a developer.' : key === 'seller' ? 'Add permitting CP with outside date. Seller should not be able to delay indefinitely without consequence.' : 'Conditions precedent acceptable.',
        reclabel: key === 'red' ? 'Priority 1 — Add CPs' : key === 'seller' ? 'Priority — Add Permit CP' : 'Outcome — Acceptable'
      };
    }
  },

  delay: {
    getContent(p) {
      const key = p <= 25 ? 'buyer' : p <= 50 ? 'market' : p <= 75 ? 'seller' : 'red';
      return {
        term: key === 'buyer' ? `<strong>$250/MW/day Delay Damages</strong> from TCOD + Shortfall Damages of $100K/MW for any uninstalled capacity at COD. Early termination right after OCOD.` :
              key === 'market' ? `<strong>$150–200/MW/day Delay Damages</strong> from TCOD + standard Shortfall Damages. Buyer termination right after OCOD (typically TCOD + 180 days).` :
              key === 'seller' ? `<strong>Delay Damages below $100/MW/day</strong> or capped at a low aggregate amount. Shortfall damages absent or minimal.` :
              `<strong>No Delay Damages defined.</strong> Seller faces no financial consequence for missing COD — buyer has no incentive mechanism to enforce timeline.`,
        bench: 'Standard: $150–250/MW/day Delay Damages from TCOD. Shortfall Damages of $50–100K/MW. Aggregate cap at $50K/MWac. OCOD = TCOD + 180 days with buyer termination right.',
        impact: key === 'buyer' ? '$250/MW/DAY' : key === 'market' ? '$150–200/MW/DAY' : key === 'seller' ? 'BELOW MARKET' : '$0 — NO REMEDY',
        impactsub: key === 'buyer' ? 'Full remedy suite<br>strong COD incentive' : key === 'market' ? 'Market-standard damages<br>OCOD exit right' : key === 'seller' ? 'Weak incentive<br>seller may delay freely' : 'No financial consequence<br>seller can delay indefinitely',
        rec: key === 'red' ? 'Add $250/MW/day Delay Damages, Shortfall Damages of $100K/MW, and buyer termination right at OCOD. Without these, COD dates are aspirational.' : key === 'seller' ? 'Increase Delay Damages to minimum $150/MW/day. Add OCOD termination right.' : 'Delay damages acceptable.',
        reclabel: key === 'red' ? 'Priority 1 — Add Damages' : key === 'seller' ? 'Priority — Increase Rate' : 'Outcome — Acceptable'
      };
    }
  },

  avail: {
    getContent(p) {
      const key = p <= 25 ? 'buyer' : p <= 50 ? 'market' : p <= 75 ? 'seller' : 'red';
      const tech = DEAL.tech || 'Solar';
      const isWind = tech.toLowerCase().includes('wind');
      const target = isWind ? '92–95%' : '97–98%';
      const standard = isWind ? '90–92%' : '94–96%';
      const weak = isWind ? 'below 88%' : 'below 92%';
      return {
        term: key === 'buyer' ? `<strong>${isWind ? '92%' : '97%'} mechanical availability guarantee</strong> measured on rolling 2-year basis. Meaningful liquidated damages for shortfall. Default trigger at ${isWind ? '70%' : '80%'}.` :
              key === 'market' ? `<strong>${isWind ? '90%' : '94%'} availability guarantee</strong> in Year 1, stepping up in subsequent measurement periods. Standard LD structure.` :
              key === 'seller' ? `<strong>Availability guarantee ${weak}</strong> or guarantee exists but LD payment is nominal (below $10K/MWac).` :
              `<strong>No availability guarantee.</strong> Seller has no obligation to maintain project uptime. Underperformance risk is entirely on buyer.`,
        bench: `Standard: ${tech} availability ${standard} with 2-year rolling measurement. LDs at ~$20–30K/MWac per point below guarantee. Default at ${isWind ? '70%' : '80%'}.`,
        impact: key === 'buyer' ? 'STRONG GUARANTEE' : key === 'market' ? 'STANDARD' : key === 'seller' ? 'WEAK GUARANTEE' : 'NO GUARANTEE',
        impactsub: key === 'buyer' ? `${isWind ? '92%' : '97%'} guaranteed<br>meaningful LDs` : key === 'market' ? `${isWind ? '90%' : '94%'} Year 1<br>standard LDs` : key === 'seller' ? 'Below-standard threshold<br>or nominal LDs' : 'No performance obligation<br>all risk on buyer',
        rec: key === 'red' ? `Add ${isWind ? '90%' : '94%'} availability guarantee with liquidated damages of $20K+/MWac per point. No guarantee = no accountability.` : key === 'seller' ? `Increase guarantee to ${isWind ? '90%' : '94%'} minimum. Nominal LDs have no deterrent value.` : 'Availability guarantee acceptable.',
        reclabel: key === 'red' ? 'Priority 1 — Add Guarantee' : key === 'seller' ? 'Priority — Strengthen' : 'Outcome — Acceptable'
      };
    }
  },

  permit: {
    getContent(p) {
      const key = p <= 25 ? 'buyer' : p <= 50 ? 'market' : p <= 75 ? 'seller' : 'red';
      return {
        term: key === 'buyer' ? `<strong>New permitting requirements are not a force majeure event.</strong> Seller bears full permitting risk; no renegotiation rights triggered by regulatory changes.` :
              key === 'market' ? `<strong>New permitting requirements trigger good-faith renegotiation only.</strong> 30-day negotiation window; if unresolved, either party may terminate without damages.` :
              key === 'seller' ? `<strong>New permitting requirements allow seller to suspend performance</strong> and trigger mandatory price renegotiation — buyer must accept new economics or release seller.` :
              `<strong>New permitting requirements grant seller unilateral termination right</strong> with return of all performance assurance and no liability. Buyer has no recourse.`,
        bench: 'Standard: New permitting requirements trigger 30-day good-faith renegotiation with mutual termination right if unresolved. Unilateral seller termination with no damages is non-standard and buyer-adverse.',
        impact: key === 'buyer' ? 'SELLER BEARS RISK' : key === 'market' ? 'MUTUAL RENEGOTIATION' : key === 'seller' ? 'SELLER SUSPENSION RIGHT' : 'SELLER TERMINATION RIGHT',
        impactsub: key === 'buyer' ? 'Seller absorbs all<br>regulatory risk' : key === 'market' ? '30-day renegotiation<br>mutual exit if unresolved' : key === 'seller' ? 'Seller can suspend + force<br>price renegotiation' : 'Seller can walk with no<br>liability to buyer',
        rec: key === 'red' ? 'Reject unilateral seller termination. Any permitting provision must include mutual exit rights and seller return of performance assurance without offset.' : key === 'seller' ? 'Remove seller suspension right. Permitting risk should not allow seller to hold buyer hostage to price renegotiation.' : 'Permitting provision acceptable.',
        reclabel: key === 'red' ? 'Priority — Reject' : key === 'seller' ? 'Priority — Remove Suspension' : 'Outcome — Acceptable'
      };
    }
  },

  cod: {
    getContent(p) {
      const key = p <= 25 ? 'buyer' : p <= 50 ? 'market' : p <= 75 ? 'seller' : 'red';
      return {
        term: key === 'buyer' ? `<strong>Guaranteed COD with hard outside date (OCOD).</strong> TCOD defined, OCOD = TCOD + 180 days. Independent engineer certification required for COD declaration.` :
              key === 'market' ? `<strong>Target COD defined with OCOD = TCOD + 180 days.</strong> Standard COD conditions including 90%+ capacity commissioned and IE certification.` :
              key === 'seller' ? `<strong>COD conditions are loosely defined or OCOD is beyond TCOD + 12 months.</strong> Seller has excessive runway before buyer exit right triggers.` :
              `<strong>No defined OCOD or no buyer termination right after OCOD.</strong> Buyer has no contractual mechanism to exit if COD is never achieved.`,
        bench: 'Standard: TCOD defined; OCOD = TCOD + 180 days; buyer termination right at OCOD. COD conditions: 90%+ of buyer capacity commissioned + IE certification + delivery to interconnection point.',
        impact: key === 'buyer' ? 'HARD DATES + IE CERT' : key === 'market' ? 'STANDARD COD TERMS' : key === 'seller' ? 'LOOSE TIMELINE' : 'NO EXIT RIGHT',
        impactsub: key === 'buyer' ? 'Guaranteed timeline<br>IE cert required' : key === 'market' ? 'TCOD + 180-day OCOD<br>buyer exit right' : key === 'seller' ? 'OCOD > 12 months out<br>weak buyer protection' : 'No OCOD defined<br>buyer trapped indefinitely',
        rec: key === 'red' ? 'Define OCOD = TCOD + 180 days with automatic buyer termination right. Without an OCOD exit right, buyer can be trapped in a perpetually pre-COD contract.' : key === 'seller' ? 'Tighten OCOD to TCOD + 180 days. Add independent engineer certification requirement.' : 'COD provisions acceptable.',
        reclabel: key === 'red' ? 'Priority 1 — Define OCOD' : key === 'seller' ? 'Priority — Tighten Timeline' : 'Outcome — Acceptable'
      };
    }
  },

  // ─── CREDIT & COLLATERAL ────────────────────────────────────

  sellerpa: {
    getContent(p) {
      const key = p <= 25 ? 'buyer' : p <= 50 ? 'market' : p <= 75 ? 'seller' : 'red';
      return {
        term: key === 'buyer' ? `<strong>Seller posts Letter of Credit from Qualified Institution.</strong> Development Security: $100K/MWac pre-COD. Operational Security: $75K/MWac post-COD. Replenishment within 5 business days.` :
              key === 'market' ? `<strong>Seller posts LC or Investment-Grade Parent Guarantee.</strong> Development Security: $75K/MWac. Operational Security: $50K/MWac. Standard replenishment terms.` :
              key === 'seller' ? `<strong>Seller performance assurance below market.</strong> LC amount under $50K/MWac, or guarantee from non-rated entity, or no replenishment obligation.` :
              `<strong>No seller performance assurance.</strong> Buyer has no financial security against seller default, project abandonment, or failure to achieve COD.`,
        bench: 'Standard: Development Security $75–100K/MWac (LC or IG guarantee); Operational Security $50–75K/MWac. LC from bank rated A- or better. Replenishment within 5–7 business days of draw.',
        impact: key === 'buyer' ? 'STRONG — $100K/MWAC LC' : key === 'market' ? 'STANDARD — $75K/MWAC' : key === 'seller' ? 'BELOW MARKET' : 'NO SECURITY',
        impactsub: key === 'buyer' ? 'LC from qualified bank<br>5-day replenishment' : key === 'market' ? 'LC or IG guarantee<br>standard amounts' : key === 'seller' ? 'Insufficient security<br>counterparty risk elevated' : 'Zero protection against<br>seller default / abandonment',
        rec: key === 'red' ? 'Add Development Security of $75K/MWac minimum via LC from A-rated institution. No seller PA is unacceptable on a 12–20 year commitment.' : key === 'seller' ? 'Increase to $75K/MWac minimum. Require replenishment obligation on draws.' : 'Seller performance assurance acceptable.',
        reclabel: key === 'red' ? 'Priority 1 — Add Security' : key === 'seller' ? 'Priority — Increase Amount' : 'Outcome — Protected'
      };
    }
  },

  buyerpa: {
    getContent(p) {
      const key = p <= 25 ? 'buyer' : p <= 50 ? 'market' : p <= 75 ? 'seller' : 'red';
      return {
        term: key === 'buyer' ? `<strong>Parent Guarantee only — no LC required.</strong> Buyer must maintain BBB/Baa2 or better. Guarantee from rated parent entity. No cash collateral obligation.` :
              key === 'market' ? `<strong>Parent Guarantee or Letter of Credit.</strong> Buyer's choice of form. LC at $150K/MWac or Parent Guarantee at $175K/MWac if IG-rated.` :
              key === 'seller' ? `<strong>LC required regardless of buyer credit rating.</strong> $150–200K/MWac with no alternative. Significant working capital burden.` :
              `<strong>LC required at $200K+ /MWac with no guarantee alternative and short replenishment window (under 5 business days).</strong> Punitive and disproportionate.`,
        bench: 'Standard: IG-rated buyers may provide Parent Guarantee. Non-IG buyers post LC at $150K/MWac. Guarantee amount $175K/MWac. Replenishment within 7 business days.',
        impact: key === 'buyer' ? 'PARENT GUARANTEE ONLY' : key === 'market' ? 'BUYER CHOICE' : key === 'seller' ? 'LC REQUIRED' : 'PUNITIVE',
        impactsub: key === 'buyer' ? 'No cash tied up<br>no LC burden' : key === 'market' ? 'Parent or LC<br>buyer selects form' : key === 'seller' ? 'Cash/LC required<br>working capital impact' : 'Excessive amounts<br>short replenishment window',
        rec: key === 'red' ? 'Negotiate to Parent Guarantee option for IG-rated buyers. LC amounts above $175K/MWac and replenishment windows under 5 days are punitive.' : key === 'seller' ? 'Push for Parent Guarantee option. IG-rated corporates should not be required to post LC.' : 'Buyer credit support acceptable.',
        reclabel: key === 'red' ? 'Priority — Negotiate Down' : key === 'seller' ? 'Priority — Add Guarantee Option' : 'Outcome — Acceptable'
      };
    }
  },

  // ─── CONTRACT TERMS ─────────────────────────────────────────

  assign: {
    getContent(p) {
      const key = p <= 25 ? 'buyer' : p <= 50 ? 'market' : p <= 75 ? 'seller' : 'red';
      return {
        term: key === 'buyer' ? `<strong>Buyer consent required for any assignment to unaffiliated third party.</strong> Consent not to be unreasonably withheld. Affiliate assignments permitted without consent.` :
              key === 'market' ? `<strong>Seller may assign to affiliates without consent.</strong> Unaffiliated third-party assignment requires buyer consent — standard VPPA protection.` :
              key === 'seller' ? `<strong>Seller may assign to any creditworthy counterparty without buyer consent.</strong> Creditworthiness defined solely by seller. Buyer cannot object to assignee.` :
              `<strong>Seller may assign freely without consent or creditworthiness requirement.</strong> Buyer could end up facing an uncreditworthy counterparty with no recourse.`,
        bench: "Standard: Affiliate assignments permitted without consent. Unaffiliated assignments require buyer consent (not unreasonably withheld). Assignee must meet seller's original credit requirements.",
        impact: key === 'buyer' ? 'CONSENT PROTECTED' : key === 'market' ? 'STANDARD CONSENT' : key === 'seller' ? 'CREDITWORTHY ONLY' : 'UNRESTRICTED',
        impactsub: key === 'buyer' ? 'Consent required<br>for unaffiliated assigns' : key === 'market' ? 'Affiliates ok<br>3rd party needs consent' : key === 'seller' ? 'No consent but must be<br>creditworthy per seller' : 'Free assignment<br>buyer has no say',
        rec: key === 'red' ? 'Add buyer consent right for unaffiliated assignments. Unrestricted assignment means buyer could end up with a shell company as counterparty.' : key === 'seller' ? 'Require buyer consent for unaffiliated assignments. Seller-defined creditworthiness is insufficient protection.' : 'Assignment terms acceptable.',
        reclabel: key === 'red' ? 'Priority — Add Consent Right' : key === 'seller' ? 'Priority — Add Consent' : 'Outcome — Acceptable'
      };
    }
  },

  fm: {
    getContent(p) {
      const key = p <= 25 ? 'buyer' : p <= 50 ? 'market' : p <= 75 ? 'seller' : 'red';
      return {
        term: key === 'buyer' ? `<strong>Narrow FM definition — 6-month cap.</strong> Excludes: interconnection delays, permitting delays, supply chain disruptions, market rule changes, pandemic. Mutual termination right after cap.` :
              key === 'market' ? `<strong>Standard FM definition — 12-month cap.</strong> Excludes COVID-19 and market disruption events. Mutual termination right after cap expires.` :
              key === 'seller' ? `<strong>Broad FM definition — 18-month cap.</strong> Includes permitting delays, supply chain disruptions, and interconnection delays as FM events. Extends seller's excuse for non-performance.` :
              `<strong>No FM cap or cap exceeds 24 months.</strong> FM definition includes market rule changes, interconnection delays, and supply chain issues — effectively allows seller to delay indefinitely.`,
        bench: 'CEBA standard: 12-month FM cap. Excludes: market rule changes, interconnection delays, permitting delays, supply chain disruptions, COVID-19 recurrence. Mutual termination after cap.',
        impact: key === 'buyer' ? 'NARROW — 6 MONTH CAP' : key === 'market' ? 'STANDARD — 12 MONTH' : key === 'seller' ? 'BROAD — 18 MONTH' : 'UNCAPPED / BROAD',
        impactsub: key === 'buyer' ? '6-month limit<br>excludes dev delays' : key === 'market' ? '12-month cap<br>excludes COVID' : key === 'seller' ? '18-month cap<br>covers dev risk events' : 'No meaningful limit<br>seller can delay forever',
        rec: key === 'red' ? 'Add 12-month FM cap minimum. Explicitly exclude: interconnection delays, permitting, supply chain, market rule changes. These are developer risks, not acts of God.' : key === 'seller' ? 'Narrow FM to exclude interconnection delays and permitting. These are developer execution risks that seller should bear.' : 'FM terms acceptable.',
        reclabel: key === 'red' ? 'Priority 1 — Narrow FM' : key === 'seller' ? 'Priority — Tighten Exclusions' : 'Outcome — Acceptable'
      };
    }
  },

  eod: {
    getContent(p) {
      const key = p <= 25 ? 'buyer' : p <= 50 ? 'market' : p <= 75 ? 'seller' : 'red';
      return {
        term: key === 'buyer' ? `<strong>Symmetric Events of Default with equal cure periods.</strong> Failure to pay (3-day cure), material breach (30-day cure), bankruptcy (no cure), failure to maintain PA (5-day cure). Mark-to-market closeout on default.` :
              key === 'market' ? `<strong>Mutual Events of Default with standard cure periods.</strong> Payment default: 3 days. Material breach: 30 days. Bankruptcy: immediately. Standard for ISDA-based contracts.` :
              key === 'seller' ? `<strong>Asymmetric Events of Default favoring seller.</strong> Buyer has shorter cure periods or broader default triggers than seller. Buyer faces higher default risk than seller.` :
              `<strong>Buyer-only Events of Default defined, with seller defaults narrowly scoped or absent.</strong> Creates one-sided termination exposure — seller can breach without triggering default.`,
        bench: 'Standard: Mutual symmetric EODs. Payment: 3-day cure. Material breach: 30-day cure + 60-day extended cure if being diligently remedied. Bankruptcy: immediate. Equal treatment of both parties.',
        impact: key === 'buyer' ? 'SYMMETRIC' : key === 'market' ? 'MUTUAL STANDARD' : key === 'seller' ? 'ASYMMETRIC' : 'BUYER-ONLY EODs',
        impactsub: key === 'buyer' ? 'Equal cure periods<br>MTM closeout on default' : key === 'market' ? 'Mutual, standard cure<br>bankruptcy immediate' : key === 'seller' ? 'Buyer has shorter cure<br>asymmetric exposure' : 'Seller has narrow EODs<br>buyer overexposed',
        rec: key === 'red' ? 'Require symmetric EODs. Equal cure periods for buyer and seller. Seller-only or asymmetric EODs are non-standard and create one-sided termination risk.' : key === 'seller' ? 'Equalize cure periods. Buyer cure period should not be shorter than seller cure period for equivalent defaults.' : 'Events of Default acceptable.',
        reclabel: key === 'red' ? 'Priority — Require Symmetry' : key === 'seller' ? 'Priority — Equalize Cure' : 'Outcome — Acceptable'
      };
    }
  },

  eterm: {
    getContent(p) {
      const key = p <= 25 ? 'buyer' : p <= 50 ? 'market' : p <= 75 ? 'seller' : 'red';
      return {
        term: key === 'buyer' ? `<strong>Mark-to-market closeout in both directions.</strong> Defaulting party pays MTM value to non-defaulting party. Buyer has termination right post-OCOD with full damage recovery.` :
              key === 'market' ? `<strong>MTM closeout applicable to both parties on early termination.</strong> Standard two-way payment. OCOD termination right for buyer with LD recovery.` :
              key === 'seller' ? `<strong>One-way early termination payment.</strong> Seller pays MTM only if in-the-money to buyer; buyer pays seller full MTM if out-of-the-money. Asymmetric exposure.` :
              `<strong>Early termination payments are seller-favorable or undefined.</strong> Buyer may owe termination payment even on seller default, or no MTM mechanism is defined.`,
        bench: 'Standard: Two-way MTM closeout on early termination. Non-defaulting party receives MTM value. Market convention (ISDA-based): both parties exposed symmetrically.',
        impact: key === 'buyer' ? 'TWO-WAY MTM' : key === 'market' ? 'STANDARD TWO-WAY' : key === 'seller' ? 'ONE-WAY PAYMENT' : 'SELLER-FAVORABLE',
        impactsub: key === 'buyer' ? 'MTM both directions<br>OCOD exit with LDs' : key === 'market' ? 'Two-way MTM closeout<br>symmetric exposure' : key === 'seller' ? 'Buyer pays MTM if OTM<br>asymmetric risk' : 'Unfavorable or undefined<br>termination mechanism',
        rec: key === 'red' ? 'Require two-way MTM closeout. Buyer should not owe termination payments on seller default. Define the termination payment methodology explicitly.' : key === 'seller' ? 'Fix to two-way MTM. One-way payment structures are non-standard and disadvantage buyer in out-of-the-money scenarios.' : 'Early termination terms acceptable.',
        reclabel: key === 'red' ? 'Priority — Fix to Two-Way MTM' : key === 'seller' ? 'Priority — Require Symmetry' : 'Outcome — Acceptable'
      };
    }
  },

  changeinlaw: {
    getContent(p) {
      const key = p <= 25 ? 'buyer' : p <= 50 ? 'market' : p <= 75 ? 'seller' : 'red';
      return {
        term: key === 'buyer' ? `<strong>Change in law is seller's risk.</strong> No renegotiation right or pass-through triggered by regulatory or tax law changes affecting project economics.` :
              key === 'market' ? `<strong>Change in law triggers good-faith renegotiation only.</strong> If parties cannot agree in 60 days, either may terminate without financial liability.` :
              key === 'seller' ? `<strong>Change in law allows seller to pass incremental costs to buyer</strong> through price adjustment mechanism or mandatory renegotiation with seller-favorable default.` :
              `<strong>Change in law allows unilateral seller termination with no financial liability.</strong> Seller can exit the contract whenever regulation changes unfavorably — zero accountability.`,
        bench: 'Standard: Change in law triggers mutual good-faith renegotiation with 60-day window, then mutual termination right with no damages. Seller cost pass-through is non-standard.',
        impact: key === 'buyer' ? 'SELLER BEARS RISK' : key === 'market' ? 'MUTUAL RENEGOTIATION' : key === 'seller' ? 'COST PASS-THROUGH' : 'SELLER EXIT RIGHT',
        impactsub: key === 'buyer' ? 'Seller bears regulatory risk<br>no buyer price impact' : key === 'market' ? '60-day renegotiation<br>mutual exit if unresolved' : key === 'seller' ? 'Seller passes costs to buyer<br>price not fixed' : 'Seller can exit freely<br>buyer has no remedy',
        rec: key === 'red' ? 'Reject unilateral seller exit on change in law. Minimum: mutual termination right after good-faith renegotiation fails. Cost pass-throughs undermine fixed-price certainty.' : key === 'seller' ? 'Remove cost pass-through. Replace with mutual renegotiation + mutual termination right only.' : 'Change in law provision acceptable.',
        reclabel: key === 'red' ? 'Priority — Reject Exit Right' : key === 'seller' ? 'Priority — Remove Pass-Through' : 'Outcome — Acceptable'
      };
    }
  },

  reputation: {
    getContent(p) {
      const key = p <= 25 ? 'buyer' : p <= 50 ? 'market' : p <= 75 ? 'seller' : 'red';
      return {
        term: key === 'buyer' ? `<strong>Seller must provide ESG disclosures on request,</strong> including labor practices, supply chain sourcing, and community impact. Material misrepresentation is an Event of Default.` :
              key === 'market' ? `<strong>Standard ESG representations at signing.</strong> Seller represents no pending ESG-related litigation or regulatory action. Updates required on material change.` :
              key === 'seller' ? `<strong>No ESG disclosure requirements.</strong> Seller not obligated to disclose supply chain, labor, or community issues. Limited reputational protection for buyer.` :
              `<strong>No reputational provisions whatsoever.</strong> Buyer assumes full reputational risk associated with seller's ESG practices — no representations, no disclosure, no remedy.`,
        bench: 'Market standard: ESG representations at signing (no pending material litigation, no known supply chain violations). Fortune 500 buyers increasingly require ongoing disclosure rights for sustainability reporting.',
        impact: key === 'buyer' ? 'FULL ESG DISCLOSURE' : key === 'market' ? 'STANDARD REPS' : key === 'seller' ? 'LIMITED DISCLOSURE' : 'NO PROTECTION',
        impactsub: key === 'buyer' ? 'Ongoing disclosure rights<br>misrep = EOD' : key === 'market' ? 'Signing-date ESG reps<br>material change notice' : key === 'seller' ? 'No disclosure obligation<br>reputational exposure' : 'Zero ESG protection<br>full reputational risk',
        rec: key === 'red' ? 'Add ESG representations at signing. Require notice of material ESG events post-signing. For public companies, lack of disclosure creates sustainability reporting exposure.' : key === 'seller' ? 'Add standard ESG reps (no known violations, no pending material litigation). Ongoing disclosure on material change.' : 'Reputational provisions acceptable.',
        reclabel: key === 'red' ? 'Priority — Add ESG Reps' : key === 'seller' ? 'Priority — Add Basic Reps' : 'Outcome — Acceptable'
      };
    }
  },

  // ─── RECs & FACILITY ATTRIBUTES ─────────────────────────────

  product: {
    getContent(p) {
      const key = p <= 25 ? 'buyer' : p <= 50 ? 'market' : p <= 75 ? 'seller' : 'red';
      return {
        term: key === 'buyer' ? `<strong>Buyer's fraction of all as-generated RECs and current + future Environmental Attributes.</strong> Facility attributes (capacity, ancillaries) excluded and retained by seller.` :
              key === 'market' ? `<strong>As-generated RECs delivered monthly</strong> representing buyer's fraction of project output. Future attributes subject to good-faith negotiation.` :
              key === 'seller' ? `<strong>RECs only — no future Environmental Attributes.</strong> Seller retains all capacity benefits, ancillary services, and any new attribute classes created after signing.` :
              `<strong>Product definition limited to current RECs only.</strong> No future attributes, no capacity, no ancillaries. Seller retains all incremental value as new environmental markets develop.`,
        bench: "Standard: As-generated RECs (buyer's fraction) delivered monthly. Facility attributes (capacity, ancillaries) retained by seller — standard. Future attribute rights negotiated but buyer should seek first right of refusal.",
        impact: key === 'buyer' ? 'RECs + FUTURE ATTRS' : key === 'market' ? 'AS-GENERATED RECs' : key === 'seller' ? 'RECs ONLY' : 'MINIMAL PRODUCT',
        impactsub: key === 'buyer' ? 'Current + future attributes<br>buyer gets full value' : key === 'market' ? 'Monthly REC delivery<br>buyer fraction' : key === 'seller' ? 'No future attributes<br>seller retains upside' : 'RECs only, no future<br>rights for buyer',
        rec: key === 'red' ? 'Seek right of first refusal on future Environmental Attributes as new markets (e.g., carbon, biodiversity) develop. Seller retaining all future upside is seller-favorable.' : key === 'seller' ? 'Negotiate first right of refusal on future attributes. As clean energy markets evolve, future attribute value can be material.' : 'Product definition acceptable.',
        reclabel: key === 'red' ? 'Priority — Add ROFR' : key === 'seller' ? 'Priority — Negotiate ROFR' : 'Outcome — Acceptable'
      };
    }
  },

  recs: {
    getContent(p) {
      const key = p <= 25 ? 'buyer' : p <= 50 ? 'market' : p <= 75 ? 'seller' : 'red';
      return {
        term: key === 'buyer' ? `<strong>Green-e certified RECs with 2-year replacement obligation.</strong> If seller fails to deliver, must source replacement RECs at market cost. Tracking system registration required (ERCOT ERCOT, WREGIS, PJM-GATS).` :
              key === 'market' ? `<strong>Project RECs registered in applicable tracking system.</strong> Standard replacement obligation — seller sources equivalent RECs if delivery fails.` :
              key === 'seller' ? `<strong>RECs delivered but no replacement obligation.</strong> If seller fails to deliver (e.g., project offline), buyer has no remedy beyond generic breach claim.` :
              `<strong>No REC delivery mechanism or tracking system defined.</strong> VPPA economic settlement only — buyer receives no environmental attributes to support sustainability claims.`,
        bench: 'Standard: RECs registered in applicable tracking system (WREGIS, ERCOT, PJM-GATS). Replacement obligation if delivery fails. Green-e certification standard for Fortune 500 sustainability reporting.',
        impact: key === 'buyer' ? 'GREEN-E + REPLACEMENT' : key === 'market' ? 'STANDARD DELIVERY' : key === 'seller' ? 'NO REPLACEMENT' : 'NO REC MECHANISM',
        impactsub: key === 'buyer' ? 'Green-e certified<br>2yr replacement obligation' : key === 'market' ? 'Tracking system registered<br>standard replacement' : key === 'seller' ? 'Delivery only<br>no replacement if missed' : 'Financial settlement only<br>no environmental claim',
        rec: key === 'red' ? 'Add REC delivery mechanism with tracking system registration. Without RECs, buyer cannot make additionality or sustainability claims — negates the purpose of a VPPA.' : key === 'seller' ? 'Add replacement obligation. If seller fails to deliver RECs, buyer should receive equivalent RECs sourced at market.' : 'REC delivery terms acceptable.',
        reclabel: key === 'red' ? 'Priority 1 — Add REC Mechanism' : key === 'seller' ? 'Priority — Add Replacement' : 'Outcome — Acceptable'
      };
    }
  },

  incentives: {
    getContent(p) {
      const key = p <= 25 ? 'buyer' : p <= 50 ? 'market' : p <= 75 ? 'seller' : 'red';
      return {
        term: key === 'buyer' ? `<strong>Buyer receives share of ITC/PTC benefits and transferable tax credits</strong> via price adjustment or direct transfer. Seller must notify buyer of any material incentive changes.` :
              key === 'market' ? `<strong>Seller retains all tax incentives (ITC/PTC) and facility attributes.</strong> No buyer participation in federal incentives. Market standard for VPPAs.` :
              key === 'seller' ? `<strong>Seller retains all incentives with no obligation to notify buyer of incentive changes</strong> that could affect project viability or economics.` :
              `<strong>No incentive provisions.</strong> Seller may transfer or monetize ITCs without buyer knowledge or consent, potentially affecting project construction timeline and quality.`,
        bench: "Standard: Seller retains ITC/PTC — this is market standard and priced into the strike price. However, seller should represent that incentives are in place and notify buyer of material changes that could affect COD.",
        impact: key === 'buyer' ? 'BUYER PARTICIPATION' : key === 'market' ? 'SELLER RETAINS (STANDARD)' : key === 'seller' ? 'NO NOTIFICATION OBLIGATION' : 'NO PROVISIONS',
        impactsub: key === 'buyer' ? 'Buyer shares ITC/PTC<br>price adjustment mechanism' : key === 'market' ? 'Seller retains incentives<br>priced into strike' : key === 'seller' ? 'No notice if ITC/PTC<br>structure changes' : 'Seller may transfer<br>ITCs without notice',
        rec: key === 'red' ? 'Add representation that ITCs are in place and seller will notify buyer of material incentive changes. ITC transfer without notice can affect project construction.' : key === 'seller' ? 'Add notification obligation if incentive structure changes materially. Silent incentive transfer is a hidden project risk.' : 'Incentive provisions acceptable.',
        reclabel: key === 'red' ? 'Priority — Add Notification' : key === 'seller' ? 'Priority — Add Notice' : 'Outcome — Acceptable'
      };
    }
  },

  // ─── LEGAL & ADMINISTRATIVE ──────────────────────────────────

  govlaw: {
    getContent(p) {
      const key = p <= 25 ? 'buyer' : p <= 50 ? 'market' : p <= 75 ? 'seller' : 'red';
      return {
        term: key === 'buyer' ? `<strong>New York law governing all disputes.</strong> NY courts have deep ISDA/financial contract jurisprudence. Dispute resolution via arbitration (AAA) with 90-day expedited track.` :
              key === 'market' ? `<strong>New York governing law.</strong> Standard for energy financial contracts. NY law provides predictable, well-developed case law for VPPA disputes.` :
              key === 'seller' ? `<strong>Governing law is seller's home state jurisdiction</strong> — less developed financial contract case law, potential home-court advantage for seller.` :
              `<strong>No governing law specified</strong> or jurisdiction is non-standard (outside NY, TX, DE). Creates enforcement risk and unpredictable litigation outcome.`,
        bench: "Standard: New York governing law — the market standard for financial energy contracts. Texas law is also acceptable for ERCOT deals. Seller's home state jurisdiction (other than NY/TX/DE) is seller-favorable.",
        impact: key === 'buyer' ? 'NEW YORK + ARBITRATION' : key === 'market' ? 'NEW YORK LAW' : key === 'seller' ? "SELLER'S HOME STATE" : 'NON-STANDARD / UNDEFINED',
        impactsub: key === 'buyer' ? 'NY law + AAA arbitration<br>90-day expedited track' : key === 'market' ? 'NY law standard<br>well-developed case law' : key === 'seller' ? "Seller's home jurisdiction<br>home-court advantage" : 'No jurisdiction defined<br>enforcement risk',
        rec: key === 'red' ? 'Specify New York governing law. Undefined jurisdiction creates enforcement risk and can be exploited to delay or complicate dispute resolution.' : key === 'seller' ? "Push for New York law. Seller's home state jurisdiction may provide home-court advantage in disputes." : 'Governing law acceptable.',
        reclabel: key === 'red' ? 'Priority — Specify NY Law' : key === 'seller' ? 'Priority — Push for NY Law' : 'Outcome — Acceptable'
      };
    }
  },

  conf: {
    getContent(p) {
      const key = p <= 25 ? 'buyer' : p <= 50 ? 'market' : p <= 75 ? 'seller' : 'red';
      return {
        term: key === 'buyer' ? `<strong>3-year post-termination confidentiality.</strong> Standard exceptions for legal process, regulatory disclosure, and affiliate sharing on need-to-know basis. Pricing and terms are confidential.` :
              key === 'market' ? `<strong>Confidentiality period = term of agreement + 2 years post-termination.</strong> Standard exceptions. Pricing, volumes, and party identities are confidential.` :
              key === 'seller' ? `<strong>1-year post-termination confidentiality or broad disclosure exceptions</strong> that allow seller to share deal terms with financing parties and potential acquirers without restriction.` :
              `<strong>No meaningful confidentiality provision.</strong> Seller can disclose pricing, volumes, and buyer identity freely — competitive intelligence exposed to market.`,
        bench: 'Standard: Confidentiality coterminous with agreement + 2-year tail. Standard carve-outs: legal/regulatory disclosure, financing disclosures (under NDA), board/advisor sharing. Pricing must be protected.',
        impact: key === 'buyer' ? '3-YEAR TAIL' : key === 'market' ? 'TERM + 2 YEARS' : key === 'seller' ? 'WEAK PROTECTION' : 'NO CONFIDENTIALITY',
        impactsub: key === 'buyer' ? '3yr post-term protection<br>pricing protected' : key === 'market' ? 'Term + 2yr tail<br>standard exceptions' : key === 'seller' ? '1yr tail or broad carve-outs<br>competitive exposure' : 'No pricing protection<br>terms fully exposed',
        rec: key === 'red' ? 'Add confidentiality provision — Term + 2-year tail minimum. Exposure of pricing and buyer identity to competitors undermines future negotiating position.' : key === 'seller' ? 'Extend tail to 2 years post-termination. Narrow disclosure carve-outs — financing disclosures should require recipient NDA.' : 'Confidentiality terms acceptable.',
        reclabel: key === 'red' ? 'Priority — Add Confidentiality' : key === 'seller' ? 'Priority — Strengthen Tail' : 'Outcome — Acceptable'
      };
    }
  },

  excl: {
    getContent(p) {
      const key = p <= 25 ? 'buyer' : p <= 50 ? 'market' : p <= 75 ? 'seller' : 'red';
      return {
        term: key === 'buyer' ? `<strong>No exclusivity obligation on buyer.</strong> Buyer free to negotiate with competing developers during term sheet period. Seller committed to buyer's capacity only.` :
              key === 'market' ? `<strong>60-day mutual exclusivity</strong> with automatic 30-day extension if negotiating in good faith. Buyer cannot pursue competing projects for same capacity during period.` :
              key === 'seller' ? `<strong>90-day exclusivity period with broad scope.</strong> Buyer cannot negotiate competing VPPAs for any capacity, not just the project's nameplate. Seller can still sell remaining capacity.` :
              `<strong>Exclusivity with no defined end date or automatic renewal provisions.</strong> Buyer could be locked into exclusive negotiation indefinitely without a signed VPPA.`,
        bench: 'Standard: 60-day exclusivity, auto-extending 30 days if negotiating in good faith. Scope limited to competing projects for the same specific capacity tranche — not all VPPA activity. Mutual obligation.',
        impact: key === 'buyer' ? 'NO EXCLUSIVITY' : key === 'market' ? '60-DAY MUTUAL' : key === 'seller' ? '90-DAY BROAD SCOPE' : 'OPEN-ENDED',
        impactsub: key === 'buyer' ? 'Buyer free to negotiate<br>competing projects' : key === 'market' ? '60+30 day window<br>limited scope' : key === 'seller' ? '90-day window<br>overly broad scope' : 'No defined end date<br>buyer locked indefinitely',
        rec: key === 'red' ? 'Add termination date on exclusivity. Open-ended exclusivity with no outside date is unacceptable — buyer should not be locked indefinitely without a signed agreement.' : key === 'seller' ? 'Narrow scope to specific capacity tranche only. 90 days is too long; push to 60 days.' : 'Exclusivity terms acceptable.',
        reclabel: key === 'red' ? 'Priority — Add End Date' : key === 'seller' ? 'Priority — Narrow / Shorten' : 'Outcome — Acceptable'
      };
    }
  },

  expenses: {
    getContent(p) {
      const key = p <= 25 ? 'buyer' : p <= 50 ? 'market' : p <= 75 ? 'seller' : 'red';
      return {
        term: key === 'buyer' ? `<strong>Each party bears its own costs.</strong> No cost-shifting on diligence, negotiation, or consummation. Market standard.` :
              key === 'market' ? `<strong>Each party responsible for its own legal, diligence, and advisory costs</strong> in connection with negotiating and executing the VPPA. No cost recovery provision.` :
              key === 'seller' ? `<strong>Buyer responsible for certain seller costs</strong> if buyer terminates during exclusivity period — creates de facto break fee.` :
              `<strong>Buyer liable for seller's costs if deal does not close</strong> — regardless of fault. Creates significant financial disincentive to exercise legitimate contract rights.`,
        bench: "Standard: Each party bears its own expenses. Any cost-shifting triggered by buyer termination (break fee) is non-standard and should be rejected. Legal fees run $50–150K+ on both sides.",
        impact: key === 'buyer' ? 'EACH BEARS OWN' : key === 'market' ? 'EACH BEARS OWN' : key === 'seller' ? 'BUYER BREAK FEE' : 'BUYER LIABLE FOR COSTS',
        impactsub: key === 'buyer' ? 'No cost recovery risk<br>market standard' : key === 'market' ? 'Standard each-bears-own<br>no cost shifting' : key === 'seller' ? 'Buyer owes seller costs<br>if terminates in exclusivity' : 'Buyer pays seller costs<br>regardless of fault',
        rec: key === 'red' ? 'Reject cost-shifting provisions. Buyer liability for seller costs regardless of fault is punitive and non-standard. This is effectively a disguised break fee.' : key === 'seller' ? 'Remove break fee. Cost-shifting during exclusivity creates unjust deterrent to exercising legitimate termination rights.' : 'Expense allocation acceptable.',
        reclabel: key === 'red' ? 'Priority — Reject Cost Shift' : key === 'seller' ? 'Priority — Remove Break Fee' : 'Outcome — Acceptable'
      };
    }
  },

  acct: {
    getContent(p) {
      const key = p <= 25 ? 'buyer' : p <= 50 ? 'market' : p <= 75 ? 'seller' : 'red';
      return {
        term: key === 'buyer' ? `<strong>VPPA structured to qualify as derivative under ASC 815.</strong> Mark-to-market treatment — favorable for buyers seeking P&L hedge accounting. Normal purchases/sales exception (NPNS) not elected.` :
              key === 'market' ? `<strong>VPPA qualifies as derivative under ASC 815.</strong> Standard treatment: fair value changes recorded in OCI or P&L depending on hedge designation. Buyer's accounting team should confirm treatment.` :
              key === 'seller' ? `<strong>Accounting treatment not addressed.</strong> VPPA may inadvertently qualify for NPNS exception — limits ability to reflect economic hedge value on balance sheet.` :
              `<strong>VPPA structured as physical delivery contract.</strong> If buyer has no physical need, NPNS exception disallowed — creates unfavorable ASC 815 treatment with no hedge accounting benefits.`,
        bench: "Standard: VPPAs structured as derivatives under ASC 815. Buyer's accounting team should confirm whether hedge accounting designation (cash flow hedge) is achievable for P&L smoothing. Most Fortune 500 buyers prefer derivative treatment.",
        impact: key === 'buyer' ? 'ASC 815 DERIVATIVE' : key === 'market' ? 'STANDARD DERIVATIVE' : key === 'seller' ? 'TREATMENT UNCLEAR' : 'PHYSICAL — ADVERSE',
        impactsub: key === 'buyer' ? 'Derivative treatment<br>hedge accounting available' : key === 'market' ? 'ASC 815 derivative<br>confirm with accounting' : key === 'seller' ? 'Accounting treatment<br>not defined in contract' : 'Physical structure<br>may limit hedge accounting',
        rec: key === 'red' ? 'Review with accounting team. Physical delivery structure may limit ASC 815 hedge designation — consult Big 4 advisor on treatment before signing.' : key === 'seller' ? 'Confirm ASC 815 derivative treatment with accounting team. Request representation from seller that structure qualifies as financial derivative.' : 'Confirm ASC 815 treatment with accounting team before signing.',
        reclabel: key === 'red' ? 'Priority — Confirm with Accounting' : key === 'seller' ? 'Priority — Clarify Treatment' : 'Outcome — Confirm w/ Accounting'
      };
    }
  },

  publicity: {
    getContent(p) {
      const key = p <= 25 ? 'buyer' : p <= 50 ? 'market' : p <= 75 ? 'seller' : 'red';
      return {
        term: key === 'buyer' ? `<strong>Mutual consent required for all press releases and public announcements.</strong> Neither party may use the other's name, logo, or deal terms without prior written approval.` :
              key === 'market' ? `<strong>Mutual prior written consent for press releases.</strong> Standard carve-out for legally required disclosures (SEC, regulatory). Logo/name use requires separate written approval.` :
              key === 'seller' ? `<strong>Seller may issue press release announcing project and buyer without prior consent.</strong> Buyer name and deal terms may be disclosed by seller unilaterally.` :
              `<strong>No publicity restrictions.</strong> Seller can publicly announce buyer's name, deal size, and terms — exposes buyer's renewable strategy, pricing, and competitive position.`,
        bench: "Standard: Mutual prior written consent for all press releases. SEC/regulatory filing carve-out. Seller press releases announcing buyer participation (used for project financing) are common — but must require buyer pre-approval.",
        impact: key === 'buyer' ? 'MUTUAL CONSENT' : key === 'market' ? 'CONSENT REQUIRED' : key === 'seller' ? 'SELLER CAN ANNOUNCE' : 'NO RESTRICTIONS',
        impactsub: key === 'buyer' ? 'Both parties must approve<br>any public announcement' : key === 'market' ? 'Prior written consent<br>for press releases' : key === 'seller' ? 'Seller may use buyer name<br>without consent' : 'Buyer exposed publicly<br>competitive risk',
        rec: key === 'red' ? 'Add mutual consent requirement. Seller announcing buyer name and deal terms without consent exposes renewable strategy and pricing to competitors and activists.' : key === 'seller' ? 'Require buyer pre-approval for all press releases naming buyer or disclosing deal terms. Seller financing roadshows are common — buyer should control its own announcement timing.' : 'Publicity rights acceptable.',
        reclabel: key === 'red' ? 'Priority — Add Consent Req.' : key === 'seller' ? 'Priority — Require Pre-Approval' : 'Outcome — Acceptable'
      };
    }
  }

};

// Fallback for any term not in CONTENT object
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

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { DEAL, ZONES, getZone, SCORECARD_GROUPS, TERM_META, CONTENT, generateSimpleContent };
}
