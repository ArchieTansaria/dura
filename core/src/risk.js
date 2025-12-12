//Computes risk scores based on semantic version differences

/**
 * Computes risk score and level based on version difference and breaking changes
 * @param {{diff: string, type: "prod"|"dev", breaking?: boolean}} params - Diff type, dependency type, and breaking changes flag
 * @returns {{score: number, level: "high"|"medium"|"low"}} - Risk score and level
 */
function computeRisk({ diff, type, breaking = false }) {
  let score = 0;
  
  // Base score based on diff type
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
  
  // Add score for breaking changes
  if (breaking) {
    score += 25;
  }
  
  // Apply multiplier for dev dependencies (less risky)
  if (type === "dev") {
    score = Math.round(score * 0.7);
  }
  
  // Determine risk level
  let level;
  if (score >= 60) {
    level = "high";
  } else if (score >= 30) {
    level = "medium";
  } else {
    level = "low";
  }
  
  return {
    score,
    level
  };
}

module.exports = {
  computeRisk
};

