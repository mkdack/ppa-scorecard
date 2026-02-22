// netlify/functions/analyze.js
// Pass 1: Haiku extracts structured facts → scoring-engine.js scores client-side
const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_VERSION = '2023-06-01';

const SYSTEM_PROMPT = `You are a VPPA/PPA term sheet fact extractor. Return ONLY valid JSON.

Rules:
- Use null for fields not present in the document
- Use "not_specified" when the topic is mentioned but the value is unclear
- Enums are self-explanatory from field names — pick the closest match
- Numbers are plain numbers (no units or symbols)

Return this exact JSON structure with all keys present:

{
  "deal": {"buyer":null,"developer":null,"project":null,"iso":null,"technology":null,"assetType":null,"capacity":null,"buyerShare":null,"strikePrice":null,"escalatorPct":null,"escalatorType":null,"term":null,"cod":null},
  "strike": {"strikePrice":null,"escalatorPct":null,"escalatorType":null},
  "floating": {"settlementType":null,"addersIncluded":null,"nodeToHubSpread":null},
  "interval": {"settlementInterval":null,"priceReference":null},
  "negprice": {"negPriceMechanism":null,"hoursCap":null,"priceFloor":null,"annualAggregateCap":null},
  "invoice": {"invoiceFrequency":null,"paymentTermsDays":null,"netting":null,"disputeMechanism":null,"latePaymentRate":null,"trueUp":null},
  "basis": {"basisAllocation":null,"busbarTransfer":null,"busbarTrigger":null,"busbarHoursCap":null,"collarBand":null},
  "marketdisrupt": {"disruptionDefined":null,"settlementTreatment":null,"fallbackCapPrice":null,"terminationRight":null,"terminationTriggerDays":null,"disruptionEventCount":null},
  "scheduling": {"schedulingControl":null,"outageNotification":null,"notificationWindowDays":null,"antiGaming":null,"maintenanceCoordination":null},
  "curtailment": {"econCurtailmentAllocation":null,"curtailmentCap":null,"deemedGenMethod":null},
  "nonecocurtail": {"nonEconCurtailAllocation":null,"nonEconCurtailCap":null,"nonEconDeemedGenMethod":null},
  "basiscurtail": {"basisCurtailAllocation":null,"basisCurtailCap":null,"basisDeemedGenMethod":null},
  "ia": {"iaStatus":null,"networkUpgradeCosts":null,"iaAsCP":null},
  "cp": {"buyerCPCount":null,"buyerTerminationRight":null,"sellerCPCount":null,"cpDeadlineMonths":null,"cpSatisfactionNotice":null},
  "delay": {"guaranteedCOD":null,"delayDamagesPresent":null,"delayDamagesRate":null,"gracePeriodDays":null,"damagesCapStructure":null,"damagesCapValue":null,"longstopMonths":null,"buyerTerminationAtLongstop":null,"delaySecurityBacked":null,"excusedDelays":null},
  "availmech": {"availGuaranteePct":null,"measurementMethod":null,"shortfallRemedy":null,"exclusionScope":null,"terminationRight":null,"maintenanceCapDays":null},
  "availguaranteed": {"productionGuarantee":null,"pValue":null,"measurementPeriod":null,"resourceNormalized":null,"shortfallRemedy":null,"excessGenTreatment":null,"terminationRight":null},
  "permit": {"permitStatus":null,"permitAsCP":null},
  "cod": {"codDefinitionStrength":null,"capacityThreshold":null,"performanceTest":null,"documentaryDeliverables":null,"buyerVerificationRight":null,"independentEngineer":null,"partialCOD":null},
  "buyerpa": {"buyerCreditRating":null,"collateralType":null,"coverageBasis":null,"fixedAmountPerMW":null,"downgradeTrigger":null,"downgradeCurePeriod":null,"downgradeSubstitution":null,"thresholdStructure":null},
  "sellerpa": {"preCODCreditType":null,"preCODSizingPerMW":null,"completionGuaranty":null,"creditSurvivesFinancing":null,"postCODCreditType":null,"postCODSizingPerMW":null,"stepDownTiming":null,"downgradeTrigger":null},
  "assign": {"buyerAssignRight":null,"buyerAffiliateTransfer":null,"sellerAssignRight":null,"sellerAffiliateTransfer":null,"lenderAssignment":null,"assigneeCreditRequirement":null},
  "fm": {"fmDefinitionScope":null,"paymentObligations":null,"supplyChainExcluded":null,"economicHardshipExcluded":null,"equipmentFailureExcluded":null,"transmissionCongestionExcluded":null,"pandemicTreatment":null,"fmDurationMonths":null,"terminationRight":null,"notificationRequirement":null,"codExtensionForFM":null},
  "eod": {"longstopCODDefault":null,"abandonmentTrigger":null,"paymentCureDays":null,"creditSupportCureDays":null,"materialBreachCureDays":null,"cureExtensionRight":null,"crossDefault":null,"downgradeAsEOD":null,"creditFailureAsEOD":null,"eodTriggerStandard":null},
  "eterm": {"terminationStructure":null,"preCODSellerPayment":null,"sellerPaymentCap":null,"valuationMethod":null,"disputeResolution":null,"discountRate":null,"generationAssumptions":null},
  "changeinlaw": {"strikeFixed":null,"taxCreditTreatment":null,"tariffTreatment":null,"economicImpactStandard":null,"reopenerMechanism":null,"preCODProtection":null,"postCODProtection":null,"financingTermsAsRelief":null},
  "reputation": {"reputationTerminationRight":null,"sellerComplianceReps":null,"reputationEventDefinition":null,"sellerAssignmentApproval":null,"communityOppositionProvision":null},
  "product": {"environmentalAttributes":null,"futureAttributes":null,"bundledStructure":null,"projectSpecific":null,"capacityAncillaryTreatment":null,"storageHybridAddressed":null,"additionalityClaim":null,"settlementDefinitionClarity":null},
  "recs": {"deliveryTiming":null,"replacementObligation":null,"replacementQuality":null,"vintageMatching":null,"registryExplicit":null,"shortfallDamages":null,"transferFees":null},
  "incentives": {"taxCreditAllocation":null,"bonusCreditAllocation":null,"transferabilityValueSharing":null,"incrementalIncentives":null,"stateLocalIncentives":null,"incentiveTransparency":null},
  "govlaw": {"governingLaw":null,"disputeResolution":null,"venue":null,"juryWaiver":null,"expertDetermination":null},
  "conf": {"confScope":null,"esgReportingCarveout":null,"regulatoryFilingCarveout":null,"affiliateDisclosure":null,"survivalPeriod":null,"mutualObligation":null},
  "excl": {"sellerOutputExclusivity":null,"buyerExclusivity":null,"attributeExclusivity":null,"negotiationExclusivity":null},
  "expenses": {"legalFees":null,"ongoingAdminCosts":null,"registryFees":null,"ieAndStudyCosts":null},
  "acct": {"accountingRepresentations":null,"hedgeAccountingLanguage":null,"taxIndemnity":null,"changeInAccountingTreatment":null},
  "publicity": {"jointAnnouncementRequired":null,"buyerPublicityRight":null,"sellerUseOfBuyerName":null,"logoTrademarkRestriction":null,"approvalProcess":null}
}

Valid enum values by field (use exactly these strings):
settlementType: hub|zonal|nodal|not_specified
addersIncluded: all_in|partial|excluded|not_specified
settlementInterval: iso_native|hourly|monthly|annual|not_specified
priceReference: real_time|day_ahead|not_specified
negPriceMechanism: zero_floor|seller_curtails|full_passthrough|not_specified
invoiceFrequency: monthly|quarterly|annual|not_specified
netting: yes|no|not_specified
disputeMechanism: withhold_disputed|pay_then_dispute|not_specified
latePaymentRate: low|moderate|high|not_specified
trueUp: monthly|quarterly|annual|none|not_specified
basisAllocation: seller_bears|shared_collar|buyer_bears|not_specified
busbarTransfer: present|absent|not_specified
busbarTrigger: standard_node_plus_ppa|lower_threshold|not_specified
disruptionDefined: yes|no|not_specified
settlementTreatment: suspend|fallback_average|fallback_last|settle_normal|not_specified
terminationRight: buyer|mutual|seller|none|not_specified
schedulingControl: iso_dispatch|seller_schedules|buyer_approval|not_specified
outageNotification: advance_required|best_efforts|none|not_specified
antiGaming: present|absent|not_specified
maintenanceCoordination: buyer_consent|buyer_consultation|seller_discretion|not_specified
econCurtailmentAllocation/nonEconCurtailAllocation/basisCurtailAllocation: seller_bears_deemed|shared|buyer_bears|not_specified
deemedGenMethod/nonEconDeemedGenMethod/basisDeemedGenMethod: weather_adjusted|capacity_factor|contractual_formula|not_specified
iaStatus: fully_executed|facilities_study_complete|system_impact_complete|feasibility_stage|not_filed|not_specified
networkUpgradeCosts: defined_and_capped|defined_uncapped|undefined|not_specified
iaAsCP/buyerTerminationRight/buyerTerminationAtLongstop/completionGuaranty/creditSurvivesFinancing/downgradeTrigger(sellerpa)/juryWaiver/expertDetermination/regulatoryFilingCarveout: yes|no|not_specified
cpSatisfactionNotice: required|not_required|not_specified
guaranteedCOD/delayDamagesPresent: yes|no|not_specified
damagesCapStructure: project_cost_pct|months_capped|both|none|not_specified
delaySecurityBacked: lc|parent_guaranty|both|none|not_specified
excusedDelays: narrow|moderate|broad|not_specified
measurementMethod: time_based|energy_weighted|not_specified
shortfallRemedy(availmech): deemed_generation|liquidated_damages|none|not_specified
shortfallRemedy(availguaranteed): deemed_generation|liquidated_damages|make_whole|none|not_specified
exclusionScope: narrow|standard|broad|not_specified
productionGuarantee: yes|no|not_specified
pValue: P50|P75|P90|other|not_specified
measurementPeriod: annual|rolling_2yr|rolling_3yr|not_specified
resourceNormalized/permitAsCP: yes|no|not_specified
excessGenTreatment: buyer_receives_all|capped|clawback|not_specified
permitStatus: all_obtained|major_obtained|in_progress|not_started|not_specified
codDefinitionStrength: tight_objective|moderate|loose_substantial|not_specified
performanceTest: full_capacity_demo|nameplate_only|none|not_specified
documentaryDeliverables: comprehensive|partial|minimal|not_specified
buyerVerificationRight: review_and_confirm|notice_only|seller_self_certifies|not_specified
independentEngineer: required|optional|none|not_specified
partialCOD: not_allowed|allowed_with_conditions|allowed_unrestricted|not_specified
buyerCreditRating: ig|non_ig|not_specified
collateralType: unsecured|parent_guaranty|lc|cash|lc_plus_mtm|cash_plus_mtm|not_specified
coverageBasis: 6_months|12_months|not_specified
downgradeTrigger(buyerpa): sub_ig_only|multiple_tiers|none|not_specified
downgradeSubstitution: guaranty_allowed|lc_only|cash_only|not_specified
thresholdStructure: threshold|independent_amount|not_specified
preCODCreditType: ig_sponsor_guaranty|sponsor_guaranty|lc|cash|spv_only|not_specified
postCODCreditType: ig_sponsor_guaranty|sponsor_guaranty|lc|spv_only|none|not_specified
stepDownTiming: after_all_cod_tests|at_cod|at_mechanical_completion|at_financial_close|not_specified
buyerAssignRight/sellerAssignRight: free|consent_not_unreasonably_withheld|consent_required|no_assignment|not_specified
buyerAffiliateTransfer/sellerAffiliateTransfer/affiliateDisclosure: permitted|not_permitted|not_specified
lenderAssignment: permitted|consent_required|not_addressed|not_specified
assigneeCreditRequirement: must_meet_original_standards|no_requirement|not_specified
fmDefinitionScope: narrow_objective|moderate|broad_subjective|not_specified
paymentObligations: continue|excused|not_specified
supplyChainExcluded/economicHardshipExcluded/equipmentFailureExcluded/transmissionCongestionExcluded: yes|no|not_specified
pandemicTreatment: excluded|performance_based_only|broad_inclusion|not_specified
notificationRequirement: prompt_with_mitigation|notice_only|none|not_specified
codExtensionForFM: no|limited|automatic|not_specified
longstopCODDefault: yes|no|not_specified
abandonmentTrigger: objective_test|subjective|none|not_specified
cureExtensionRight: none|limited|unlimited_diligent_pursuit|not_specified
crossDefault: broad|limited|none|not_specified
downgradeAsEOD: no_collateral_posting|yes_eod|not_specified
creditFailureAsEOD: yes|no|not_specified
eodTriggerStandard: objective|mixed|subjective_mae|not_specified
terminationStructure: two_way_mtm|two_way_formula|one_way_buyer_pays|walk_away|not_specified
preCODSellerPayment: full_replacement_value|return_of_security_only|none|not_specified
sellerPaymentCap: uncapped|capped_at_credit_support|fixed_cap|not_specified
valuationMethod: dealer_quotes|objective_forward_curve|independent_expert|sole_discretion|not_specified
disputeResolution(eterm/govlaw): independent_expert|arbitration|none|not_specified
discountRate: market_consistent|contractually_defined_reasonable|high_or_seller_determined|not_specified
generationAssumptions: objective_capacity_factor|historical_actual|seller_determined|not_specified
strikeFixed: yes_regardless|relief_for_illegality_only|reopener_defined_events|strike_adjusts|not_specified
taxCreditTreatment: seller_absorbs|relief_only_discriminatory|strike_reprices|not_specified
tariffTreatment: seller_absorbs|not_change_in_law|change_in_law_relief|not_specified
economicImpactStandard: illegality_impossibility|discriminatory_project_specific|broad_material_adverse|not_specified
reopenerMechanism: none|negotiate_then_terminate|automatic_adjustment|not_specified
preCODProtection: seller_obligated|termination_if_illegal|broad_relief|not_specified
postCODProtection: illegality_only|targeted_relief|broad_relief|not_specified
financingTermsAsRelief: excluded|included|not_specified
reputationTerminationRight: buyer_right|mutual|none|not_specified
sellerComplianceReps: comprehensive|standard|minimal|none|not_specified
reputationEventDefinition: objective_defined|subjective_buyer_discretion|not_defined|not_specified
sellerAssignmentApproval: buyer_approval_includes_reputation|creditworthiness_only|no_approval|not_specified
communityOppositionProvision: addressed|not_addressed|not_specified
environmentalAttributes: all_conveyed|partial_carveouts|not_defined|not_specified
futureAttributes: included|excluded|not_addressed|not_specified
bundledStructure: bundled|unbundled|not_specified
projectSpecific: yes|portfolio_generic|not_specified
capacityAncillaryTreatment: buyer_shares|seller_retains_explicit|seller_retains_silent|not_specified
storageHybridAddressed: yes|no|not_applicable|not_specified
additionalityClaim: new_build|existing|not_addressed|not_specified
settlementDefinitionClarity: clear_hub_node|vague|not_defined|not_specified
deliveryTiming: monthly|quarterly|annual|long_lag|not_specified
replacementObligation: yes|cash_only|none|not_specified
replacementQuality: same_tech_same_region|same_region_any_renewable|any_national_rec|not_specified
vintageMatching: strict_match|loose_banking|not_specified
registryExplicit: yes_seller_transfers|yes_buyer_responsible|not_specified
shortfallDamages(recs): full_replacement_cost|market_value_cash|fixed_ld|capped_below_market|none|not_specified
transferFees: seller_pays|buyer_pays|not_specified
taxCreditAllocation: buyer_shares_upside|seller_retains_strike_reflects|seller_retains_no_transparency|not_specified
bonusCreditAllocation/stateLocalIncentives: reflected_in_strike|seller_retains|shared|not_addressed|not_specified
transferabilityValueSharing: buyer_benefits|seller_retains|shared|not_addressed|not_specified
incrementalIncentives: buyer_shares|seller_retains|not_addressed|not_specified
incentiveTransparency: seller_discloses|no_disclosure|not_specified
governingLaw: new_york|delaware|buyer_home_state|project_state|other|not_specified
disputeResolution(govlaw): arbitration|litigation|mediation_then_arbitration|mediation_then_litigation|not_specified
venue: buyer_favorable|neutral|seller_favorable|not_specified
confScope: narrow_pricing_only|standard_all_terms|broad_existence_included|not_specified
esgReportingCarveout: explicit|implied|none|not_specified
survivalPeriod: two_years_or_less|three_to_five_years|indefinite|not_specified
mutualObligation: mutual|buyer_only|not_specified
sellerOutputExclusivity: full_project_committed|partial_project|not_specified
buyerExclusivity: none|limited_same_iso|broad|not_specified
attributeExclusivity: all_to_buyer|some_retained|not_specified
negotiationExclusivity: none|time_limited|open_ended|not_specified
legalFees: each_own|shared|buyer_bears|not_specified
ongoingAdminCosts/ieAndStudyCosts: seller_bears|shared|buyer_bears|not_specified
registryFees: seller_pays|buyer_pays|shared|not_specified
accountingRepresentations: both_parties|buyer_only|none|not_specified
hedgeAccountingLanguage: supportive_structure|neutral|problematic_features|not_specified
taxIndemnity: mutual|one_way_buyer|none|not_specified
changeInAccountingTreatment: no_relief|reopener|termination_right|not_specified
jointAnnouncementRequired: yes_mutual_approval|notification_only|no_restriction|not_specified
buyerPublicityRight: broad_esg_marketing|limited_with_approval|restricted|not_specified
sellerUseOfBuyerName: prohibited_without_consent|permitted_with_notice|unrestricted|not_specified
logoTrademarkRestriction: prior_written_consent|permitted|not_addressed|not_specified
approvalProcess: prior_written_consent|reasonable_advance_notice|no_process|not_specified
iso: ERCOT|CAISO|PJM|MISO|SPP|ISO-NE|NYISO
technology: Solar|Wind
assetType: new_build|existing
escalatorType: fixed|cpi|cpi_spread`;

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

    const truncatedText = termSheet.length > 12000
      ? termSheet.substring(0, 10000) + '\n...[truncated]...\n' + termSheet.substring(termSheet.length - 2000)
      : termSheet;

    const response = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': ANTHROPIC_VERSION
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 3500,
        system: SYSTEM_PROMPT,
        messages: [{
          role: 'user',
          content: `Extract all facts from this VPPA/PPA term sheet:\n\n${truncatedText}`
        }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error ${response.status}: ${errorText.substring(0, 200)}`);
    }

    const data = await response.json();
    const content = data.content?.[0]?.text || '';
    console.log('HAIKU FACTS (first 300):', content.substring(0, 300));

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found in response');

    const facts = JSON.parse(jsonMatch[0]);
    if (!facts.deal) facts.deal = {};

    // Regex overrides for key metadata fields
    const buyerPatterns = [
      /\*\*Buyer\*\*\s*[|:]\s*([^\n|*]+)/i,
      /^Buyer[:\s]+([A-Z][^\n]{2,60})/m,
      /([A-Z][A-Za-z0-9\s,\.&'-]{2,50}?)\s*\(on behalf of (?:Buyer|Purchaser)\)/i,
    ];
    for (const pat of buyerPatterns) {
      const m = termSheet.match(pat);
      if (m && m[1].trim().length > 2) { facts.deal.buyer = m[1].trim().replace(/\s*\|.*/, '').trim(); break; }
    }

    const sellerPatterns = [
      /\*\*(?:Seller|Developer)\*\*\s*[|:]\s*([^\n|*]+)/i,
      /^(?:Seller|Developer)[:\s]+([A-Z][^\n]{2,60})/m,
    ];
    for (const pat of sellerPatterns) {
      const m = termSheet.match(pat);
      if (m && m[1].trim().length > 2) { facts.deal.developer = m[1].trim().replace(/\s*\|.*/, '').trim(); break; }
    }

    const projectPatterns = [
      /\*\*Project(?:\s+Name)?\*\*\s*[|:]\s*([^\n|*]+)/i,
      /^Project(?:\s+Name)?[:\s]+([A-Z][^\n]{2,60})/m,
    ];
    for (const pat of projectPatterns) {
      const m = termSheet.match(pat);
      if (m && m[1].trim().length > 2) { facts.deal.project = m[1].trim().replace(/\s*\|.*/, '').trim(); break; }
    }

    const codPatterns = [
      /Target(?:ed)?\s+COD[^:\n]*:\s*\**([A-Za-z0-9\s,\/]+20\d\d)\**/i,
      /Target(?:ed)?\s+Commercial\s+Operation\s+Date[^:\n]*:\s*\**([A-Za-z0-9\s,\/]+20\d\d)\**/i,
      /\bCOD\b[^:\n]*:\s*(Q[1-4]\s*20\d\d|[A-Za-z]+\s+20\d\d)/i,
    ];
    for (const pat of codPatterns) {
      const m = termSheet.match(pat);
      if (m) { facts.deal.cod = m[1].trim(); break; }
    }

    // Normalize technology
    if (facts.deal.technology) {
      const t = facts.deal.technology.toLowerCase();
      facts.deal.technology = t.includes('wind') ? 'Wind' : 'Solar';
    }
    facts.deal.tech = facts.deal.technology;

    console.log('DEAL EXTRACTED:', JSON.stringify(facts.deal));

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
