// netlify/functions/analyze.js
// Pass 1: Haiku extracts structured facts → scoring-engine.js scores deterministically
const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_VERSION = '2023-06-01';

const SYSTEM_PROMPT = `You are a VPPA/PPA term sheet fact extractor. Return ONLY valid JSON — no prose, no markdown.

Your job is EXTRACTION ONLY — find and return what the document says. Do not score. Do not judge.

For every field, use ONLY these values:
- The actual value found in the document
- null if the field is genuinely absent or cannot be determined

Return this exact JSON structure:

{
  "deal": {
    "buyer": "string or null",
    "developer": "string or null",
    "project": "string or null",
    "iso": "ERCOT|CAISO|PJM|MISO|SPP|ISO-NE|NYISO or null",
    "technology": "Solar|Wind|null",
    "assetType": "new_build|existing|null",
    "capacity": "string or null",
    "buyerShare": "string or null",
    "strikePrice": number or null,
    "escalatorPct": number or null,
    "escalatorType": "fixed|cpi|cpi_spread|null",
    "term": "string or null",
    "cod": "string or null"
  },
  "strike": {
    "strikePrice": number or null,
    "escalatorPct": number or null,
    "escalatorType": "fixed|cpi|cpi_spread|null"
  },
  "floating": {
    "settlementType": "hub|zonal|nodal|not_specified|null",
    "addersIncluded": "all_in|partial|excluded|not_specified|null",
    "nodeToHubSpread": number or null
  },
  "interval": {
    "settlementInterval": "iso_native|hourly|monthly|annual|not_specified|null",
    "priceReference": "real_time|day_ahead|not_specified|null"
  },
  "negprice": {
    "negPriceMechanism": "zero_floor|seller_curtails|full_passthrough|not_specified|null",
    "hoursCap": number or null,
    "priceFloor": number or null,
    "annualAggregateCap": true or false or null
  },
  "invoice": {
    "invoiceFrequency": "monthly|quarterly|annual|not_specified|null",
    "paymentTermsDays": number or null,
    "netting": "yes|no|not_specified|null",
    "disputeMechanism": "withhold_disputed|pay_then_dispute|not_specified|null",
    "latePaymentRate": "low|moderate|high|not_specified|null",
    "trueUp": "monthly|quarterly|annual|none|not_specified|null"
  },
  "basis": {
    "basisAllocation": "seller_bears|shared_collar|buyer_bears|not_specified|null",
    "busbarTransfer": "present|absent|not_specified|null",
    "busbarTrigger": "standard_node_plus_ppa|lower_threshold|not_specified|null",
    "busbarHoursCap": number or null,
    "collarBand": number or null
  },
  "marketdisrupt": {
    "disruptionDefined": "yes|no|not_specified|null",
    "settlementTreatment": "suspend|fallback_average|fallback_last|settle_normal|not_specified|null",
    "fallbackCapPrice": number or null,
    "terminationRight": "buyer|mutual|seller|none|not_specified|null",
    "terminationTriggerDays": number or null,
    "disruptionEventCount": number or null
  },
  "scheduling": {
    "schedulingControl": "iso_dispatch|seller_schedules|buyer_approval|not_specified|null",
    "outageNotification": "advance_required|best_efforts|none|not_specified|null",
    "notificationWindowDays": number or null,
    "antiGaming": "present|absent|not_specified|null",
    "maintenanceCoordination": "buyer_consent|buyer_consultation|seller_discretion|not_specified|null"
  },
  "curtailment": {
    "econCurtailmentAllocation": "seller_bears_deemed|shared|buyer_bears|not_specified|null",
    "curtailmentCap": number or null,
    "deemedGenMethod": "weather_adjusted|capacity_factor|contractual_formula|not_specified|null"
  },
  "nonecocurtail": {
    "nonEconCurtailAllocation": "seller_bears_deemed|shared|buyer_bears|not_specified|null",
    "nonEconCurtailCap": number or null,
    "nonEconDeemedGenMethod": "weather_adjusted|capacity_factor|contractual_formula|not_specified|null"
  },
  "basiscurtail": {
    "basisCurtailAllocation": "seller_bears_deemed|shared|buyer_bears|not_specified|null",
    "basisCurtailCap": number or null,
    "basisDeemedGenMethod": "weather_adjusted|capacity_factor|contractual_formula|not_specified|null"
  },
  "ia": {
    "iaStatus": "fully_executed|facilities_study_complete|system_impact_complete|feasibility_stage|not_filed|not_specified|null",
    "networkUpgradeCosts": "defined_and_capped|defined_uncapped|undefined|not_specified|null",
    "iaAsCP": "yes|no|not_specified|null"
  },
  "cp": {
    "buyerCPCount": number or null,
    "buyerTerminationRight": "yes|no|not_specified|null",
    "sellerCPCount": number or null,
    "cpDeadlineMonths": number or null,
    "cpSatisfactionNotice": "required|not_required|not_specified|null"
  },
  "delay": {
    "guaranteedCOD": "yes|no|not_specified|null",
    "delayDamagesPresent": "yes|no|not_specified|null",
    "delayDamagesRate": number or null,
    "gracePeriodDays": number or null,
    "damagesCapStructure": "project_cost_pct|months_capped|both|none|not_specified|null",
    "damagesCapValue": number or null,
    "longstopMonths": number or null,
    "buyerTerminationAtLongstop": "yes|no|not_specified|null",
    "delaySecurityBacked": "lc|parent_guaranty|both|none|not_specified|null",
    "excusedDelays": "narrow|moderate|broad|not_specified|null"
  },
  "availmech": {
    "availGuaranteePct": number or null,
    "measurementMethod": "time_based|energy_weighted|not_specified|null",
    "shortfallRemedy": "deemed_generation|liquidated_damages|none|not_specified|null",
    "exclusionScope": "narrow|standard|broad|not_specified|null",
    "terminationRight": "yes|no|not_specified|null",
    "maintenanceCapDays": number or null
  },
  "availguaranteed": {
    "productionGuarantee": "yes|no|not_specified|null",
    "pValue": "P50|P75|P90|other|not_specified|null",
    "measurementPeriod": "annual|rolling_2yr|rolling_3yr|not_specified|null",
    "resourceNormalized": "yes|no|not_specified|null",
    "shortfallRemedy": "deemed_generation|liquidated_damages|make_whole|none|not_specified|null",
    "excessGenTreatment": "buyer_receives_all|capped|clawback|not_specified|null",
    "terminationRight": "yes|no|not_specified|null"
  },
  "permit": {
    "permitStatus": "all_obtained|major_obtained|in_progress|not_started|not_specified|null",
    "permitAsCP": "yes|no|not_specified|null"
  },
  "cod": {
    "codDefinitionStrength": "tight_objective|moderate|loose_substantial|not_specified|null",
    "capacityThreshold": number or null,
    "performanceTest": "full_capacity_demo|nameplate_only|none|not_specified|null",
    "documentaryDeliverables": "comprehensive|partial|minimal|not_specified|null",
    "buyerVerificationRight": "review_and_confirm|notice_only|seller_self_certifies|not_specified|null",
    "independentEngineer": "required|optional|none|not_specified|null",
    "partialCOD": "not_allowed|allowed_with_conditions|allowed_unrestricted|not_specified|null"
  },
  "buyerpa": {
    "buyerCreditRating": "ig|non_ig|not_specified|null",
    "collateralType": "unsecured|parent_guaranty|lc|cash|lc_plus_mtm|cash_plus_mtm|not_specified|null",
    "coverageBasis": "6_months|12_months|not_specified|null",
    "fixedAmountPerMW": number or null,
    "downgradeTrigger": "sub_ig_only|multiple_tiers|none|not_specified|null",
    "downgradeCurePeriod": number or null,
    "downgradeSubstitution": "guaranty_allowed|lc_only|cash_only|not_specified|null",
    "thresholdStructure": "threshold|independent_amount|not_specified|null"
  },
  "sellerpa": {
    "preCODCreditType": "ig_sponsor_guaranty|sponsor_guaranty|lc|cash|spv_only|not_specified|null",
    "preCODSizingPerMW": number or null,
    "completionGuaranty": "yes|no|not_specified|null",
    "creditSurvivesFinancing": "yes|no|not_specified|null",
    "postCODCreditType": "ig_sponsor_guaranty|sponsor_guaranty|lc|spv_only|none|not_specified|null",
    "postCODSizingPerMW": number or null,
    "stepDownTiming": "after_all_cod_tests|at_cod|at_mechanical_completion|at_financial_close|not_specified|null",
    "downgradeTrigger": "yes|no|not_specified|null"
  },
  "assign": {
    "buyerAssignRight": "free|consent_not_unreasonably_withheld|consent_required|no_assignment|not_specified|null",
    "buyerAffiliateTransfer": "permitted|not_permitted|not_specified|null",
    "sellerAssignRight": "free|consent_not_unreasonably_withheld|consent_required|no_assignment|not_specified|null",
    "sellerAffiliateTransfer": "permitted|not_permitted|not_specified|null",
    "lenderAssignment": "permitted|consent_required|not_addressed|not_specified|null",
    "assigneeCreditRequirement": "must_meet_original_standards|no_requirement|not_specified|null"
  },
  "fm": {
    "fmDefinitionScope": "narrow_objective|moderate|broad_subjective|not_specified|null",
    "paymentObligations": "continue|excused|not_specified|null",
    "supplyChainExcluded": "yes|no|not_specified|null",
    "economicHardshipExcluded": "yes|no|not_specified|null",
    "equipmentFailureExcluded": "yes|no|not_specified|null",
    "transmissionCongestionExcluded": "yes|no|not_specified|null",
    "pandemicTreatment": "excluded|performance_based_only|broad_inclusion|not_specified|null",
    "fmDurationMonths": number or null,
    "terminationRight": "buyer|mutual|seller|none|not_specified|null",
    "notificationRequirement": "prompt_with_mitigation|notice_only|none|not_specified|null",
    "codExtensionForFM": "no|limited|automatic|not_specified|null"
  },
  "eod": {
    "longstopCODDefault": "yes|no|not_specified|null",
    "abandonmentTrigger": "objective_test|subjective|none|not_specified|null",
    "paymentCureDays": number or null,
    "creditSupportCureDays": number or null,
    "materialBreachCureDays": number or null,
    "cureExtensionRight": "none|limited|unlimited_diligent_pursuit|not_specified|null",
    "crossDefault": "broad|limited|none|not_specified|null",
    "downgradeAsEOD": "no_collateral_posting|yes_eod|not_specified|null",
    "creditFailureAsEOD": "yes|no|not_specified|null",
    "eodTriggerStandard": "objective|mixed|subjective_mae|not_specified|null"
  },
  "eterm": {
    "terminationStructure": "two_way_mtm|two_way_formula|one_way_buyer_pays|walk_away|not_specified|null",
    "preCODSellerPayment": "full_replacement_value|return_of_security_only|none|not_specified|null",
    "sellerPaymentCap": "uncapped|capped_at_credit_support|fixed_cap|not_specified|null",
    "valuationMethod": "dealer_quotes|objective_forward_curve|independent_expert|sole_discretion|not_specified|null",
    "disputeResolution": "independent_expert|arbitration|none|not_specified|null",
    "discountRate": "market_consistent|contractually_defined_reasonable|high_or_seller_determined|not_specified|null",
    "generationAssumptions": "objective_capacity_factor|historical_actual|seller_determined|not_specified|null"
  },
  "changeinlaw": {
    "strikeFixed": "yes_regardless|relief_for_illegality_only|reopener_defined_events|strike_adjusts|not_specified|null",
    "taxCreditTreatment": "seller_absorbs|relief_only_discriminatory|strike_reprices|not_specified|null",
    "tariffTreatment": "seller_absorbs|not_change_in_law|change_in_law_relief|not_specified|null",
    "economicImpactStandard": "illegality_impossibility|discriminatory_project_specific|broad_material_adverse|not_specified|null",
    "reopenerMechanism": "none|negotiate_then_terminate|automatic_adjustment|not_specified|null",
    "preCODProtection": "seller_obligated|termination_if_illegal|broad_relief|not_specified|null",
    "postCODProtection": "illegality_only|targeted_relief|broad_relief|not_specified|null",
    "financingTermsAsRelief": "excluded|included|not_specified|null"
  },
  "reputation": {
    "reputationTerminationRight": "buyer_right|mutual|none|not_specified|null",
    "sellerComplianceReps": "comprehensive|standard|minimal|none|not_specified|null",
    "reputationEventDefinition": "objective_defined|subjective_buyer_discretion|not_defined|not_specified|null",
    "sellerAssignmentApproval": "buyer_approval_includes_reputation|creditworthiness_only|no_approval|not_specified|null",
    "communityOppositionProvision": "addressed|not_addressed|not_specified|null"
  },
  "product": {
    "environmentalAttributes": "all_conveyed|partial_carveouts|not_defined|not_specified|null",
    "futureAttributes": "included|excluded|not_addressed|not_specified|null",
    "bundledStructure": "bundled|unbundled|not_specified|null",
    "projectSpecific": "yes|portfolio_generic|not_specified|null",
    "capacityAncillaryTreatment": "buyer_shares|seller_retains_explicit|seller_retains_silent|not_specified|null",
    "storageHybridAddressed": "yes|no|not_applicable|not_specified|null",
    "additionalityClaim": "new_build|existing|not_addressed|not_specified|null",
    "settlementDefinitionClarity": "clear_hub_node|vague|not_defined|not_specified|null"
  },
  "recs": {
    "deliveryTiming": "monthly|quarterly|annual|long_lag|not_specified|null",
    "replacementObligation": "yes|cash_only|none|not_specified|null",
    "replacementQuality": "same_tech_same_region|same_region_any_renewable|any_national_rec|not_specified|null",
    "vintageMatching": "strict_match|loose_banking|not_specified|null",
    "registryExplicit": "yes_seller_transfers|yes_buyer_responsible|not_specified|null",
    "shortfallDamages": "full_replacement_cost|market_value_cash|fixed_ld|capped_below_market|none|not_specified|null",
    "transferFees": "seller_pays|buyer_pays|not_specified|null"
  },
  "incentives": {
    "taxCreditAllocation": "buyer_shares_upside|seller_retains_strike_reflects|seller_retains_no_transparency|not_specified|null",
    "bonusCreditAllocation": "reflected_in_strike|seller_retains|shared|not_addressed|not_specified|null",
    "transferabilityValueSharing": "buyer_benefits|seller_retains|shared|not_addressed|not_specified|null",
    "incrementalIncentives": "buyer_shares|seller_retains|not_addressed|not_specified|null",
    "stateLocalIncentives": "reflected_in_strike|seller_retains|shared|not_addressed|not_specified|null",
    "incentiveTransparency": "seller_discloses|no_disclosure|not_specified|null"
  },
  "govlaw": {
    "governingLaw": "new_york|delaware|buyer_home_state|project_state|other|not_specified|null",
    "disputeResolution": "arbitration|litigation|mediation_then_arbitration|mediation_then_litigation|not_specified|null",
    "venue": "buyer_favorable|neutral|seller_favorable|not_specified|null",
    "juryWaiver": "yes|no|not_specified|null",
    "expertDetermination": "yes_for_technical|no|not_specified|null"
  },
  "conf": {
    "confScope": "narrow_pricing_only|standard_all_terms|broad_existence_included|not_specified|null",
    "esgReportingCarveout": "explicit|implied|none|not_specified|null",
    "regulatoryFilingCarveout": "yes|no|not_specified|null",
    "affiliateDisclosure": "permitted|not_permitted|not_specified|null",
    "survivalPeriod": "two_years_or_less|three_to_five_years|indefinite|not_specified|null",
    "mutualObligation": "mutual|buyer_only|not_specified|null"
  },
  "excl": {
    "sellerOutputExclusivity": "full_project_committed|partial_project|not_specified|null",
    "buyerExclusivity": "none|limited_same_iso|broad|not_specified|null",
    "attributeExclusivity": "all_to_buyer|some_retained|not_specified|null",
    "negotiationExclusivity": "none|time_limited|open_ended|not_specified|null"
  },
  "expenses": {
    "legalFees": "each_own|shared|buyer_bears|not_specified|null",
    "ongoingAdminCosts": "seller_bears|shared|buyer_bears|not_specified|null",
    "registryFees": "seller_pays|buyer_pays|shared|not_specified|null",
    "ieAndStudyCosts": "seller_bears|shared|buyer_bears|not_specified|null"
  },
  "acct": {
    "accountingRepresentations": "both_parties|buyer_only|none|not_specified|null",
    "hedgeAccountingLanguage": "supportive_structure|neutral|problematic_features|not_specified|null",
    "taxIndemnity": "mutual|one_way_buyer|none|not_specified|null",
    "changeInAccountingTreatment": "no_relief|reopener|termination_right|not_specified|null"
  },
  "publicity": {
    "jointAnnouncementRequired": "yes_mutual_approval|notification_only|no_restriction|not_specified|null",
    "buyerPublicityRight": "broad_esg_marketing|limited_with_approval|restricted|not_specified|null",
    "sellerUseOfBuyerName": "prohibited_without_consent|permitted_with_notice|unrestricted|not_specified|null",
    "logoTrademarkRestriction": "prior_written_consent|permitted|not_addressed|not_specified|null",
    "approvalProcess": "prior_written_consent|reasonable_advance_notice|no_process|not_specified|null"
  }
}

Party name extraction patterns:
- "Seller:\\n\\nDeveloper X" → developer = "X" (strip "Developer " prefix)
- "Buyer:\\n\\nBuyer X" → buyer = "X" (strip "Buyer " prefix)
- "X (on behalf of Buyer)" → buyer = "X"
- "Target Commercial Operation Date:\\n\\nAPRIL 1, 2027" → cod = "April 1, 2027"

Settlement interval: If term sheet says "5-minute intervals as utilized by CAISO/PJM/MISO/SPP/ISO-NE" → settlementInterval = "iso_native". If "15-minute as utilized by ERCOT" → "iso_native". "Hourly" → "hourly". "Monthly" → "monthly".`;

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

    // Truncate but preserve beginning (party names, key terms) and end (signature block)
    let truncatedText;
    if (termSheet.length > 10000) {
      truncatedText = termSheet.substring(0, 8000) + '\n...[middle truncated]...\n' + termSheet.substring(termSheet.length - 2000);
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
        model: 'claude-haiku-4-5',
        max_tokens: 3000,
        system: SYSTEM_PROMPT,
        messages: [{
          role: 'user',
          content: `Extract all facts from this VPPA/PPA term sheet. Return only the JSON structure.\n\nTerm sheet:\n${truncatedText}`
        }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error ${response.status}: ${errorText.substring(0, 200)}`);
    }

    const data = await response.json();
    const content = data.content?.[0]?.text || '';
    console.log('HAIKU FACTS (first 500):', content.substring(0, 500));

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found in response');

    const facts = JSON.parse(jsonMatch[0]);

    // Regex overrides for party names and COD — Haiku sometimes misses these
    const buyerMatch =
      termSheet.match(/^Buyer:\s*\n\n\s*(?:Buyer\s+)?([A-Z][^\n]+)/m) ||
      termSheet.match(/([A-Z][A-Za-z0-9\s,\.&'-]{2,60}?)\s*\(on behalf of (?:Buyer|Purchaser)\)/i);
    if (buyerMatch) facts.deal.buyer = buyerMatch[1].trim();

    const sellerMatch =
      termSheet.match(/^Seller:\s*\n\n\s*(?:Developer\s+|Seller\s+)?([A-Z][^\n]+)/m) ||
      termSheet.match(/([A-Z][A-Za-z0-9\s,\.&'-]{2,60}?)\s*\(on behalf of (?:Seller|Developer)\)/i);
    if (sellerMatch) facts.deal.developer = sellerMatch[1].trim();

    const projectMatch = termSheet.match(/^Project:\s*\n\n\s*([A-Z][^\n]+)/m);
    if (projectMatch) facts.deal.project = projectMatch[1].trim();

    const codPatterns = [
      /Target(?:ed)?\s+Commercial\s+Operation\s+Date[^:]*:\s*\n\n\s*([^\n]+)/im,
      /\bTCOD[^:]*:\s*\n\n\s*([^\n]+)/im,
      /Target(?:ed)?\s+Commercial\s+Operation\s+Date[^:]*:\s*([A-Za-z]+\s+\d{1,2},?\s*\d{4}|Q\d\s*\d{4})/i,
    ];
    for (const pat of codPatterns) {
      const m = termSheet.match(pat);
      if (m) {
        const dateOnly = m[1].trim().match(/([A-Za-z]+\s+\d{1,2},?\s*\d{4}|Q\d[\s/]*\d{4}|\d{4})/);
        if (dateOnly) { facts.deal.cod = dateOnly[1]; break; }
      }
    }

    console.log('DEAL EXTRACTED:', JSON.stringify(facts.deal));

    // Return raw facts — scoring engine runs client-side
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ facts, _source: 'haiku_extraction' })
    };

  } catch (error) {
    console.error('Extraction error:', error.message);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Extraction failed', message: error.message })
    };
  }
};
