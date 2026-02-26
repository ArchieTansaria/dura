
// Computes a standardized health score (0-100) based on risk distributions.
function calculateHealthScore(high, medium, low) {
  const total = high + medium + low;
  if (total === 0) return 100;

  const score = ((low + medium * 0.5) / total) * 100;
  return Math.round(score);
}

/**
 * Maps a numerical health score to a semantic status label.
 * @param {number} score - The health score from 0-100
 * @returns {"excellent" | "good" | "needs-attention" | "critical"}
 */
function determineHealthStatus(score) {
  if (score >= 80) return "excellent";
  if (score >= 60) return "good";
  if (score >= 40) return "needs-attention";
  return "critical";
}

/**
 * Generates an array of actionable recommendations based on the risk distribution.
 * @param {Object} counts - The count of high, medium, low, and breaking dependencies.
 * @returns {Array} List of recommendation objects
 */
function generateRecommendations(counts) {
  const actions = [];
  
  if (counts.breaking > 0) {
    actions.push({
      priority: "immediate",
      title: "Immediate Actions (Breaking Changes)",
      steps: [
        `Review migration guides for ${counts.breaking} dependencies with breaking changes`,
        "Create a feature branch for dependency updates",
        "Update one at a time and test after each update",
        "Allocate testing time - breaking changes require thorough validation"
      ]
    });
  }
  
  if (counts.high > 0 && counts.breaking === 0) {
    actions.push({
      priority: "high",
      title: "High Priority Actions",
      steps: [
        `Review changelogs for ${counts.high} high-risk dependencies`,
        "Test in staging before production deployment",
        "Update incrementally to isolate potential issues"
      ]
    });
  }
  
  if (counts.medium > 0) {
    actions.push({
      priority: "medium",
      title: "Medium Priority Actions",
      steps: [
        `Schedule updates for ${counts.medium} medium-risk dependencies in next sprint`,
        "Batch similar updates together for efficiency",
        "Run full test suite after updating"
      ]
    });
  }
  
  if (counts.low > 0 && counts.high === 0 && counts.breaking === 0) {
    actions.push({
      priority: "maintenance",
      title: "Maintenance Actions",
      steps: [
        "Safe to run npm update or yarn upgrade for low-risk patches",
        "Run automated tests to verify compatibility",
        "Commit changes with clear description"
      ]
    });
  }

  return actions;
}

/*
Aggregates an array of dependency risk reports into a single, unified risk summary.
Extrapolates total counts, health metrics, and a unified priority ordering stack.
*/
function aggregateRisk(dependencies) {
  const deps = Array.isArray(dependencies) ? dependencies : (dependencies.dependencies || []);
  
  const high = deps.filter((d) => d.riskLevel === "high");
  const medium = deps.filter((d) => d.riskLevel === "medium");
  const low = deps.filter((d) => d.riskLevel === "low");
  const breaking = deps.filter((d) => d.breakingChange?.breaking === "confirmed");
  
  const score = calculateHealthScore(high.length, medium.length, low.length);
  const status = determineHealthStatus(score);
  
  // Create a strict prioritization pipeline for consistent rendering across all platforms (CLI, MCP, CI)
  const breakingNames = new Set(breaking.map((d) => d.name));
  const highNonBreaking = high.filter((d) => !breakingNames.has(d.name));
  
  const prioritizedDependencies = [
    ...breaking,
    ...highNonBreaking,
    ...medium, 
    ...low
  ];

  const counts = {
    high: high.length,
    medium: medium.length,
    low: low.length,
    breaking: breaking.length
  };

  return {
    totalDependencies: deps.length,
    counts,
    health: {
      score,
      status
    },
    prioritizedDependencies,
    recommendations: generateRecommendations(counts)
  };
}

module.exports = {
  aggregateRisk,
  calculateHealthScore,
  determineHealthStatus,
  generateRecommendations
};
