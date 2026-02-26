const chalk = require('chalk');

// Centralized color definitions
const colors = {
  breakingHeader: chalk.red,
  highRiskHeader: chalk.yellow,
  mediumRiskHeader: chalk.cyan,
  dependencyName: chalk.bold,
  metadata: chalk.gray
};

/**
 * Formats the pre-aggregated risk summary into a CLI-friendly string with colors.
 * @param {Object} riskSummary - The summary object produced by `aggregateRisk`
 * @returns {string} The formatted console output
 */
function formatSummary(riskSummary) {
  const sections = [];
  
  // Confirmed breaking changes section
  if (riskSummary.counts.breaking > 0) {
    const breaking = riskSummary.prioritizedDependencies.filter(
      d => d.breakingChange && d.breakingChange.breaking === "confirmed"
    );
    
    const items = breaking.map(item => {
      const description = item.diff !== "same"
        ? `${item.diff} update with breaking changes`
        : "confirmed breaking change";
      return `- ${colors.dependencyName(item.name)} ${colors.metadata(`(${item.type})`)} → ${description}`;
    });
    
    sections.push(colors.breakingHeader(`Confirmed breaking changes (${breaking.length}):`));
    sections.push(...items);
    sections.push("");
  }
  
  // High-risk updates section 
  // Get all high risk items that aren't also listed in breaking
  const highRisk = riskSummary.prioritizedDependencies.filter(
    d => d.riskLevel === "high" && !(d.breakingChange && d.breakingChange.breaking === "confirmed")
  );
  
  if (highRisk.length > 0) {
    const items = highRisk.map(item => {
      const description = item.diff === "major" ? "major version gap" : "high-risk update";
      return `- ${colors.dependencyName(item.name)} ${colors.metadata(`(${item.type})`)} → ${description}`;
    });
    
    sections.push(colors.highRiskHeader(`High-risk updates (${highRisk.length}):`));
    sections.push(...items);
    sections.push("");
  }
  
  // Medium-risk updates section
  const mediumRisk = riskSummary.prioritizedDependencies.filter(d => d.riskLevel === "medium");
  
  if (mediumRisk.length > 0) {
    const items = mediumRisk.map(item => {
      const description = item.diff === "major" ? "major version gap" : "medium-risk update";
      return `- ${colors.dependencyName(item.name)} ${colors.metadata(`(${item.type})`)} → ${description}`;
    });
    
    sections.push(colors.mediumRiskHeader(`Medium-risk updates (${mediumRisk.length}):`));
    sections.push(...items);
    sections.push("");
  }
  
  // Overall Health Assessment
  sections.push(`Repository Health Score: ${riskSummary.health.score}/100 ` + colors.metadata(`(${riskSummary.health.status})`));
  sections.push("");

  // Recommendations
  if (riskSummary.recommendations && riskSummary.recommendations.length > 0) {
    sections.push(chalk.bold.underline("Recommendations:\n"));
    
    riskSummary.recommendations.forEach(rec => {
      let titleColor = chalk.white;
      if (rec.priority === "immediate") titleColor = chalk.red;
      if (rec.priority === "high") titleColor = chalk.yellow;
      if (rec.priority === "medium") titleColor = chalk.cyan;
      if (rec.priority === "maintenance") titleColor = chalk.green;

      sections.push(titleColor(rec.title)); 
      rec.steps.forEach((step, index) => {
        sections.push(`  ${index + 1}. ${step}`);
      });
      sections.push("");
    });
  }
  
  // Empty state
  if (sections.length === 2 && riskSummary.totalDependencies > 0) {
    sections.unshift("No breaking or high-risk dependency changes detected.");
  }
  
  return sections.join("\n");
}

module.exports = { formatSummary };
