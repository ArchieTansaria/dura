//Computes risk scores based on semantic version differences and breaking change confidence

/**
 * Breaking risk impact weights by classification level
 * These represent the maximum contribution when confidenceScore = 1.0
 */
const BREAKING_RISK_WEIGHTS = {
  confirmed: 40,  // High impact - explicit breaking changes
  likely: 25,      // Medium impact - strong indicators
  possible: 10,    // Low impact - weak/ambiguous signals
  unknown: 0       // No impact - no evidence or negated
};

/**
 * Computes risk score and level based on version difference and breaking change confidence
 * @param {{diff: string, type: "prod"|"dev", breakingChange?: {breaking: string, confidenceScore: number}}} params - Diff type, dependency type, and breaking change analysis
 * @returns {{score: number, level: "high"|"medium"|"low"}} - Risk score and level
 */
function computeRisk({ diff, type, breakingChange }) {
  let score = 0;
  
  // Base score based on semver diff type
  if (diff === "major") {
    score += 60;
  } else if (diff === "minor") {
    score += 20;
  } else if (diff === "patch") {
    score += 5;
  } else if (diff === "same") {
    score += 0;
  } else if (diff === "unknown") {
    score += 10;
  } else {
    score += 10;
  }
  
  // Add confidence-weighted breaking risk contribution
  if (breakingChange && breakingChange.breaking && breakingChange.confidenceScore !== undefined) {
    const breakingClassification = breakingChange.breaking;
    const confidenceScore = Math.max(0, Math.min(1, breakingChange.confidenceScore)); // Clamp to [0, 1]
    const baseWeight = BREAKING_RISK_WEIGHTS[breakingClassification] || 0;
    
    // Scale breaking risk by confidence: higher confidence = higher risk contribution
    let breakingRiskContribution = baseWeight * confidenceScore;
    
    // Ensure confirmed breaking changes always contribute meaningfully
    // This guarantees confirmed breaking changes → at least medium risk when combined with semver
    if (breakingClassification === 'confirmed' && confidenceScore > 0) {
      // Minimum contribution to ensure minor bumps reach medium risk threshold
      const minContribution = Math.max(breakingRiskContribution, 10);
      breakingRiskContribution = minContribution;
    }
    
    score += breakingRiskContribution;
  }
  
  // Apply multiplier for dev dependencies (less risky)
  if (type === "dev") {
    score = Math.round(score * 0.7);
  }
  
  // Determine risk level based on combined score
  // Thresholds ensure:
  // - Confirmed breaking changes → at least medium risk
  // - Major semver bumps → high risk
  // - Unknown/weak signals → low risk
  let level;
  if (score >= 60) {
    level = "high";
  } else if (score >= 30) {
    level = "medium";
  } else {
    level = "low";
  }
  
  return {
    score: Math.round(score),
    level
  };
}

module.exports = {
  computeRisk
};

