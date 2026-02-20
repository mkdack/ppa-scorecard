// ═══════════════════════════════════════════════════════════════
// CLEARPATH PPA DEAL SCORECARD — CONTENT DEFINITIONS
// CEBA Off-Site Term Sheet Primer aligned, v3.0
// 35 terms across 7 groups
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
// SCORECARD GROUPS — 35 TERMS TOTAL
// ═══════════════════════════════════════════════════════════════

const SCORECARD_GROUPS = [
  { id: 'pricing',  title: 'Pricing & Settlement',       terms: ['strike', 'floating', 'interval', 'negprice', 'invoice', 'basis', 'marketdisrupt', 'scheduling'] },
  { id: 'shape',    title: 'Shape & Curtailment',        terms: ['curtailment', 'nonecocurtail', 'basiscurtail'] },
  { id: 'dev',      title: 'Project Development',        terms: ['ia', 'cp', 'delay', 'availmech', 'availguaranteed', 'permit', 'cod'] },
  { id: 'credit',   title: 'Credit & Collateral',        terms: ['buyerpa', 'sellerpa'] },
  { id: 'contract', title: 'Contract Terms',             terms: ['assign', 'fm', 'eod', 'eterm', 'changeinlaw', 'reputation'] },
  { id: 'recs',     title: 'RECs & Facility Attributes', terms: ['product', 'recs', 'incentives'] },
  { id: 'legal',    title: 'Legal & Administrative',     terms: ['govlaw', 'conf', 'excl', 'expenses', 'acct', 'publicity'] }
];

const TERM_META = {
  // Pricing & Settlement
  strike:         { name: 'Strike Price',                      category: 'Pricing',                  icon: '💰', defaultPos: 0, group: 'pricing',  flexibility: 'flexible' },
  floating:       { name: 'Floating Price & Settlement Formula',category: 'Settlement Mechanics',     icon: '📐', defaultPos: 0, group: 'pricing',  flexibility: 'flexible' },
  interval:       { name: 'Calculation Interval',              category: 'Settlement Mechanics',      icon: '⏲',  defaultPos: 0, group: 'pricing',  flexibility: 'flexible' },
  negprice:       { name: 'Negative Price Protection',         category: 'Negative Price Risk',       icon: '🛡',  defaultPos: 0, group: 'pricing',  flexibility: 'flexible' },
  invoice:        { name: 'Invoicing & Payment Terms',         category: 'Settlement Period',         icon: '🧾', defaultPos: 0, group: 'pricing',  flexibility: 'flexible' },
  basis:          { name: 'Basis Risk & Settlement Point',     category: 'Settlement Point',          icon: '📍', defaultPos: 0, group: 'pricing',  flexibility: 'inflexible' },
  marketdisrupt:  { name: 'Market Disruption',                 category: 'Risk Management',           icon: '📉', defaultPos: 0, group: 'pricing',  flexibility: 'flexible' },
  scheduling:     { name: 'Scheduling & Third-Party Charges',  category: 'Market Operations',         icon: '🔧', defaultPos: 0, group: 'pricing',  flexibility: 'inflexible' },
  // Shape & Curtailment
  curtailment:    { name: 'Economic Curtailment',              category: 'Negative Price Risk',       icon: '⚡', defaultPos: 0, group: 'shape',    flexibility: 'flexible' },
  nonecocurtail:  { name: 'Non-Economic Curtailment',          category: 'Forced Outage Risk',        icon: '🔴', defaultPos: 0, group: 'shape',    flexibility: 'flexible' },
  basiscurtail:   { name: 'Basis Curtailment',                 category: 'Congestion Risk',           icon: '📡', defaultPos: 0, group: 'shape',    flexibility: 'inflexible' },
  // Project Development
  ia:             { name: 'Interconnection Status',            category: 'Development Risk',          icon: '🔌', defaultPos: 0, group: 'dev',      flexibility: 'flexible' },
  cp:             { name: 'Seller Conditions Precedent',       category: 'Development Risk',          icon: '📋', defaultPos: 0, group: 'dev',      flexibility: 'flexible' },
  delay:          { name: 'Delay & Shortfall Damages',         category: 'COD Risk',                  icon: '📅', defaultPos: 0, group: 'dev',      flexibility: 'inflexible' },
  availmech:      { name: 'Mechanical Availability Guarantee', category: 'Project Performance',       icon: '📊', defaultPos: 0, group: 'dev',      flexibility: 'flexible' },
  availguaranteed:{ name: 'Guaranteed Annual Production',      category: 'Derivative Accounting Risk',icon: '⚠️', defaultPos: 0, group: 'dev',      flexibility: 'flexible' },
  permit:         { name: 'New Permitting Requirements',       category: 'Development Risk',          icon: '📜', defaultPos: 0, group: 'dev',      flexibility: 'inflexible' },
  cod:            { name: 'Commercial Operation Date',         category: 'Development Milestone',     icon: '🎯', defaultPos: 0, group: 'dev',      flexibility: 'inflexible' },
  // Credit & Collateral
  buyerpa:        { name: 'Buyer Performance Assurance',       category: 'Credit',                    icon: '🏛',  defaultPos: 0, group: 'credit',   flexibility: 'inflexible' },
  sellerpa:       { name: 'Seller Performance Assurance',      category: 'Credit',                    icon: '🏦', defaultPos: 0, group: 'credit',   flexibility: 'flexible' },
  // Contract Terms
  assign:         { name: 'Seller Assignment',                 category: 'Assignment',                icon: '🔄', defaultPos: 0, group: 'contract', flexibility: 'flexible' },
  fm:             { name: 'Force Majeure',                     category: 'Force Majeure',             icon: '🌪',  defaultPos: 0, group: 'contract', flexibility: 'flexible' },
  eod:            { name: 'Events of Default',                 category: 'Default & Remedies',        icon: '⚖️', defaultPos: 0, group: 'contract', flexibility: 'inflexible' },
  eterm:          { name: 'Early Termination Rights',          category: 'Termination',               icon: '🚪', defaultPos: 0, group: 'contract', flexibility: 'flexible' },
  changeinlaw:    { name: 'Change in Law',                     category: 'Risk Management',           icon: '📜', defaultPos: 0, group: 'contract', flexibility: 'inflexible' },
  reputation:     { name: 'Reputational Disclosures',          category: 'ESG & Reputation',          icon: '🌟', defaultPos: 0, group: 'contract', flexibility: 'inflexible' },
  // RECs & Facility Attributes
  product:        { name: 'Product & Facility Attributes',     category: 'REC Delivery',              icon: '📦', defaultPos: 0, group: 'recs',     flexibility: 'flexible' },
  recs:           { name: 'REC Delivery & Arbitrage',          category: 'REC Delivery',              icon: '🌿', defaultPos: 0, group: 'recs',     flexibility: 'inflexible' },
  incentives:     { name: 'Incentives & Facility Attributes',  category: 'Additional Revenue',        icon: '💎', defaultPos: 0, group: 'recs',     flexibility: 'flexible' },
  // Legal & Administrative
  govlaw:         { name: 'Governing Law',                     category: 'Legal',                     icon: '⚖️', defaultPos: 0, group: 'legal',    flexibility: 'flexible' },
  conf:           { name: 'Confidentiality',                   category: 'Legal',                     icon: '🔒', defaultPos: 0, group: 'legal',    flexibility: 'inflexible' },
  excl:           { name: 'Exclusivity',                       category: 'Legal',                     icon: '🤝', defaultPos: 0, group: 'legal',    flexibility: 'flexible' },
  expenses:       { name: 'Expenses & Cost Allocation',        category: 'Legal',                     icon: '💼', defaultPos: 0, group: 'legal',    flexibility: 'flexible' },
  acct:           { name: 'Accounting Treatment',              category: 'ASC 815 / US GAAP',         icon: '📈', defaultPos: 0, group: 'legal',    flexibility: 'flexible' },
  publicity:      { name: 'Publicity Rights',                  category: 'Legal',                     icon: '📢', defaultPos: 0, group: 'legal',    flexibility: 'inflexible' }
};

// ═══════════════════════════════════════════════════════════════
// CONTENT — ALL 35 TERMS WITH ZONE-SPECIFIC LANGUAGE
// ═══════════════════════════════════════════════════════════════

const CONTENT = {

  // ─── PRICING & SETTLEMENT ────────────────────────────────────

  strike: {
    getContent(p) {
      const zone = getZone(p);
      const marketMin = DEAL.marketMin || 25;
      const marketMax = DEAL.marketMax || 45;
      const marketMid = Math.round((marketMin + marketMax) / 2);
      const priceRange = (marketMax - marketMin) + 30;
      const minPrice = marketMin - 15;
      const negotiatedStrike = Math.round((minPrice + (p / 100 * priceRange)) * 100) / 100;
      const spreadFromMarket = negotiatedStrike - marketMid;
      const escalatorText = DEAL.escalator && DEAL.escalator > 0 ? `${DEAL.escalator}% annual escalator` : 'no escalator';
      const annualMWh = 100000;
      let positionLabel, annualNote;
      if (spreadFromMarket < -5) { positionLabel = 'BELOW MARKET'; annualNote = `Save ~$${(Math.abs(spreadFromMarket)*annualMWh/1000000).toFixed(1)}M/yr vs market`; }
      else if (spreadFromMarket < 5) { positionLabel = 'AT MARKET'; annualNote = 'Market-standard pricing'; }
      else if (spreadFromMarket < 15) { positionLabel = 'ABOVE MARKET'; annualNote = `Overpay ~$${(spreadFromMarket*annualMWh/1000000).toFixed(1)}M/yr`; }
      else { positionLabel = 'EXCESSIVE'; annualNote = `Overpay ~$${(spreadFromMarket*annualMWh/1000000).toFixed(1)}M/yr vs market`; }
      return {
        term: `<strong>$${negotiatedStrike.toFixed(2)}/MWh fixed,</strong> ${escalatorText}. Seasonal adjustment: buyers may negotiate higher peak / lower off-peak fixed price to smooth monthly settlement swings.`,
        bench: `Market range: Min ${DEAL.benchmarkMin} / Avg ${DEAL.benchmarkAvg} / Max ${DEAL.benchmarkMax}. CEBA typical term: 12–20 years; 15 years is pricing benchmark.`,
        impact: positionLabel,
        impactsub: `${annualNote}<br>vs market avg ~$${marketMid}/MWh`,
        rec: zone.priority === 'critical' ? `Significantly overpaying. Target $${marketMid}/MWh or below. Use competing bids as leverage. Consider walking away.` : zone.priority === 'moderate' ? `Push toward $${marketMid + 3}/MWh. Request seasonal adjustment option to reduce settlement volatility.` : 'Pricing within acceptable range. Confirm seasonal adjustment option. Lock in.',
        reclabel: zone.priority === 'critical' ? 'Strategy — Renegotiate' : zone.priority === 'moderate' ? 'Strategy — Push Down' : 'Strategy — Acceptable'
      };
    }
  },

  floating: {
    getContent(p) {
      const key = p <= 25 ? 'buyer' : p <= 50 ? 'market' : p <= 75 ? 'seller' : 'red';
      const iso = DEAL.iso || 'ERCOT';
      return {
        term: key === 'buyer' ? `<strong>Real-time Hub LMP at ${iso}, hourly settlement interval</strong> matching ISO dispatch. No seller discretion on settlement point or interval. Formula fully defined in contract.` :
              key === 'market' ? `<strong>Real-time Hub LMP at ${iso}, hourly settlement interval.</strong> Standard fixed-for-floating swap. Market-settlement interval matches ISO real-time.` :
              key === 'seller' ? `<strong>Settlement formula contains seller election rights</strong> between hub and node pricing in certain intervals. Seller can cherry-pick favorable settlement point.` :
              `<strong>Floating price definition incomplete or absent.</strong> Settlement methodology not specified — creates unbounded financial exposure. Non-starter.`,
        bench: `CEBA standard: ISO real-time or day-ahead LMP at Hub, with market-settlement interval identical to ISO (hourly for day-ahead; 15-min for real-time). No seller election rights. Day-ahead vs real-time should be explicitly analyzed — each has different volatility profile.`,
        impact: key === 'buyer' ? 'GRANULAR + DEFINED' : key === 'market' ? 'HUB RT — STANDARD' : key === 'seller' ? 'SELLER ELECTION' : 'UNDEFINED',
        impactsub: key === 'buyer' ? 'RT hourly Hub LMP<br>no seller discretion' : key === 'market' ? 'Hub LMP, hourly<br>market standard' : key === 'seller' ? 'Seller picks settlement<br>point per interval' : 'No formula defined<br>reject immediately',
        rec: key === 'red' ? 'Reject. Define explicit Hub LMP formula. No seller election rights. Specify real-time vs day-ahead — each has meaningfully different volatility implications.' : key === 'seller' ? 'Remove seller election rights. Fix settlement point at Hub. Cherry-picking creates systematic buyer disadvantage.' : 'Settlement formula acceptable. Confirm real-time vs day-ahead preference with finance/accounting team.',
        reclabel: key === 'red' ? 'Priority 1 — Define Formula' : key === 'seller' ? 'Priority — Remove Election' : 'Outcome — Acceptable'
      };
    }
  },

  interval: {
    getContent(p) {
      const key = p <= 25 ? 'buyer' : p <= 50 ? 'market' : p <= 75 ? 'seller' : 'red';
      const iso = DEAL.iso || 'ERCOT';
      return {
        term: key === 'buyer' ? `<strong>15-minute settlement interval</strong> matching ${iso} real-time dispatch. Maximum granularity — tracks actual generation and pricing with no aggregation smoothing.` :
              key === 'market' ? `<strong>Hourly settlement interval</strong> matching ${iso} market-settlement interval. CEBA standard — identical to ISO real-time hourly pricing.` :
              key === 'seller' ? `<strong>Daily or monthly settlement interval.</strong> Aggregation masks intra-day price volatility and systematically advantages seller in high-volatility markets.` :
              `<strong>No settlement interval defined</strong> or interval materially longer than ISO standard. Creates unknown settlement exposure and dispute risk.`,
        bench: `CEBA standard: market-settlement interval identical to ISO. For day-ahead markets, hourly is standard. For real-time, 15-minute intervals may be available. Monthly averaging is seller-favorable and non-standard.`,
        impact: key === 'buyer' ? '15-MINUTE RT' : key === 'market' ? 'HOURLY — STANDARD' : key === 'seller' ? 'DAILY / MONTHLY' : 'UNDEFINED',
        impactsub: key === 'buyer' ? '15-min granularity<br>matches ISO dispatch' : key === 'market' ? 'Hourly, ISO-matched<br>CEBA standard' : key === 'seller' ? 'Aggregated intervals<br>hide unfavorable hours' : 'No interval defined<br>dispute risk',
        rec: key === 'red' ? 'Define interval explicitly. Require ISO-matched settlement interval. Undefined or overly long intervals benefit seller in volatile pricing periods.' : key === 'seller' ? 'Push to hourly minimum. Daily/monthly aggregation benefits seller by averaging out negative-price hours the buyer would otherwise avoid.' : 'Calculation interval acceptable.',
        reclabel: key === 'red' ? 'Priority — Define Interval' : key === 'seller' ? 'Priority — Shorten to Hourly' : 'Outcome — Acceptable'
      };
    }
  },

  negprice: {
    getContent(p) {
      const key = p <= 25 ? 'buyer' : p <= 50 ? 'market' : p <= 75 ? 'seller' : 'red';
      const iso = DEAL.iso || 'ERCOT';
      const tech = (DEAL.tech || 'solar').toLowerCase();
      const isWind = tech.includes('wind');
      const isERCOT = iso.toUpperCase().includes('ERCOT');
      const negHours = isERCOT ? '300–800+ hours/year' : '100–400+ hours/year';
      return {
        term: key === 'buyer' ? `<strong>Option 2 — Zero-Dollar Floor (most buyer-friendly):</strong> Floating price deemed $0 in any interval below Floor Price. Project continues generating. Buyer receives RECs for all hours. Buyer only exposed to fixed price, never negative floating.` :
              key === 'market' ? `<strong>Option 1 — Economic Non-Settlement:</strong> Generated quantity deemed zero in any interval when floating price falls below Floor Price. No settlement obligation — buyer and seller flat. ${isWind ? '<br><em>Wind note: Consider Option 1a — make-whole payment to seller to preserve PTC eligibility, seller provides replacement RECs.</em>' : 'No RECs delivered during non-settlement hours.'}` :
              key === 'seller' ? `<strong>Option 1a — Non-Settlement with Make-Whole:</strong> No settlement in negative price hours, but buyer pays seller a make-whole equal to (Floor Price − Fixed Price) × deemed generated energy. Seller provides replacement RECs. ${isWind ? 'Used when seller needs PTC revenue continuity.' : 'Uncommon for solar; PTC make-whole not applicable.'}` :
              `<strong>No negative price protection.</strong> Buyer pays fixed price AND owes negative floating price in below-floor hours — simultaneous payment on both legs. ${isERCOT ? `ERCOT sees ${negHours} of negative pricing. Exposure can exceed $500K/year on a 100MW project.` : `${iso} sees ${negHours} of negative pricing — material financial exposure.`}`,
        bench: `CEBA standard: Floor Price = $0 for solar; $0 minus grossed-up PTC value for wind in years 1–10, then $0. Option 2 (zero floor) is most buyer-friendly — project keeps generating, buyer keeps RECs. Option 1 (non-settlement) is market standard. Option 1a is wind-specific PTC preservation. No protection is a hard red flag.`,
        impact: key === 'buyer' ? 'OPTION 2 — ZERO FLOOR' : key === 'market' ? 'OPTION 1 — NON-SETTLE' : key === 'seller' ? 'OPTION 1a — MAKE-WHOLE' : 'NO PROTECTION',
        impactsub: key === 'buyer' ? 'Floating deemed $0<br>RECs continue, no double-pay' : key === 'market' ? 'Non-settlement in neg hours<br>no RECs during curtail' : key === 'seller' ? 'Non-settle + make-whole<br>seller gets PTC, buyer gets RECs' : `Double-pay exposure<br>${isERCOT ? '~$500K+/yr on 100MW' : 'material cost risk'}`,
        rec: key === 'red' ? `Non-negotiable — add negative price protection immediately. Option 2 (zero floor) preferred. Option 1 (non-settlement) is minimum acceptable. ${isERCOT ? `ERCOT sees ${negHours} of negative pricing.` : ''}` : key === 'seller' ? `Option 1a is acceptable for wind PTC preservation. For solar, push to Option 1 (non-settlement) or Option 2 (zero floor) — make-whole is unnecessary.` : 'Negative price protection acceptable.',
        reclabel: key === 'red' ? 'Priority 1 — Non-Negotiable' : key === 'seller' ? isWind ? 'Review — Wind PTC Context' : 'Priority — Push to Option 1/2' : 'Outcome — Protected'
      };
    }
  },

  invoice: {
    getContent(p) {
      const key = p <= 25 ? 'buyer' : p <= 50 ? 'market' : p <= 75 ? 'seller' : 'red';
      return {
        term: key === 'buyer' ? `<strong>Seller invoices by 10th business day of following month.</strong> Buyer pays within 20 days of receipt. Net 20 effective cycle. Buyer specifies invoice format, supporting data, and calculation methodology in contract.` :
              key === 'market' ? `<strong>Seller invoices by 15th day of following month.</strong> Buyer pays within 30 days of receipt; seller pays buyer within 30 days after contract month end. CEBA standard Net 30. Note: ISO/RTO restatements may delay settlement calculations.` :
              key === 'seller' ? `<strong>Net 45+ payment terms</strong> or annualized interest escalator on unpaid invoices. Extended cycle creates unnecessary float cost.` :
              `<strong>No defined payment timeline or invoice format.</strong> Undefined terms create cash flow uncertainty, calculation disputes, and late-payment exposure.`,
        bench: `CEBA standard: Seller invoices by 15th of following month; buyer pays Net 30; seller pays buyer Net 30 after month end. Buyers should specify invoice format and supporting data during negotiation. Some sellers include interest on late payments — negotiate cap at prime + 1%.`,
        impact: key === 'buyer' ? 'NET 20' : key === 'market' ? 'NET 30 — STANDARD' : key === 'seller' ? 'NET 45+ / INTEREST' : 'UNDEFINED',
        impactsub: key === 'buyer' ? 'Fast cycle + defined format<br>low dispute risk' : key === 'market' ? '15th invoice, 30-day pay<br>CEBA standard' : key === 'seller' ? 'Extended or punitive<br>interest on late pay' : 'No timeline defined<br>high dispute risk',
        rec: key === 'red' ? 'Define payment timeline — Net 30 maximum. Specify invoice format and supporting data in contract. Undefined invoicing is a leading cause of settlement disputes.' : key === 'seller' ? 'Negotiate to Net 30. Cap late-payment interest at prime + 1%. Remove annualized escalators.' : 'Payment terms acceptable. Confirm invoice format is specified in contract.',
        reclabel: key === 'red' ? 'Priority — Define Terms' : key === 'seller' ? 'Priority — Negotiate Down' : 'Outcome — Acceptable'
      };
    }
  },

  basis: {
    getContent(p) {
      const key = p <= 25 ? 'buyer' : p <= 50 ? 'market' : p <= 75 ? 'seller' : 'red';
      const iso = DEAL.iso || 'ERCOT';
      return {
        term: key === 'buyer' ? `<strong>Hub settlement at ${iso} Hub.</strong> Seller bears all basis risk between project node and hub — seller is in the best position to assess and hedge this via owned instruments. Basis blowout language included: if hub exceeds node by 2x fixed price, seller may not curtail without financial consequence.` :
              key === 'market' ? `<strong>Hub settlement at ${iso} Hub.</strong> Seller bears hub-to-node spread. CEBA notes hub settlement increases PPA strike price vs node settlement but limits basis and congestion risk for buyer. Most buyers prefer paying the premium for hub certainty.` :
              key === 'seller' ? `<strong>Node/busbar settlement.</strong> Buyer exposed to hub-to-node basis differential — typically $2–5/MWh annually but can spike significantly during congestion events. Seller retains basis risk management advantage.` :
              `<strong>Seller election between hub and node per interval.</strong> CEBA Appendix 3 Option 1 structure: seller can shift floating price to (busbar + fixed price) when settlement is negative AND busbar > $0 AND floating > (busbar + 2x fixed). Severe buyer exposure.`,
        bench: `CEBA standard: Hub settlement. Seller is best positioned to assess and bear basis risk via hedging instruments — and will price this into strike. Node settlement transfers a risk to buyer that buyer cannot independently hedge. Hub-to-node spread in ERCOT averages $2–5/MWh but can spike to $20+/MWh during congestion.`,
        impact: key === 'buyer' ? 'HUB + BLOWOUT CLAUSE' : key === 'market' ? 'HUB — STANDARD' : key === 'seller' ? 'NODE EXPOSURE' : 'SELLER ELECTION',
        impactsub: key === 'buyer' ? 'Hub + congestion protection<br>seller bears basis risk' : key === 'market' ? 'Hub LMP, CEBA standard<br>seller bears spread' : key === 'seller' ? '$2–5/MWh avg basis drag<br>buyer cannot hedge' : 'Seller picks best point<br>per-interval cherry-pick',
        rec: key === 'red' ? 'Reject seller election. Fix at Hub. CEBA Appendix 3: use Basis LMP formula (Option 2) — if spread < $X, Basis LMP = Hub; if spread ≥ $X, Basis LMP = greater of 2x contract price or real-time nodal LMP.' : key === 'seller' ? 'Push for Hub settlement. Node settlement transfers unhedgeable basis risk to buyer. CEBA recommends most buyers pay the strike premium for hub certainty.' : 'Hub settlement acceptable. Consider adding basis blowout clause for extreme congestion events.',
        reclabel: key === 'red' ? 'Priority 1 — Fix to Hub' : key === 'seller' ? 'Priority — Push to Hub' : 'Outcome — Acceptable'
      };
    }
  },

  marketdisrupt: {
    getContent(p) {
      const key = p <= 25 ? 'buyer' : p <= 50 ? 'market' : p <= 75 ? 'seller' : 'red';
      return {
        term: key === 'buyer' ? `<strong>No market disruption clause.</strong> All settlement at published ISO prices regardless of market conditions. If disruption occurs, parties retroactively settle using historic average pricing with true-up.` :
              key === 'market' ? `<strong>Standard market disruption clause.</strong> If floating price becomes unavailable or calculation materially changes, parties negotiate replacement formula in good faith. Standard practice: pause settlement during disruption, retroactively settle once alternative is identified.` :
              key === 'seller' ? `<strong>Broad market disruption clause.</strong> Seller may invoke for price spikes, settlement methodology changes, or ISO rule changes — with fallback to seller-calculated reference price. Effectively a seller-controlled reset right.` :
              `<strong>Market disruption with seller-defined fallback pricing.</strong> Seller sets reference price during disruption periods. CEBA notes market disruptions typically do not rise to Force Majeure level and should be separately negotiated — seller-controlled pricing is unacceptable.`,
        bench: `CEBA standard: Good-faith negotiation on replacement formula if floating price becomes unavailable or materially changes. Historic average pricing with true-up is common fallback. Seller-calculated reference prices are non-standard. Market disruption language may overlap with Force Majeure — ensure no double coverage.`,
        impact: key === 'buyer' ? 'NO CLAUSE' : key === 'market' ? 'GOOD FAITH + TRUE-UP' : key === 'seller' ? 'BROAD SELLER TRIGGER' : 'SELLER REFERENCE PRICE',
        impactsub: key === 'buyer' ? 'ISO prices always apply<br>retro true-up if disrupted' : key === 'market' ? 'Good-faith replacement<br>historic avg true-up' : key === 'seller' ? 'Broad trigger + seller<br>controls reference price' : 'Seller sets fallback price<br>severe exposure',
        rec: key === 'red' ? 'Reject seller-defined reference pricing. If market disruption occurs, fallback must be published ISO historic averages only. CEBA: disruptions are remediable — not FM events.' : key === 'seller' ? 'Narrow trigger to floating price becoming completely unavailable. Remove seller-calculated fallback. Use ISO historic average with mutual true-up.' : 'Market disruption terms acceptable.',
        reclabel: key === 'red' ? 'Priority — Reject Seller Pricing' : key === 'seller' ? 'Priority — Narrow Scope' : 'Outcome — Acceptable'
      };
    }
  },

  scheduling: {
    getContent(p) {
      const key = p <= 25 ? 'buyer' : p <= 50 ? 'market' : p <= 75 ? 'seller' : 'red';
      const iso = DEAL.iso || 'ERCOT';
      return {
        term: key === 'buyer' ? `<strong>Seller acts as market participant / Qualified Scheduling Entity (QSE)</strong> and bears all costs for maintaining its ISO/RTO account, scheduling, and transmission-related charges. Seller may not outsource QSE function without buyer consent.` :
              key === 'market' ? `<strong>Seller acts as market participant / QSE at ${iso}</strong> and is responsible for all costs for maintaining its account with the ISO/RTO. Standard CEBA-aligned allocation — seller is best positioned to manage scheduling.` :
              key === 'seller' ? `<strong>Seller may outsource QSE function to a third party</strong> without buyer consent. Third-party QSE fees and scheduling costs may create dispute over cost allocation or liability for scheduling errors.` :
              `<strong>No scheduling or third-party charge allocation defined.</strong> Buyer may be exposed to unexpected ISO/RTO fees, imbalance charges, or scheduling error costs with no contractual remedy.`,
        bench: `CEBA standard (Inflexible): Seller acts as market participant/QSE and bears all ISO/RTO account costs. CEBA flags this as an inflexible term — seller should always bear scheduling responsibility. Some sellers outsource to third-party QSEs; buyer should retain consent right.`,
        impact: key === 'buyer' ? 'SELLER QSE — LOCKED' : key === 'market' ? 'SELLER QSE — STANDARD' : key === 'seller' ? 'THIRD-PARTY QSE' : 'NO ALLOCATION',
        impactsub: key === 'buyer' ? 'Seller bears all ISO costs<br>no outsource without consent' : key === 'market' ? 'Seller as QSE<br>CEBA inflexible standard' : key === 'seller' ? 'Third-party QSE possible<br>cost/liability gap' : 'ISO costs unallocated<br>buyer exposure risk',
        rec: key === 'red' ? 'Add explicit scheduling provision. Seller must act as QSE and bear all ISO/RTO account costs. Undefined scheduling allocation creates imbalance charge exposure. CEBA treats this as inflexible.' : key === 'seller' ? 'Add consent right for QSE outsourcing. Third-party QSE without buyer consent creates accountability gap for scheduling errors.' : 'Scheduling allocation acceptable.',
        reclabel: key === 'red' ? 'Priority — Add Provision' : key === 'seller' ? 'Priority — Add Consent Right' : 'Outcome — Acceptable'
      };
    }
  },

  // ─── SHAPE & CURTAILMENT ─────────────────────────────────────

  curtailment: {
    getContent(p) {
      const key = p <= 25 ? 'buyer' : p <= 50 ? 'market' : p <= 75 ? 'seller' : 'red';
      const iso = DEAL.iso || 'ERCOT';
      const isERCOT = iso.toUpperCase().includes('ERCOT');
      return {
        term: key === 'buyer' ? `<strong>Seller-borne economic curtailment.</strong> When ISO prices fall below Floor Price, seller bears 100% of lost generation and settlement. Buyer's obligation unaffected. Equivalent to combining Option 2 neg price protection with full seller curtailment risk.` :
              key === 'market' ? `<strong>50/50 shared economic curtailment.</strong> Curtailment hours during negative price events split equally — buyer and seller share the revenue loss. CEBA-aligned standard for corporate VPPAs. Note: cap on curtailment hours is increasingly common in utility PPAs but still rare in corporate VPPAs.` :
              key === 'seller' ? `<strong>75%+ buyer-borne economic curtailment.</strong> Buyer absorbs majority of curtailment loss during negative pricing periods. Significantly above market. Seller retains dispatch flexibility at buyer's expense.` :
              `<strong>100% buyer-borne economic curtailment.</strong> Buyer continues to pay strike price during all negative price hours with no offsetting floating payment. ${isERCOT ? 'ERCOT can see 5–15% of annual hours with negative pricing — this is a material, recurring cost.' : 'Economic curtailment can represent a significant percentage of annual settlement hours.'}`,
        bench: `CEBA/REBA standard: 50/50 shared or seller-borne. 100% buyer-borne is a hard red flag. CEBA notes any curtailment clause must have an automatic trigger — buyer should never have the right to direct curtailment, as this creates regulatory risk. ${isERCOT ? 'ERCOT economic curtailment during negative price events: 5–15% of annual hours.' : ''}`,
        impact: key === 'buyer' ? 'SELLER-BORNE' : key === 'market' ? '50/50 SHARED' : key === 'seller' ? '75%+ BUYER' : '100% BUYER',
        impactsub: key === 'buyer' ? 'Seller absorbs all curtailment<br>buyer unaffected' : key === 'market' ? 'Equal risk sharing<br>CEBA standard' : key === 'seller' ? 'Majority buyer-borne<br>above market' : 'Full buyer exposure<br>reject immediately',
        rec: key === 'red' ? 'REJECT. 100% buyer-borne economic curtailment is unacceptable. Minimum: 50/50 shared. Any clause must have automatic trigger — buyer must not have right to direct curtailment.' : key === 'seller' ? 'Negotiate to 50/50 minimum. 75%+ buyer-borne is well above market.' : 'Economic curtailment allocation acceptable. Confirm automatic trigger mechanism is in contract — not buyer-directed.',
        reclabel: key === 'red' ? 'Priority 1 — Reject' : key === 'seller' ? 'Priority — To 50/50' : 'Outcome — Acceptable'
      };
    }
  },

  nonecocurtail: {
    getContent(p) {
      const key = p <= 25 ? 'buyer' : p <= 50 ? 'market' : p <= 75 ? 'seller' : 'red';
      return {
        term: key === 'buyer' ? `<strong>Non-economic curtailment narrowly defined.</strong> No swap or settlement occurs only when the project is curtailed or removed from service due to: (1) system emergency, (2) forced outage, or (3) ISO/RTO-directed curtailment. Force majeure events separately addressed. No RECs delivered during non-economic curtailment hours.` :
              key === 'market' ? `<strong>Standard non-economic curtailment provision.</strong> No settlement during system emergencies, forced outages, or ISO/RTO-directed curtailment. CEBA standard language — distinct from economic curtailment (negative prices) and force majeure. No RECs for curtailed hours.` :
              key === 'seller' ? `<strong>Non-economic curtailment definition is overly broad,</strong> including maintenance outages, equipment upgrades, or seller-elected downtime. Seller can invoke non-economic curtailment to avoid settlement during periods it chooses to take offline.` :
              `<strong>No non-economic curtailment provision or definition conflated with force majeure.</strong> Unclear what happens during forced outages and ISO dispatch events — creates settlement ambiguity and potential for double-claiming FM and non-economic curtailment protections.`,
        bench: `CEBA standard: Non-economic curtailment = no settlement during system emergencies, forced outages, and ISO/RTO-directed curtailment ONLY. Explicitly separate from (1) economic curtailment (negative price events) and (2) force majeure. Seller maintenance should not qualify. No RECs delivered during non-economic curtailment hours.`,
        impact: key === 'buyer' ? 'NARROW DEFINITION' : key === 'market' ? 'CEBA STANDARD' : key === 'seller' ? 'BROAD — SELLER ELECTION' : 'UNDEFINED / CONFLATED',
        impactsub: key === 'buyer' ? 'Emergency + forced outage<br>only — no seller election' : key === 'market' ? 'System emergency, forced<br>outage, ISO dispatch only' : key === 'seller' ? 'Seller can self-declare<br>non-economic curtailment' : 'No definition or merged<br>with FM — gap risk',
        rec: key === 'red' ? 'Define non-economic curtailment explicitly and separately from force majeure. CEBA: only system emergencies, forced outages, and ISO-directed curtailment qualify. Seller-elected downtime should not excuse settlement.' : key === 'seller' ? 'Narrow definition. Remove seller-elected maintenance from non-economic curtailment — maintenance should be planned and cannot be used to avoid settlement obligations.' : 'Non-economic curtailment provision acceptable. Confirm it is separate from FM and economic curtailment definitions.',
        reclabel: key === 'red' ? 'Priority — Define Separately' : key === 'seller' ? 'Priority — Narrow Scope' : 'Outcome — Acceptable'
      };
    }
  },

  basiscurtail: {
    getContent(p) {
      const key = p <= 25 ? 'buyer' : p <= 50 ? 'market' : p <= 75 ? 'seller' : 'red';
      const iso = DEAL.iso || 'ERCOT';
      const isERCOT = iso.toUpperCase().includes('ERCOT');
      return {
        term: key === 'buyer' ? `<strong>Deemed generation during basis curtailment hours.</strong> If project is ISO-dispatched offline due to negative nodal/busbar price while Hub LMP is positive, seller settles as if generating at Hub price. RECs delivered for deemed hours. CEBA Appendix 3 Option 2 Basis LMP formula: if spread < $X → Basis LMP = Hub; if spread ≥ $X → Basis LMP = greater of (2x contract price) or real-time nodal LMP.` :
              key === 'market' ? `<strong>REC replacement obligation for basis curtailment shortfall.</strong> If project curtailed due to congestion while Hub LMP is positive, seller sources and delivers equivalent vintage RECs within 90 days. No settlement adjustment — distinct from economic curtailment (Hub also negative).` :
              key === 'seller' ? `<strong>Basis curtailment hours treated as excused availability outages.</strong> Hours do not count against availability guarantee. Seller has no REC delivery or settlement obligation for congestion-curtailed hours. Buyer gets nothing.` :
              `<strong>No basis curtailment protection.</strong> When project is dispatched offline due to local congestion — Hub LMP positive, busbar negative — buyer pays full strike price with no floating offset and receives zero RECs. Standard negative price protections do NOT apply here because Hub price is positive. ${isERCOT ? 'ERCOT West/South zones: basis curtailment can affect 5–20% of annual hours on congested gen-tie paths.' : 'Basis curtailment frequency depends heavily on project location and interconnection congestion.'}`,
        bench: `CEBA Appendix 3: Recent deals include specific basis blowout language — sellers seek protection from extreme hub-to-node spreads that incentivize curtailment; buyers negotiate to ensure project stays financially incentivized to generate RECs. REC replacement obligation is emerging standard. Deemed generation is buyer-favorable and increasingly negotiable. Key distinction: standard neg price protections don't trigger when Hub LMP is positive.`,
        impact: key === 'buyer' ? 'DEEMED GEN + BASIS LMP' : key === 'market' ? 'REC REPLACEMENT' : key === 'seller' ? 'EXCUSED OUTAGE' : 'NO PROTECTION',
        impactsub: key === 'buyer' ? 'Hub settlement continues<br>RECs delivered, Basis LMP formula' : key === 'market' ? 'No settlement adj<br>replacement RECs sourced' : key === 'seller' ? 'Excused from avail<br>no RECs, no adjustment' : 'Strike pays, zero RECs<br>neg price protections don\'t apply',
        rec: key === 'red' ? `Add basis curtailment REC replacement obligation at minimum. Without it: buyer pays strike, project isn't generating, and standard neg price protections don't trigger because Hub is positive. ${isERCOT ? 'Material exposure in ERCOT congestion zones.' : 'Assess project node congestion history.'}` : key === 'seller' ? 'Excused outage treatment is insufficient. Push for REC replacement obligation. If seller resists deemed generation, REC replacement is the minimum acceptable protection.' : 'Basis curtailment treatment acceptable. Confirm Basis LMP formula thresholds are explicitly defined.',
        reclabel: key === 'red' ? 'Priority 1 — Add REC Replacement' : key === 'seller' ? 'Priority — Add REC Replacement' : 'Outcome — Acceptable'
      };
    }
  },

  // ─── PROJECT DEVELOPMENT ─────────────────────────────────────

  ia: {
    getContent(p) {
      const key = p <= 25 ? 'buyer' : p <= 50 ? 'market' : p <= 75 ? 'seller' : 'red';
      return {
        term: key === 'buyer' ? `<strong>Executed Interconnection Agreement (IA) in place</strong> as condition precedent to VPPA effectiveness. Project has cleared interconnection queue. COD timeline materially de-risked.` :
              key === 'market' ? `<strong>IA required as condition precedent</strong> within defined cure period (typically 90–180 days post-signing), with buyer termination right if not satisfied by outside date.` :
              key === 'seller' ? `<strong>No IA condition precedent.</strong> Project has active queue position but no executed IA. Average interconnection queue processing: 2–4 years. COD timeline highly speculative.` :
              `<strong>No IA and no queue position disclosed.</strong> Pre-queue project — developer is selling capacity it has no right to interconnect yet. Extreme COD uncertainty.`,
        bench: `Standard: Executed IA as CP, or IA CP with buyer termination right if not satisfied within 90–180 days. CEBA: buyer credit support and project financing requirements make interconnection status the single highest COD risk factor. Projects without IAs should carry aggressive delay damages.`,
        impact: key === 'buyer' ? 'IA EXECUTED' : key === 'market' ? 'IA AS CP' : key === 'seller' ? 'QUEUE ONLY' : 'PRE-QUEUE',
        impactsub: key === 'buyer' ? 'Interconnection secured<br>COD risk materially reduced' : key === 'market' ? 'IA CP + buyer exit right<br>managed risk' : key === 'seller' ? '2–4yr queue risk<br>COD speculative' : 'No queue position<br>extreme COD risk',
        rec: key === 'red' ? 'REJECT or require minimum disclosed queue position + aggressive delay damages ($250+/MW/day) + high Seller Development Security. Pre-queue projects should not be signed without major financial protections.' : key === 'seller' ? 'Add IA as condition precedent with 180-day cure and buyer termination right. Queue-only status with no CP is significant COD risk.' : 'Interconnection protection acceptable.',
        reclabel: key === 'red' ? 'Priority 1 — Reject / Protect' : key === 'seller' ? 'Priority — Add IA CP' : 'Outcome — Acceptable'
      };
    }
  },

  cp: {
    getContent(p) {
      const key = p <= 25 ? 'buyer' : p <= 50 ? 'market' : p <= 75 ? 'seller' : 'red';
      return {
        term: key === 'buyer' ? `<strong>Executed IA + all major permits + remaining capacity offtake coverage</strong> as conditions precedent with hard outside dates and buyer termination right if not satisfied. Gold standard — contract is not binding until all CPs met.` :
              key === 'market' ? `<strong>Executed IA + major permits</strong> as conditions precedent with defined outside dates (12–18 months) and mutual termination rights if CPs not satisfied.` :
              key === 'seller' ? `<strong>CPs limited to IA only.</strong> No permitting CP, no outside date for remaining development milestones — seller can delay indefinitely without triggering termination right.` :
              `<strong>No conditions precedent.</strong> VPPA binds buyer on execution regardless of project development status. Buyer has no exit if seller fails to develop, build, or achieve any milestone.`,
        bench: `CEBA standard: Executed IA + major permits as CPs with outside dates (12–18 months). No CPs means buyer is locked into a potentially stranded project. CEBA also notes: contracts should address scenarios where developer sells the project — buyer should negotiate step-in rights and credit support continuity.`,
        impact: key === 'buyer' ? 'FULL CP SUITE' : key === 'market' ? 'IA + PERMITS' : key === 'seller' ? 'IA ONLY — LIMITED' : 'NO CPs',
        impactsub: key === 'buyer' ? 'IA + permits + offtake<br>hard outside dates' : key === 'market' ? 'IA + permits<br>12–18 month outside date' : key === 'seller' ? 'IA only, no permit CP<br>seller can delay freely' : 'Binding on signature<br>no exit rights ever',
        rec: key === 'red' ? 'Add minimum CPs: executed IA + buyer termination right at outside date. A VPPA with no CPs is a blank check to a developer — buyer is exposed indefinitely with no recourse.' : key === 'seller' ? 'Add permitting CP with outside date and mutual termination right. IA-only CP leaves buyer exposed to years of development risk with no exit.' : 'Conditions precedent acceptable.',
        reclabel: key === 'red' ? 'Priority 1 — Add CPs' : key === 'seller' ? 'Priority — Add Permit CP' : 'Outcome — Acceptable'
      };
    }
  },

  delay: {
    getContent(p) {
      const key = p <= 25 ? 'buyer' : p <= 50 ? 'market' : p <= 75 ? 'seller' : 'red';
      return {
        term: key === 'buyer' ? `<strong>$250/MW/day Delay Damages from TCOD.</strong> Shortfall Damages: $100K/MW for uninstalled capacity at Final Nameplate Capacity true-up (6 months post-COD). OCOD = TCOD + 180 days with automatic buyer termination right. REC damages may be included in lieu of or in addition to cash.` :
              key === 'market' ? `<strong>$150–200/MW/day Delay Damages from TCOD.</strong> Shortfall Damages at Final Nameplate Capacity true-up. OCOD = TCOD + 180 days with buyer termination right. CEBA: VPPAs have double value proposition — buyer may request RECs in lieu of or in addition to cash delay damages to maintain sustainability goals.` :
              key === 'seller' ? `<strong>Delay Damages below $100/MW/day</strong> or aggregate cap too low to incentivize performance. No shortfall damages or Final Nameplate Capacity true-up.` :
              `<strong>No Delay Damages defined.</strong> Seller faces zero financial consequence for missing COD — no incentive mechanism exists to enforce timeline. OCOD likely absent too.`,
        bench: `CEBA standard: $150–250/MW/day Delay Damages from TCOD. OCOD = TCOD + 6 months with buyer termination right. Shortfall Damages for uninstalled capacity at Final Nameplate Capacity true-up. CEBA: buyers may request REC damages in addition to cash — critical for sustainability reporting deadlines.`,
        impact: key === 'buyer' ? '$250/MW/DAY + REC LDs' : key === 'market' ? '$150–200/MW/DAY' : key === 'seller' ? 'BELOW MARKET' : '$0 — NO REMEDY',
        impactsub: key === 'buyer' ? 'Full remedy: cash + RECs<br>OCOD exit + shortfall LDs' : key === 'market' ? 'Market-rate damages<br>OCOD exit + shortfall' : key === 'seller' ? 'Weak incentive<br>seller can delay freely' : 'No damages defined<br>seller faces no consequence',
        rec: key === 'red' ? 'Add $200+/MW/day Delay Damages, OCOD = TCOD + 180 days with buyer termination right, and Final Nameplate Capacity shortfall damages. Consider requesting REC damages to protect sustainability reporting deadlines.' : key === 'seller' ? 'Increase to $150/MW/day minimum. Add OCOD termination right and Final Nameplate Capacity true-up with LDs.' : 'Delay damages acceptable. Confirm REC damage option is included for sustainability reporting protection.',
        reclabel: key === 'red' ? 'Priority 1 — Add All Damages' : key === 'seller' ? 'Priority — Increase Rate' : 'Outcome — Acceptable'
      };
    }
  },

  availmech: {
    getContent(p) {
      const key = p <= 25 ? 'buyer' : p <= 50 ? 'market' : p <= 75 ? 'seller' : 'red';
      const tech = (DEAL.tech || 'Solar').toLowerCase();
      const isWind = tech.includes('wind');
      const highGuarantee = isWind ? '92–95%' : '97–99%';
      const stdGuarantee = isWind ? '90–92%' : '94–96%';
      const weakGuarantee = isWind ? 'below 88%' : 'below 92%';
      const twoYearStd = isWind ? '92%' : '95%';
      return {
        term: key === 'buyer' ? `<strong>${isWind ? '92%' : '97%'} mechanical availability guarantee,</strong> measured on rolling 2-consecutive-year basis. Meaningful LD structure: (Average Energy Value + Average REC Value) × Buyer's Share × (Guaranteed % − Actual %). Seasonal restriction on maintenance during high-value months.` :
              key === 'market' ? `<strong>${isWind ? '90%' : '94%'} first year, ${twoYearStd}% in subsequent years</strong> (or ${isWind ? '92%' : '95%'} on any 2 consecutive years). CEBA standard: LD = sum of (Average Energy Value + Average REC Value) × Buyer's Share × shortfall percentage. Seasonal maintenance restriction applies.` :
              key === 'seller' ? `<strong>Availability guarantee ${weakGuarantee}</strong> or LD payment is nominal. CEBA notes developers may offer slightly depressed availability percentages to build in cushion — buyer should push back.` :
              `<strong>No mechanical availability guarantee.</strong> Seller has no obligation to maintain project uptime. All underperformance risk entirely on buyer with no financial remedy.`,
        bench: `CEBA market practice: buyers accept no less than 90–95% for wind, 94–99% for solar. LD formula uses average energy AND average REC values (not just energy) to ensure buyer is made whole for lost sustainability claims. REC LD alternative: seller provides supplemental RECs at 100–120% of shortfall. Seasonal maintenance restriction: no more than a small % of project offline during high-value months.`,
        impact: key === 'buyer' ? `${isWind ? '92%' : '97%'} + FULL LDs` : key === 'market' ? `${isWind ? '90/92%' : '94/95%'} STANDARD` : key === 'seller' ? 'BELOW MARKET' : 'NO GUARANTEE',
        impactsub: key === 'buyer' ? `${isWind ? '92%' : '97%'} mechanical avail<br>energy + REC LDs` : key === 'market' ? `${isWind ? '90→92%' : '94→95%'} ramp-up<br>avg energy + REC LDs` : key === 'seller' ? 'Below-standard threshold<br>or nominal LDs' : 'No performance obligation<br>all risk on buyer',
        rec: key === 'red' ? `Add ${isWind ? '90%' : '94%'} mechanical availability guarantee. LD formula must include REC value component — energy-only LDs do not compensate for lost sustainability claims.` : key === 'seller' ? `Push to ${isWind ? '90%' : '94%'} minimum. Ensure LDs include both Average Energy Value AND Average REC Value. Consider 100–120% REC supplemental in lieu of cash.` : 'Mechanical availability guarantee acceptable. Confirm seasonal maintenance restriction is included.',
        reclabel: key === 'red' ? 'Priority 1 — Add Guarantee' : key === 'seller' ? 'Priority — Strengthen LDs' : 'Outcome — Acceptable'
      };
    }
  },

  availguaranteed: {
    getContent(p) {
      const key = p <= 25 ? 'buyer' : p <= 50 ? 'market' : p <= 75 ? 'seller' : 'red';
      const tech = (DEAL.tech || 'solar').toLowerCase();
      const isWind = tech.includes('wind');
      return {
        term: key === 'buyer' ? `<strong>No Guaranteed Annual Production volume.</strong> CEBA strongly recommends buyers avoid guaranteed production volumes. Guaranteed production (fixed MWh/year) can trigger derivative accounting treatment under US GAAP — requiring contract capitalization and balance sheet recognition.` :
              key === 'market' ? `<strong>No Guaranteed Annual Production.</strong> Buyer's Share expressed as percentage of output, not fixed MWh. CEBA standard: percentage-of-capacity structure de-risks both parties — buyer avoids derivative accounting, seller avoids fixed output obligation versus variable generation.` :
              key === 'seller' ? `<strong>Seller provides Guaranteed Annual Production volume (fixed MWh).</strong> While financially attractive, fixed MWh guarantee may trigger US GAAP derivative accounting treatment. Consult Big 4 accounting team before accepting.` :
              `<strong>Guaranteed Annual Production with Buyer's Share expressed as fixed MWh (not % of capacity).</strong> High risk of triggering derivative accounting and lease treatment under US GAAP. ${isWind ? 'Wind note: seller incentive to guarantee production varies — wind projects can be economically viable even at negative prices, affecting seller willingness to guarantee.' : 'Solar projects are not economically viable at negative prices, reducing seller motivation to guarantee production.'}`,
        bench: `CEBA: Most buyers AVOID Guaranteed Annual Production because it can trigger derivative accounting treatment under US GAAP. Buyer's Share should be expressed as a % of Planned Nameplate Capacity, not fixed MWh. Cap Buyer's Share at 90% to avoid lease accounting treatment. Consult CEBA Accounting Primer and Big 4 advisor before accepting any production guarantee.`,
        impact: key === 'buyer' ? 'NO GUARANTEE — PREFERRED' : key === 'market' ? '% OF CAPACITY — STANDARD' : key === 'seller' ? 'FIXED MWH GUARANTEE' : 'FIXED MWH — HIGH RISK',
        impactsub: key === 'buyer' ? 'No production guarantee<br>avoids derivative accounting' : key === 'market' ? '% of capacity structure<br>CEBA preferred, no acct risk' : key === 'seller' ? 'Fixed MWh guarantee<br>confirm accounting treatment' : 'Fixed MWh structure<br>possible derivative accounting',
        rec: key === 'red' ? 'Flag immediately for accounting team review. Fixed MWh Guaranteed Production can trigger derivative accounting treatment requiring balance sheet capitalization. Convert to % of capacity structure. Cap Buyer\'s Share at 90%.' : key === 'seller' ? 'Confirm accounting treatment with Big 4 advisor before proceeding. If acceptable, beneficial — but % of capacity is preferred to avoid accounting risk.' : 'No production guarantee — preferred structure. Confirm Buyer\'s Share is expressed as % of capacity and capped at 90% to avoid lease accounting treatment.',
        reclabel: key === 'red' ? 'Priority 1 — Accounting Review' : key === 'seller' ? 'Priority — Confirm Accounting' : 'Outcome — Preferred Structure'
      };
    }
  },

  permit: {
    getContent(p) {
      const key = p <= 25 ? 'buyer' : p <= 50 ? 'market' : p <= 75 ? 'seller' : 'red';
      return {
        term: key === 'buyer' ? `<strong>New permitting requirements are not force majeure events.</strong> Seller bears full permitting risk with no renegotiation rights. Interconnection and permitting delays are developer execution risks — CEBA explicitly excludes these from FM definitions.` :
              key === 'market' ? `<strong>New permitting requirements trigger 30-day good-faith renegotiation only.</strong> If parties cannot agree, either may terminate without damages. CEBA standard: changes in law should not allow either party to unilaterally renegotiate fixed price terms.` :
              key === 'seller' ? `<strong>New permitting requirements allow seller to suspend performance</strong> and trigger mandatory price renegotiation. Buyer must accept new economics or release seller — effectively a seller call option on walking away.` :
              `<strong>New permitting requirements grant seller unilateral termination with no liability.</strong> Seller can exit on any regulatory change unfavorable to project economics. Buyer has no recourse and no damages.`,
        bench: `CEBA: Permitting delays are NOT force majeure events and should not allow seller to renegotiate or exit. Standard: mutual termination right after 30-day good-faith renegotiation fails, no damages to either party. Unilateral seller exit on permitting change is non-standard and buyer-adverse.`,
        impact: key === 'buyer' ? 'SELLER BEARS RISK' : key === 'market' ? 'MUTUAL RENEGOTIATION' : key === 'seller' ? 'SELLER SUSPENSION' : 'SELLER EXIT RIGHT',
        impactsub: key === 'buyer' ? 'Seller bears permitting risk<br>no buyer price impact' : key === 'market' ? '30-day renegotiation<br>mutual exit if unresolved' : key === 'seller' ? 'Seller suspends + forces<br>price renegotiation' : 'Seller exits freely<br>buyer has no recourse',
        rec: key === 'red' ? 'Reject unilateral seller exit. Any permitting provision must result in mutual termination right only, no damages. CEBA explicitly excludes permitting delays from FM — seller should bear development execution risk.' : key === 'seller' ? 'Remove seller suspension right. Replace with mutual termination after 30-day renegotiation fails. Permitting risk belongs to seller.' : 'Permitting provision acceptable.',
        reclabel: key === 'red' ? 'Priority — Reject Exit Right' : key === 'seller' ? 'Priority — Remove Suspension' : 'Outcome — Acceptable'
      };
    }
  },

  cod: {
    getContent(p) {
      const key = p <= 25 ? 'buyer' : p <= 50 ? 'market' : p <= 75 ? 'seller' : 'red';
      return {
        term: key === 'buyer' ? `<strong>Hard TCOD defined. OCOD = TCOD + 180 days</strong> with automatic buyer termination right. COD declaration conditions: (1) project reaches 90% of Planned Nameplate Capacity, (2) IE certification, (3) delivery to interconnection point. Final Nameplate Capacity true-up at OCOD date with LDs per missing MW. Buyer may request no-earlier-than date if not prepared for settlement.` :
              key === 'market' ? `<strong>TCOD defined. OCOD = TCOD + 180 days</strong> with buyer termination right. COD conditions: 90% of Planned Nameplate Capacity commissioned + IE certification. Final Nameplate Capacity established at 6 months post-COD; seller pays Shortfall Damages per MW below Planned. 90% Buyer's Share cap maintained.` :
              key === 'seller' ? `<strong>OCOD beyond TCOD + 12 months,</strong> or COD conditions loosely defined without 90% nameplate threshold or IE certification requirement. Seller has excessive runway before buyer exit right triggers.` :
              `<strong>No OCOD defined or no buyer termination right at OCOD.</strong> Buyer has no contractual exit mechanism if COD is never achieved. Sustainability professionals cannot commit to internal deadlines without an OCOD exit right.`,
        bench: `CEBA standard: TCOD defined; OCOD = TCOD + 6 months; buyer termination right at OCOD. COD conditions: 90% of Planned Nameplate Capacity + IE certification. Final Nameplate Capacity true-up at OCOD date with LDs per MW shortfall. Buyer's Share capped at 90% for lease accounting avoidance. CEBA: sustainability teams are responsible for internal deadlines — OCOD protection is critical.`,
        impact: key === 'buyer' ? '90% THRESHOLD + OCOD EXIT' : key === 'market' ? 'TCOD + 180 OCOD EXIT' : key === 'seller' ? 'LOOSE TIMELINE' : 'NO OCOD EXIT RIGHT',
        impactsub: key === 'buyer' ? '90% threshold, IE cert<br>6-month OCOD, shortfall LDs' : key === 'market' ? 'TCOD + 180-day OCOD<br>90% threshold + IE cert' : key === 'seller' ? 'OCOD > 12 months out<br>no threshold requirement' : 'No OCOD = no exit<br>sustainability deadline risk',
        rec: key === 'red' ? 'Add OCOD = TCOD + 180 days with automatic buyer termination right. Require 90% nameplate threshold for COD declaration and Final Nameplate Capacity true-up with shortfall LDs.' : key === 'seller' ? 'Tighten OCOD to TCOD + 180 days. Add 90% Planned Nameplate Capacity threshold and IE certification as COD conditions. Add Final Nameplate Capacity shortfall LDs.' : 'COD provisions acceptable. Confirm 90% nameplate threshold, IE certification, and Final Nameplate Capacity true-up are all explicitly defined.',
        reclabel: key === 'red' ? 'Priority 1 — Define OCOD' : key === 'seller' ? 'Priority — Tighten All Mechanics' : 'Outcome — Acceptable'
      };
    }
  },

  // ─── CREDIT & COLLATERAL ─────────────────────────────────────

  sellerpa: {
    getContent(p) {
      const key = p <= 25 ? 'buyer' : p <= 50 ? 'market' : p <= 75 ? 'seller' : 'red';
      return {
        term: key === 'buyer' ? `<strong>Letter of Credit from Qualified Institution (A-/A3 rated bank, $2.5B+ net worth).</strong> Seller Development Security: $100K/MWac pre-COD. Operational Security: $75K/MWac post-COD. Provided within 30 days of VPPA execution. Replenishment within 5 business days of draw.` :
              key === 'market' ? `<strong>LC from Qualified Institution or Parent Guarantee from Required Credit Rating entity</strong> (BBB-/Baa3 or better). Seller Development Security: $100K/MWac pre-COD. $75K/MWac post-COD. CEBA standard: LC preferred during development phase when risk is highest. Parent guarantee acceptable if parent meets Required Credit Rating.` :
              key === 'seller' ? `<strong>Seller performance assurance below market</strong> — LC amount under $50K/MWac, guarantee from unrated entity, or no replenishment obligation on draws.` :
              `<strong>No seller performance assurance.</strong> Since seller is an SPV/ProjectCo LLC with no other assets, buyer has zero financial protection against seller default, project abandonment, or failure to achieve COD. CEBA: this is the most critical credit protection for buyer.`,
        bench: `CEBA standard: Seller PA = $100K/MWac pre-COD (Development Security); $75K/MWac post-COD. Qualified Institution = A-/A3 rated bank, $2.5B+ net worth. CEBA notes: seller entities are overwhelmingly SPVs with no other assets — LC preferred over parent guarantee during development. Some buyers use Surety Bonds — confirm with CFO/treasury.`,
        impact: key === 'buyer' ? '$100K/MWAC LC' : key === 'market' ? 'LC OR IG GUARANTEE' : key === 'seller' ? 'BELOW MARKET' : 'NO SECURITY',
        impactsub: key === 'buyer' ? 'LC from A-rated bank<br>5-day replenishment' : key === 'market' ? '$100K pre-COD LC<br>or IG parent guarantee' : key === 'seller' ? 'Insufficient security<br>SPV counterparty risk' : 'Zero protection against<br>SPV default / abandonment',
        rec: key === 'red' ? 'Add Seller Development Security of $100K/MWac via LC from Qualified Institution (A-/A3, $2.5B+ net worth). CEBA: seller is always an SPV — no LC means no protection. Most critical credit term for buyer.' : key === 'seller' ? 'Increase to $75K/MWac minimum. Require replenishment obligation. If seller offers parent guarantee, confirm parent meets BBB-/Baa3 Required Credit Rating.' : 'Seller performance assurance acceptable. Confirm Qualified Institution definition matches CEBA standard (A-/A3, $2.5B+).',
        reclabel: key === 'red' ? 'Priority 1 — Non-Negotiable' : key === 'seller' ? 'Priority — Increase Amount' : 'Outcome — Protected'
      };
    }
  },

  buyerpa: {
    getContent(p) {
      const key = p <= 25 ? 'buyer' : p <= 50 ? 'market' : p <= 75 ? 'seller' : 'red';
      return {
        term: key === 'buyer' ? `<strong>Parent Guarantee from investment-grade rated parent entity</strong> (BBB-/Baa3 or better). No LC required. Guarantee cap is most-negotiated item — specify in term sheet. Performance assurance posted only if buyer drops below investment grade.` :
              key === 'market' ? `<strong>Parent Guarantee or LC at buyer's election</strong> — IG-rated buyers may provide parent guarantee; non-IG buyers post LC. CEBA: credit support amount, form, and draw conditions are intensely negotiated. Cap on guarantee typically most contentious item — lock it in at term sheet stage.` :
              key === 'seller' ? `<strong>LC required regardless of buyer credit rating.</strong> LC amount $150–200K/MWac with no parent guarantee alternative. Significant working capital burden, especially for smaller buyers who may struggle with credit support costs.` :
              `<strong>LC required at $200K+/MWac with no guarantee alternative, short replenishment window (under 5 business days), and broad seller draw rights.</strong> Punitive and disproportionate to seller's actual exposure.`,
        bench: `CEBA: Buyer PA debate focuses on (1) amount, (2) form (LC vs guarantee), (3) draw conditions. IG buyers at parent level may avoid posting security. Cap on parent guarantee is typically the most-negotiated item — CEBA recommends specifying it in the term sheet. CEBA: smaller buyers may find credit support a difficult financial burden — address early.`,
        impact: key === 'buyer' ? 'PARENT GUARANTEE' : key === 'market' ? 'BUYER CHOICE' : key === 'seller' ? 'LC REQUIRED' : 'PUNITIVE LC',
        impactsub: key === 'buyer' ? 'IG guarantee only<br>no LC, no cash tied up' : key === 'market' ? 'Parent or LC<br>buyer selects form' : key === 'seller' ? 'Cash/LC required<br>working capital impact' : 'Excessive amounts<br>broad seller draw rights',
        rec: key === 'red' ? 'Negotiate down. IG-rated buyers should not be required to post LC. Specify guarantee cap in term sheet — this is most-negotiated item and should not be left for PPA stage.' : key === 'seller' ? 'Push for parent guarantee option for IG-rated entities. LC amounts above $175K/MWac are punitive. Specify guarantee cap at term sheet stage.' : 'Buyer credit support acceptable. Confirm guarantee cap is specified in term sheet to avoid contentious PPA-stage negotiation.',
        reclabel: key === 'red' ? 'Priority — Negotiate Down' : key === 'seller' ? 'Priority — Add Guarantee Option' : 'Outcome — Acceptable'
      };
    }
  },

  // ─── CONTRACT TERMS ──────────────────────────────────────────

  assign: {
    getContent(p) {
      const key = p <= 25 ? 'buyer' : p <= 50 ? 'market' : p <= 75 ? 'seller' : 'red';
      return {
        term: key === 'buyer' ? `<strong>Buyer consent required for all unaffiliated third-party assignments.</strong> Affiliate assignments permitted without consent. Collateral assignment to lender permitted (standard for project financing). Tax equity partner investment is not deemed an assignment. Change of control = assignment.` :
              key === 'market' ? `<strong>Standard CEBA assignment provision.</strong> Neither party assigns without other's consent, except: (1) collateral assignment/pledge for project financing, (2) financial rights to qualified hedge counterparty. Change of control = assignment. Lender step-in rights and lender's right to assign post-step-in included.` :
              key === 'seller' ? `<strong>Seller may assign to any creditworthy counterparty without buyer consent.</strong> "Creditworthy" defined solely by seller. CEBA: financing terms can be difficult — lenders have varying requirements, and buyers may not realize they become exposed to developer's equity investors.` :
              `<strong>Seller may assign freely without consent or creditworthiness requirement.</strong> No step-in rights defined. Buyer could face an uncreditworthy shell company counterparty with no recourse.`,
        bench: `CEBA standard: Mutual consent for unaffiliated assignments. Carve-outs: collateral assignment for financing (standard), financial rights to hedge counterparty, tax equity investment. Step-in rights for lender + lender's assignment right post-step-in. CEBA flags: different lenders have varying contract requirements — buyer should be aware of financing-related assignment complexity.`,
        impact: key === 'buyer' ? 'FULL CONSENT PROTECTION' : key === 'market' ? 'MUTUAL CONSENT' : key === 'seller' ? 'CREDITWORTHY ONLY' : 'UNRESTRICTED',
        impactsub: key === 'buyer' ? 'Consent for all unaffiliated<br>lender step-in defined' : key === 'market' ? 'Mutual consent standard<br>financing carve-outs' : key === 'seller' ? 'No consent needed if<br>"creditworthy" per seller' : 'Free assignment<br>no creditworthiness check',
        rec: key === 'red' ? 'Add mutual consent provision with standard financing carve-outs and lender step-in rights. Unrestricted assignment means buyer could face a shell company counterparty.' : key === 'seller' ? 'Require buyer consent for unaffiliated assignments. Seller-defined creditworthiness is insufficient — require independent credit standard (BBB-/Baa3 minimum).' : 'Assignment terms acceptable.',
        reclabel: key === 'red' ? 'Priority — Add Consent Right' : key === 'seller' ? 'Priority — Add Consent' : 'Outcome — Acceptable'
      };
    }
  },

  fm: {
    getContent(p) {
      const key = p <= 25 ? 'buyer' : p <= 50 ? 'market' : p <= 75 ? 'seller' : 'red';
      return {
        term: key === 'buyer' ? `<strong>Narrow FM definition. 12-month cap then mutual termination right.</strong> Term extends day-for-day during FM event before termination right triggers. Explicitly excludes: supply chain issues, interconnection delays, permitting delays, economic/market conditions, inability to sell RECs at favorable prices. COVID-19 recurrence and new pandemic orders may qualify only if enacted AFTER PPA execution.` :
              key === 'market' ? `<strong>Standard FM definition. 12-month cap with day-for-day term extension during event.</strong> Term extends day-for-day for each day delivery suspended — contract does not simply lose the time. Mutual termination right after 12 consecutive months of FM. Excludes: supply chain, interconnection delays, permitting, economic reasons. COVID-19 existing orders: NOT FM. New/increased regulation post-execution: may qualify.` :
              key === 'seller' ? `<strong>Broad FM definition — 18-month cap</strong> or includes supply chain disruptions, interconnection delays, or permitting as FM events. Seller's development execution risks improperly characterized as acts of God.` :
              `<strong>No FM cap or cap exceeds 24 months.</strong> FM definition includes market conditions, interconnection delays, permitting, supply chain — effectively allows seller to delay indefinitely without triggering termination right.`,
        bench: `CEBA standard: 12-month FM cap with day-for-day term extension (not lost time). Excludes: supply chain, interconnection delays, permitting, economic reasons, inability to sell RECs. COVID-19 existing orders: NOT FM. Some sellers attempt to include supply chain and development delays — buyers should resist. CEBA: "FM does not mean there will be a project delay — COVID-19 has not caused significant impacts so far."`,
        impact: key === 'buyer' ? 'NARROW + 12-MO CAP' : key === 'market' ? 'STANDARD + DAY-FOR-DAY' : key === 'seller' ? 'BROAD — 18-MO CAP' : 'NO CAP / BROAD',
        impactsub: key === 'buyer' ? 'Narrow definition, 12-mo cap<br>day-for-day extension' : key === 'market' ? '12-month cap, term extends<br>day-for-day during event' : key === 'seller' ? '18-mo cap + dev risks<br>covered as FM' : 'No cap, broad triggers<br>indefinite delay possible',
        rec: key === 'red' ? 'Add 12-month FM cap with day-for-day term extension. Explicitly exclude: supply chain, interconnection delays, permitting, economic reasons. Seller development execution risks are NOT force majeure.' : key === 'seller' ? 'Narrow FM to exclude interconnection delays, permitting, and supply chain. Reduce cap to 12 months. These are seller execution risks.' : 'FM terms acceptable. Confirm day-for-day term extension mechanic is in contract — this is buyer-favorable and important for sustainability reporting dates.',
        reclabel: key === 'red' ? 'Priority — Narrow FM' : key === 'seller' ? 'Priority — Tighten + Shorten' : 'Outcome — Acceptable'
      };
    }
  },

  eod: {
    getContent(p) {
      const key = p <= 25 ? 'buyer' : p <= 50 ? 'market' : p <= 75 ? 'seller' : 'red';
      return {
        term: key === 'buyer' ? `<strong>Symmetric EODs with equal cure periods.</strong> Seller-specific EOD: Mechanical Availability < 70–75% in any two consecutive contract years (CEBA standard trigger). Payment default: 3-day cure. Material breach: 30-day cure + 60-day extension if diligently remedied. Bankruptcy: immediate. PA failure: 5-day cure.` :
              key === 'market' ? `<strong>Mutual and symmetric Events of Default.</strong> Standard: Payment (3-day cure), Material Breach (30-day + 60-day extension), Bankruptcy (immediate). Seller EOD includes Mechanical Availability < 70–75% in 2 consecutive years. Dodd-Frank reporting responsibility: seller bears at seller's cost.` :
              key === 'seller' ? `<strong>Asymmetric EODs — buyer has shorter cure periods or broader triggers than seller.</strong> Seller's 70–75% availability EOD trigger absent or set at unrealistically low threshold (e.g., below 60%). Systematic disadvantage to buyer.` :
              `<strong>Buyer-only or heavily asymmetric EODs.</strong> Seller defaults narrowly scoped or absent entirely. No availability-based seller EOD. Buyer cannot terminate even for persistent, severe underperformance.`,
        bench: `CEBA standard: Mutual symmetric EODs. Seller-specific EOD: Mechanical Availability < 70–75% in any 2 consecutive years. Payment: 3-day cure. Material breach: 30-day + 60-day extension. Bankruptcy: immediate. Dodd-Frank reporting: seller responsibility at seller's cost. Equal treatment of both parties required.`,
        impact: key === 'buyer' ? 'SYMMETRIC + AVAIL EOD' : key === 'market' ? 'MUTUAL STANDARD' : key === 'seller' ? 'ASYMMETRIC' : 'BUYER-ONLY',
        impactsub: key === 'buyer' ? 'Equal cure periods<br>70–75% avail EOD trigger' : key === 'market' ? 'Mutual symmetric EODs<br>seller avail trigger included' : key === 'seller' ? 'Buyer shorter cure<br>no seller avail trigger' : 'Seller EODs absent<br>no remedy for underperform',
        rec: key === 'red' ? 'Add symmetric EODs including Mechanical Availability < 70–75% in 2 consecutive years as seller EOD. Without this, buyer cannot terminate even for persistent severe underperformance.' : key === 'seller' ? 'Equalize cure periods. Add 70–75% availability EOD trigger for seller. This is a CEBA standard protection.' : 'Events of Default acceptable. Confirm Mechanical Availability trigger (70–75% / 2 consecutive years) is explicitly defined as seller EOD.',
        reclabel: key === 'red' ? 'Priority — Add Symmetry + Avail' : key === 'seller' ? 'Priority — Add Avail Trigger' : 'Outcome — Acceptable'
      };
    }
  },

  eterm: {
    getContent(p) {
      const key = p <= 25 ? 'buyer' : p <= 50 ? 'market' : p <= 75 ? 'seller' : 'red';
      return {
        term: key === 'buyer' ? `<strong>Two-way mark-to-market closeout in both directions.</strong> Non-defaulting party receives MTM value. Buyer has OCOD termination right with full delay damage recovery. Upside share mechanism option: buyer accepts reduced fixed price in exchange for seller paying only a % of monthly settlement amount — limits buyer downside in OTM scenarios.` :
              key === 'market' ? `<strong>Two-way MTM closeout on early termination.</strong> Non-defaulting party receives MTM value from defaulting party. Market standard (ISDA-based). Buyer OCOD termination right included. Monthly settlement can include upside share mechanism at buyer's election.` :
              key === 'seller' ? `<strong>One-way early termination payment.</strong> Buyer pays seller full MTM if out-of-the-money; seller pays buyer only if in-the-money to buyer. Asymmetric — buyer bears full downside exposure without symmetric upside recovery.` :
              `<strong>Early termination payments seller-favorable or undefined.</strong> Buyer may owe termination payment on seller default, or no MTM mechanism defined. Non-defaulting party not protected.`,
        bench: `CEBA standard: Two-way MTM closeout — non-defaulting party receives MTM value. CEBA also notes upside share mechanism: seller pays buyer only a % of monthly settlement in exchange for reduced strike price. This reduces buyer's downside in out-of-the-money periods. Useful risk mitigation tool — consider negotiating at term sheet stage.`,
        impact: key === 'buyer' ? 'TWO-WAY + UPSIDE SHARE' : key === 'market' ? 'TWO-WAY MTM' : key === 'seller' ? 'ONE-WAY PAYMENT' : 'UNDEFINED',
        impactsub: key === 'buyer' ? 'MTM both directions<br>upside share option' : key === 'market' ? 'Two-way MTM closeout<br>symmetric exposure' : key === 'seller' ? 'Buyer pays full OTM<br>asymmetric risk' : 'No MTM mechanism<br>buyer unprotected',
        rec: key === 'red' ? 'Require two-way MTM closeout. Consider negotiating upside share mechanism (reduced fixed price + seller pays % of monthly settlement) to reduce downside exposure if deal goes OTM.' : key === 'seller' ? 'Fix to two-way MTM. One-way payment structures are non-standard. Ask about upside share mechanism as a risk mitigation option.' : 'Early termination terms acceptable. Consider upside share mechanism if seeking additional downside protection on OTM scenarios.',
        reclabel: key === 'red' ? 'Priority — Fix to Two-Way' : key === 'seller' ? 'Priority — Require Symmetry' : 'Outcome — Acceptable'
      };
    }
  },

  changeinlaw: {
    getContent(p) {
      const key = p <= 25 ? 'buyer' : p <= 50 ? 'market' : p <= 75 ? 'seller' : 'red';
      return {
        term: key === 'buyer' ? `<strong>Change in law has no effect on Fixed Price or Settlement Amount for either party.</strong> CEBA standard: neither the Fixed Price nor Settlement Amount calculation is affected by any Change in Law that alters either party's costs or the value of energy/environmental attributes. Both parties need fixed-price certainty.` :
              key === 'market' ? `<strong>Change in law does not allow either party to renegotiate Fixed Price or Settlement Amount.</strong> CEBA: buyers enter deals for fixed-price certainty; sellers need revenue certainty for project financing. Changes in law affect neither party's contractual obligations. Mutual certainty is the standard.` :
              key === 'seller' ? `<strong>Change in law triggers good-faith renegotiation</strong> at seller's request. If unresolved in 60 days, either party may terminate. Departs from CEBA standard — any renegotiation right undermines fixed-price certainty that is core to VPPA value.` :
              `<strong>Change in law allows seller cost pass-through to buyer or unilateral seller exit.</strong> Directly contradicts CEBA standard. Sellers need revenue certainty for financing; buyers need fixed-price certainty. Either pass-through or exit right makes the contract contingent — not fixed.`,
        bench: `CEBA standard (Inflexible): Neither Fixed Price nor Settlement Amount affected by any Change in Law altering either party's costs, operation, or environmental attribute values. Both parties need certainty. CEBA: "Changes in law should not allow either party to renegotiate the contract." Any renegotiation right undermines the fundamental fixed-price structure.`,
        impact: key === 'buyer' ? 'NO EFFECT EITHER PARTY' : key === 'market' ? 'CEBA STANDARD — NO EFFECT' : key === 'seller' ? 'RENEGOTIATION TRIGGER' : 'COST PASS-THROUGH / EXIT',
        impactsub: key === 'buyer' ? 'Fixed price locked<br>no change-in-law carve-out' : key === 'market' ? 'CEBA standard<br>fixed price protected' : key === 'seller' ? 'Renegotiation trigger<br>undermines fixed price' : 'Pass-through or exit<br>CEBA hard reject',
        rec: key === 'red' ? 'REJECT. CEBA standard is explicit: change in law affects neither party\'s price or settlement obligation. Cost pass-through or seller exit right contradicts the fundamental fixed-price certainty that makes VPPAs financeable.' : key === 'seller' ? 'Remove renegotiation right. CEBA: changes in law should not allow either party to renegotiate. Fixed price certainty is essential for both buyer planning and seller project financing.' : 'Change in law provision acceptable and CEBA-aligned.',
        reclabel: key === 'red' ? 'Priority 1 — CEBA Hard Reject' : key === 'seller' ? 'Priority — Remove Renegotiation' : 'Outcome — CEBA Aligned'
      };
    }
  },

  reputation: {
    getContent(p) {
      const key = p <= 25 ? 'buyer' : p <= 50 ? 'market' : p <= 75 ? 'seller' : 'red';
      return {
        term: key === 'buyer' ? `<strong>Full CEBA reputational disclosure suite.</strong> Seller representations and warranties covering: (1) public opposition to project, (2) environmental baseline and stewardship, (3) mitigation measures for wildlife and culturally sensitive properties. Ongoing disclosure obligation for changes during term. Cooperation provision on reputational concerns.` :
              key === 'market' ? `<strong>CEBA standard reputational disclosures.</strong> VPPA contains seller reps/warranties on: public opposition, environmental baseline, environmental stewardship, wildlife and historically/culturally sensitive property mitigation. CEBA: VPPA is a long-term relationship with lasting reputational impacts on buyer — these provisions are increasingly expected.` :
              key === 'seller' ? `<strong>Reputational disclosures limited to signing-date representations only.</strong> No ongoing disclosure obligation if opposition or environmental issues emerge during the multi-year term. Buyer's reputational exposure is not managed post-signing.` :
              `<strong>No reputational provisions.</strong> Seller may develop or operate a project with community opposition, environmental violations, or ESG issues with no obligation to notify buyer or cooperate on response. Buyer's brand fully exposed.`,
        bench: `CEBA standard: Seller reps/warranties on public opposition, environmental baseline, stewardship, wildlife, and cultural property mitigation. Ongoing disclosure if material changes occur during term. Cooperation provision for reputational response. CEBA: "The VPPA is a long-term relationship with lasting reputational impacts." ESG compliance and non-energy reporting increasingly expected by Fortune 500 buyers.`,
        impact: key === 'buyer' ? 'FULL CEBA SUITE' : key === 'market' ? 'CEBA STANDARD REPS' : key === 'seller' ? 'SIGNING DATE ONLY' : 'NO PROTECTION',
        impactsub: key === 'buyer' ? 'Full reps + ongoing disclosure<br>+ cooperation provision' : key === 'market' ? 'Public opposition, enviro<br>wildlife, cultural property reps' : key === 'seller' ? 'Signing-date reps only<br>no ongoing disclosure' : 'No ESG reps at all<br>buyer brand fully exposed',
        rec: key === 'red' ? 'Add CEBA reputational disclosure suite — public opposition, environmental baseline, stewardship, wildlife/cultural mitigation. VPPA is 12–20 year relationship. ESG issues that emerge mid-term create significant buyer reputational risk.' : key === 'seller' ? 'Add ongoing disclosure obligation for material changes to ESG factors during term. Signing-date-only reps leave buyer exposed for 12–20 years.' : 'Reputational provisions acceptable.',
        reclabel: key === 'red' ? 'Priority — Add CEBA Suite' : key === 'seller' ? 'Priority — Add Ongoing Disclosure' : 'Outcome — Acceptable'
      };
    }
  },

  // ─── RECs & FACILITY ATTRIBUTES ──────────────────────────────

  product: {
    getContent(p) {
      const key = p <= 25 ? 'buyer' : p <= 50 ? 'market' : p <= 75 ? 'seller' : 'red';
      return {
        term: key === 'buyer' ? `<strong>Buyer receives all Environmental Attributes associated with Buyer's Share of project output,</strong> transferred monthly as Green-e certifiable RECs. Future Environmental Attributes (new REC standards, carbon credits) included subject to cost cap. Buyer has discretion to sell, hold, or retire — bears risk and benefit of future attribute price changes.` :
              key === 'market' ? `<strong>Environmental Attributes (project-specific RECs) delivered monthly</strong> as Green-e certifiable RECs for Buyer's Share of output. Future attribute rights subject to good-faith negotiation. Buyer has full discretion on sell/hold/retire — bears future price risk and benefit. CEBA: industry standard product.` :
              key === 'seller' ? `<strong>RECs only — no future Environmental Attribute rights.</strong> Seller retains all capacity, ancillary services, and any new attribute classes. Buyer has no right of first refusal on future attributes as clean energy markets evolve.` :
              `<strong>Product definition minimal or RECs not Green-e certifiable.</strong> Seller retains all future attributes. CEBA: "In no event should buyers allow a seller to require a cost cap on RECs." Any cost cap applies only to future Environmental Attributes, not core RECs.`,
        bench: `CEBA standard: Monthly delivery of Green-e certifiable RECs for Buyer's Share. Future Environmental Attributes: seller certifies and obtains subject to cost cap ($/MW of Final Nameplate Capacity per year + aggregate cap). Environmental Attributes: ~100% to buyer. Incentives (ITC, capacity): ~100% to seller. Capacity/ancillaries: negotiated. Buyer bears risk and benefit of future attribute price changes.`,
        impact: key === 'buyer' ? 'GREEN-E + FUTURE ATTRS' : key === 'market' ? 'GREEN-E STANDARD' : key === 'seller' ? 'RECs ONLY' : 'MINIMAL PRODUCT',
        impactsub: key === 'buyer' ? 'Monthly Green-e RECs<br>+ future attribute rights' : key === 'market' ? 'Monthly Green-e RECs<br>industry standard' : key === 'seller' ? 'RECs only, no ROFR<br>on future attributes' : 'RECs not Green-e or<br>no cost cap protection',
        rec: key === 'red' ? 'CEBA: cost caps must never apply to core RECs — only to future Environmental Attributes. Ensure Green-e certification at seller\'s cost. Add right of first refusal on future attribute classes.' : key === 'seller' ? 'Seek right of first refusal on future Environmental Attributes. As carbon and biodiversity markets develop, new attribute classes can be material.' : 'Product definition acceptable. Confirm Green-e certification is at seller\'s cost and future attribute cost cap is reasonable ($/MW/year + aggregate).',
        reclabel: key === 'red' ? 'Priority — Fix Cost Cap Issue' : key === 'seller' ? 'Priority — Add ROFR' : 'Outcome — Acceptable'
      };
    }
  },

  recs: {
    getContent(p) {
      const key = p <= 25 ? 'buyer' : p <= 50 ? 'market' : p <= 75 ? 'seller' : 'red';
      const iso = DEAL.iso || 'ERCOT';
      return {
        term: key === 'buyer' ? `<strong>REC Arbitrage provision with technology and region designation.</strong> If seller cannot deliver project RECs (project offline, curtailment, etc.), seller must provide supplemental/replacement RECs specifying technology type (wind/solar) and region (${iso}, PJM, WREGIS, etc.) within 90 days. Replacement RECs at seller's cost. Buyer retains choice to accept cash LDs in lieu of RECs.` :
              key === 'market' ? `<strong>REC replacement obligation with technology and region specifications.</strong> If project RECs unavailable, seller sources equivalent vintage RECs of same technology type and applicable tracking system (WREGIS, ERCOT, PJM-GATS). CEBA: buyers should designate technology type and region for replacement RECs at term sheet stage.` :
              key === 'seller' ? `<strong>REC delivery only — no replacement obligation if project fails to deliver.</strong> If project is offline or curtailed, buyer has no contractual path to replacement RECs. Sustainability reporting gap risk.` :
              `<strong>No REC delivery mechanism or tracking system registration defined.</strong> Without RECs registered in applicable tracking system, buyer cannot make additionality or sustainability claims. VPPA without REC delivery is financial settlement only.`,
        bench: `CEBA standard: RECs registered in applicable tracking system (WREGIS, ERCOT, PJM-GATS). REC Arbitrage = supplemental/replacement RECs when seller cannot deliver. CEBA: specify technology type (wind/solar) and region at term sheet stage. Some buyers request 100–120% replacement to compensate for lost marketing claims from project-specific RECs. Buyers may choose cash LDs in lieu of replacement RECs.`,
        impact: key === 'buyer' ? 'REC ARBITRAGE — FULL' : key === 'market' ? 'REPLACEMENT + TECH/REGION' : key === 'seller' ? 'NO REPLACEMENT' : 'NO REC MECHANISM',
        impactsub: key === 'buyer' ? 'Tech + region specified<br>100–120% replacement option' : key === 'market' ? 'Tech + region specified<br>90-day replacement' : key === 'seller' ? 'Delivery only<br>no replacement if missed' : 'No tracking system<br>no sustainability claim',
        rec: key === 'red' ? 'Add REC delivery registered in applicable tracking system + REC arbitrage provision with technology and region specification. Without RECs, buyer cannot make additionality claims — defeats the purpose of a VPPA.' : key === 'seller' ? 'Add replacement REC obligation specifying technology type and region. Consider 100–120% replacement rate to compensate for lost project-specific marketing claims.' : 'REC delivery and replacement acceptable. Confirm technology type and region are specified for replacement RECs.',
        reclabel: key === 'red' ? 'Priority 1 — Add REC Mechanism' : key === 'seller' ? 'Priority — Add Replacement' : 'Outcome — Acceptable'
      };
    }
  },

  incentives: {
    getContent(p) {
      const key = p <= 25 ? 'buyer' : p <= 50 ? 'market' : p <= 75 ? 'seller' : 'red';
      return {
        term: key === 'buyer' ? `<strong>Buyer-favorable: At buyer's option, seller monetizes buyer's share of project capacity and ancillary services</strong> and pays buyer a percentage of net revenues. Environmental Attributes: 100% to buyer. Incentives (ITC/PTC): 100% to seller (standard). Capacity/ancillaries: buyer receives % of net revenues.` :
              key === 'market' ? `<strong>CEBA standard allocation.</strong> Environmental Attributes: ~100% buyer. Tax incentives (ITC/PTC), local credits, rebates, grants: ~100% seller. Facility Attributes (capacity, ancillary services): negotiated — sellers increasingly push for revenue sharing rather than full buyer allocation.` :
              key === 'seller' ? `<strong>Seller retains all incentives and facility attributes with no buyer participation</strong> and no obligation to notify buyer of material incentive changes (e.g., ITC transfer that affects project construction timeline).` :
              `<strong>No incentive provisions.</strong> Seller may monetize, transfer, or restructure ITCs without buyer knowledge or consent. ITC transfers can affect project construction quality and timeline — buyer has no notification right or remedy.`,
        bench: `CEBA: Environmental Attributes = buyer. Tax incentives = seller. Capacity/ancillaries = negotiated. CEBA advises working with cross-functional teams (utility, facilities) — demonstrating new capacity via PPA may provide leverage on utility rates. Buyers increasingly want to share capacity market value as non-environmental attribute markets evolve. Seller notification obligation for ITC/incentive changes is a baseline protection.`,
        impact: key === 'buyer' ? 'CAPACITY REVENUE SHARE' : key === 'market' ? 'CEBA STANDARD SPLIT' : key === 'seller' ? 'ALL TO SELLER — NO NOTICE' : 'NO PROVISIONS',
        impactsub: key === 'buyer' ? 'Buyer gets % of capacity<br>and ancillary revenues' : key === 'market' ? 'Attrs to buyer, tax to seller<br>capacity negotiated' : key === 'seller' ? 'Seller keeps all<br>no notification obligation' : 'Seller transfers ITCs<br>buyer has no notice right',
        rec: key === 'red' ? 'Add notification obligation for material incentive changes (ITC transfers, state incentive changes). ITC transfer without notice can affect construction timeline and quality. Add first right of refusal on capacity and ancillary revenue sharing.' : key === 'seller' ? 'Add seller notification obligation for ITC/incentive changes. Consider negotiating % of capacity and ancillary service revenues — CEBA notes these can provide meaningful utility rate leverage.' : 'Incentive allocation acceptable. Confirm seller notification obligation for material incentive changes is included.',
        reclabel: key === 'red' ? 'Priority — Add Notification' : key === 'seller' ? 'Priority — Add Notice + ROFR' : 'Outcome — Acceptable'
      };
    }
  },

  // ─── LEGAL & ADMINISTRATIVE ───────────────────────────────────

  govlaw: {
    getContent(p) {
      const key = p <= 25 ? 'buyer' : p <= 50 ? 'market' : p <= 75 ? 'seller' : 'red';
      return {
        term: key === 'buyer' ? `<strong>New York governing law.</strong> CEBA standard for financial energy contracts. NY courts have deep ISDA/financial contract jurisprudence. Dispute resolution via AAA arbitration, expedited track. Most buyers and lenders prefer NY law.` :
              key === 'market' ? `<strong>New York governing law.</strong> CEBA standard: "Since these are financial instruments, most parties agree on the use of New York law." Alternative is jurisdiction where project is located — most buyers and lenders do not prefer that.` :
              key === 'seller' ? `<strong>Governing law is seller's home state</strong> or project state jurisdiction. Less developed financial contract case law, potential home-court advantage for seller. CEBA and most lenders prefer NY law.` :
              `<strong>No governing law specified</strong> or non-standard jurisdiction. Creates enforcement risk and unpredictable dispute resolution outcome.`,
        bench: `CEBA standard: New York law. CEBA: "Since these are financial instruments, most parties agree on the use of New York law. The alternative is to use the law of the jurisdiction where the project is located, but most buyers and lenders do not prefer that." Texas law may be acceptable for ERCOT-specific deals; Delaware is also common.`,
        impact: key === 'buyer' ? 'NEW YORK — STANDARD' : key === 'market' ? 'NEW YORK — CEBA ALIGNED' : key === 'seller' ? "SELLER'S STATE" : 'NOT SPECIFIED',
        impactsub: key === 'buyer' ? 'NY law, ISDA-aligned<br>lender preferred' : key === 'market' ? 'NY law CEBA standard<br>deep financial contract law' : key === 'seller' ? "Seller's home state<br>lenders may resist" : 'No jurisdiction defined<br>enforcement risk',
        rec: key === 'red' ? 'Specify New York governing law. CEBA standard — most lenders will require NY law for project financing. Undefined jurisdiction creates enforcement risk.' : key === 'seller' ? 'Push for New York law. Seller home state jurisdiction is non-standard — lenders and financiers typically require NY law.' : 'Governing law acceptable.',
        reclabel: key === 'red' ? 'Priority — Specify NY Law' : key === 'seller' ? 'Priority — Push for NY' : 'Outcome — CEBA Aligned'
      };
    }
  },

  conf: {
    getContent(p) {
      const key = p <= 25 ? 'buyer' : p <= 50 ? 'market' : p <= 75 ? 'seller' : 'red';
      return {
        term: key === 'buyer' ? `<strong>Confidentiality coterminous with agreement + 3-year post-termination tail.</strong> Contents of term sheet and VPPA may not be shared beyond buyer, seller, and their advisors. Strong protection for pricing, volumes, and party identities. Financing party disclosure requires recipient NDA.` :
              key === 'market' ? `<strong>CEBA standard: Term sheet subject to NDA entered into between parties.</strong> VPPA will have its own confidentiality provisions. Contents not shared beyond buyer, seller, and advisors. CEBA: VPPA itself should contain separate, standalone confidentiality provisions beyond term sheet NDA.` :
              key === 'seller' ? `<strong>Confidentiality period is short (1-year tail) or contains broad carve-outs</strong> allowing seller to disclose pricing to financing parties, potential acquirers, or equity investors without restriction.` :
              `<strong>No meaningful confidentiality provision.</strong> Pricing, volumes, and buyer identity freely disclosable. Competitive intelligence exposed to market.`,
        bench: `CEBA standard: Term sheet subject to NDA; VPPA contains standalone confidentiality provisions. Standard carve-outs: legal/regulatory disclosure, financing disclosures (under NDA), board/advisor sharing. Pricing and buyer identity must be protected throughout term + 2-year minimum tail.`,
        impact: key === 'buyer' ? 'TERM + 3-YR TAIL' : key === 'market' ? 'NDA + VPPA PROVISIONS' : key === 'seller' ? 'WEAK / SHORT TAIL' : 'NO CONFIDENTIALITY',
        impactsub: key === 'buyer' ? '3yr tail, financing<br>disclosure under NDA only' : key === 'market' ? 'Term sheet NDA + VPPA<br>standalone provisions' : key === 'seller' ? '1yr tail or broad<br>financing carve-outs' : 'Pricing and buyer<br>identity fully exposed',
        rec: key === 'red' ? 'Add standalone confidentiality provisions in VPPA (beyond term sheet NDA). Pricing exposure creates competitive disadvantage in future PPA negotiations.' : key === 'seller' ? 'Extend tail to 2 years minimum. Require NDA for financing party disclosures — unrestricted financing disclosure exposes pricing to potential acquirers.' : 'Confidentiality acceptable. Confirm VPPA will contain standalone confidentiality provisions beyond the term sheet NDA.',
        reclabel: key === 'red' ? 'Priority — Add Provisions' : key === 'seller' ? 'Priority — Strengthen Tail' : 'Outcome — Acceptable'
      };
    }
  },

  excl: {
    getContent(p) {
      const key = p <= 25 ? 'buyer' : p <= 50 ? 'market' : p <= 75 ? 'seller' : 'red';
      return {
        term: key === 'buyer' ? `<strong>No exclusivity obligation on buyer</strong> for competing projects of same capacity. Seller committed to buyer's capacity tranche only.` :
              key === 'market' ? `<strong>60-day mutual exclusivity from term sheet signing.</strong> Neither party entertains or enters into discussions inconsistent with consummation of the transaction. CEBA standard: 60 days is market norm. Neither party may advertise project (seller) or search for competing project (buyer) for same capacity during period.` :
              key === 'seller' ? `<strong>90+ day exclusivity or overly broad scope</strong> — prevents buyer from negotiating any VPPA, not just competing transactions for the same capacity tranche.` :
              `<strong>Open-ended exclusivity with no defined outside date.</strong> Buyer locked indefinitely — cannot pursue competing projects without breaching term sheet.`,
        bench: `CEBA standard: 60 days from term sheet signing. Scope: prevents advertising the project (seller) or searching for a new project (buyer) for the same capacity. CEBA: mutual exclusivity — both parties restricted. 60 days is market norm; longer periods require compelling justification.`,
        impact: key === 'buyer' ? 'NO EXCLUSIVITY' : key === 'market' ? '60-DAY MUTUAL' : key === 'seller' ? '90+ DAYS — BROAD' : 'OPEN-ENDED',
        impactsub: key === 'buyer' ? 'Buyer free to negotiate<br>competing projects' : key === 'market' ? '60-day mutual, CEBA norm<br>both parties restricted' : key === 'seller' ? '90+ days too long<br>overly broad scope' : 'No end date defined<br>buyer locked indefinitely',
        rec: key === 'red' ? 'Add 60-day exclusivity with defined outside date. Open-ended exclusivity is unacceptable — buyer should not be locked indefinitely without a signed contract.' : key === 'seller' ? 'Reduce to 60 days. Narrow scope to specific capacity tranche only — buyer should not be barred from all VPPA activity.' : 'Exclusivity acceptable.',
        reclabel: key === 'red' ? 'Priority — Add End Date' : key === 'seller' ? 'Priority — Narrow / Shorten' : 'Outcome — Acceptable'
      };
    }
  },

  expenses: {
    getContent(p) {
      const key = p <= 25 ? 'buyer' : p <= 50 ? 'market' : p <= 75 ? 'seller' : 'red';
      return {
        term: key === 'buyer' ? `<strong>Each party bears its own legal, diligence, and advisory costs</strong> — no cost shifting in any scenario. Market standard. Legal fees typically $50–150K+ per side on VPPA negotiations.` :
              key === 'market' ? `<strong>Each party responsible for its own costs</strong> in connection with negotiating, executing, and consummating the VPPA. No cost recovery provision in any direction.` :
              key === 'seller' ? `<strong>Buyer responsible for certain seller costs</strong> if buyer terminates during exclusivity period — creates de facto break fee. CEBA: this is non-standard and should be rejected.` :
              `<strong>Buyer liable for seller's costs if deal does not close, regardless of fault.</strong> Creates significant financial disincentive to exercise legitimate contract rights (e.g., OCOD termination, CP failure termination).`,
        bench: `CEBA standard: Each party bears its own expenses. Any cost-shifting triggered by buyer termination is non-standard and should be rejected. CEBA makes no mention of break fee provisions — they are not standard. Legal fees: $50–150K+ per side is typical.`,
        impact: key === 'buyer' ? 'EACH BEARS OWN' : key === 'market' ? 'EACH BEARS OWN' : key === 'seller' ? 'BUYER BREAK FEE' : 'BUYER PAYS ALL',
        impactsub: key === 'buyer' ? 'No cost recovery risk<br>market standard' : key === 'market' ? 'CEBA standard<br>no cost shifting' : key === 'seller' ? 'Buyer owes seller costs<br>if terminates — break fee' : 'Buyer pays seller costs<br>regardless of fault',
        rec: key === 'red' ? 'Reject cost-shifting provisions. Buyer liability for seller costs is non-standard and creates unjust deterrent to exercising legitimate termination rights (OCOD, CP failure). CEBA standard: each party bears own expenses.' : key === 'seller' ? 'Remove break fee. Cost-shifting during exclusivity is non-standard.' : 'Expense allocation acceptable.',
        reclabel: key === 'red' ? 'Priority — Reject Cost Shift' : key === 'seller' ? 'Priority — Remove Break Fee' : 'Outcome — Acceptable'
      };
    }
  },

  acct: {
    getContent(p) {
      const key = p <= 25 ? 'buyer' : p <= 50 ? 'market' : p <= 75 ? 'seller' : 'red';
      return {
        term: key === 'buyer' ? `<strong>VPPA structured as ASC 815 derivative.</strong> Fixed-for-floating swap — not a contract for physical delivery. Buyer's Share expressed as % of capacity (not fixed MWh) to avoid guaranteed production volume that could trigger derivative accounting. Buyer's Share capped at 90% to avoid lease treatment. Mark-to-market changes recorded in OCI or P&L depending on hedge designation.` :
              key === 'market' ? `<strong>VPPA qualifies as ASC 815 derivative — financial settlement, not physical delivery.</strong> CEBA: Buyer's Share should be % of capacity (not fixed MWh) to avoid inadvertent Guaranteed Annual Production structure. Cap at 90% for lease accounting avoidance. Engage accounting team early — settlements may interact with other energy procurement transactions.` :
              key === 'seller' ? `<strong>Accounting treatment not addressed or Buyer's Share structured as fixed MWh.</strong> Fixed MWh structure can trigger Guaranteed Annual Production treatment, potentially requiring derivative accounting or balance sheet capitalization. CEBA Accounting Primer strongly recommends % of capacity structure.` :
              `<strong>VPPA structured as physical delivery or Buyer's Share fixed MWh with production guarantee.</strong> Physical delivery may trigger NPNS (Normal Purchases/Sales) exception — eliminates hedge accounting benefits. Fixed MWh guarantee may require balance sheet capitalization. High accounting risk.`,
        bench: `CEBA: Engage accounting team early. Key accounting decisions: (1) Buyer's Share as % of capacity (not fixed MWh) — avoids Guaranteed Annual Production risk; (2) Cap at 90% — avoids lease treatment; (3) Fixed-for-floating structure not physical delivery — preserves ASC 815 derivative treatment. CEBA has dedicated Accounting Primer — review before finalizing term sheet structure.`,
        impact: key === 'buyer' ? 'ASC 815 + % CAPACITY' : key === 'market' ? 'DERIVATIVE — STANDARD' : key === 'seller' ? 'FIXED MWH — REVIEW NEEDED' : 'PHYSICAL / HIGH RISK',
        impactsub: key === 'buyer' ? '% of capacity, 90% cap<br>derivative treatment confirmed' : key === 'market' ? 'ASC 815 derivative<br>% capacity, 90% cap' : key === 'seller' ? 'Fixed MWh structure<br>confirm accounting treatment' : 'Physical delivery or fixed<br>MWh — Big 4 review required',
        rec: key === 'red' ? 'Urgent: engage Big 4 accounting team before proceeding. Physical delivery or fixed MWh structures can trigger NPNS exception or derivative accounting requiring capitalization. Review CEBA Accounting Primer.' : key === 'seller' ? 'Convert Buyer\'s Share to % of capacity. Review CEBA Accounting Primer. Fixed MWh structure creates Guaranteed Annual Production risk. Cap Buyer\'s Share at 90%.' : 'Accounting structure acceptable. Confirm with internal accounting team: (1) % of capacity confirmed, (2) 90% cap in place, (3) financial (not physical) settlement structure.',
        reclabel: key === 'red' ? 'Priority 1 — Accounting Review' : key === 'seller' ? 'Priority — Fix Structure' : 'Outcome — Confirm Internally'
      };
    }
  },

  publicity: {
    getContent(p) {
      const key = p <= 25 ? 'buyer' : p <= 50 ? 'market' : p <= 75 ? 'seller' : 'red';
      return {
        term: key === 'buyer' ? `<strong>Mutual prior written consent required for all press releases and public statements.</strong> Buyer name and contract relationship: not publicized without buyer consent. Financing party name: not publicized without financing party consent. CEBA: buyers may wish to have exclusive naming or other publicity rights.` :
              key === 'market' ? `<strong>CEBA standard: Buyer's name and contract relationship not publicized other than by or with consent of Buyer.</strong> No financing party's name publicized without consent. CEBA: "Developers should always consult with the buyer before any public statements are made regarding the project." Often includes mutual consent prior to any press release identifying the other party.` :
              key === 'seller' ? `<strong>Seller may issue press release or public statement announcing buyer and project</strong> without buyer pre-approval. Seller financing roadshows are common — but must still require buyer pre-approval under CEBA standard.` :
              `<strong>No publicity restrictions.</strong> Seller can publicly announce buyer's name, deal size, and terms freely — exposing renewable strategy, pricing, and competitive position to market and potential activist opposition.`,
        bench: `CEBA standard: Buyer name and contract relationship not publicized without buyer consent. Financing party name protected similarly. CEBA: "Developers should always consult with the buyer before any public statements are made." Mutual consent before press releases is increasingly standard. Buyers may seek exclusive naming rights.`,
        impact: key === 'buyer' ? 'MUTUAL CONSENT' : key === 'market' ? 'CEBA STANDARD' : key === 'seller' ? 'SELLER CAN ANNOUNCE' : 'NO RESTRICTIONS',
        impactsub: key === 'buyer' ? 'Mutual prior written consent<br>exclusive naming option' : key === 'market' ? 'Buyer consent required<br>CEBA standard' : key === 'seller' ? 'Seller may announce buyer<br>without pre-approval' : 'Fully exposed<br>competitive + ESG risk',
        rec: key === 'red' ? 'Add mutual consent requirement. CEBA: developer should always consult buyer before public statements. Unrestricted announcement exposes pricing, strategy, and buyer identity to competitors and potential activists.' : key === 'seller' ? 'Require buyer pre-approval for all press releases. Seller financing roadshows are common — buyer should control its own announcement timing and messaging.' : 'Publicity rights acceptable.',
        reclabel: key === 'red' ? 'Priority — Add Consent Req.' : key === 'seller' ? 'Priority — Require Pre-Approval' : 'Outcome — CEBA Aligned'
      };
    }
  }

};

// ═══════════════════════════════════════════════════════════════
// VALIDATION — ensure every term in groups has meta + content
// ═══════════════════════════════════════════════════════════════

(function validateTerms() {
  if (typeof window === 'undefined') return; // skip in Node
  const allGroupTerms = SCORECARD_GROUPS.flatMap(g => g.terms);
  allGroupTerms.forEach(t => {
    if (!TERM_META[t]) console.warn('MISSING META:', t);
    if (!CONTENT[t]) console.warn('MISSING CONTENT:', t);
  });
  Object.keys(TERM_META).forEach(t => {
    if (!allGroupTerms.includes(t)) console.warn('ORPHANED META:', t);
  });
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { DEAL, ZONES, getZone, SCORECARD_GROUPS, TERM_META, CONTENT };
}
