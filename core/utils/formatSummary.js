const chalk = require('chalk');

// Centralized color definitions
const colors = {
  breakingHeader: chalk.red,
  highRiskHeader: chalk.yellow,
  mediumRiskHeader: chalk.cyan,
  dependencyName: chalk.bold,
  metadata: chalk.gray
};

function formatSummary(report) {
  // Filter confirmed breaking changes
  const confirmedBreaking = report.filter(item => 
    item.breakingChange && item.breakingChange.breaking === "confirmed"
  );
  
  // Filter high-risk (excluding confirmed breaking)
  const confirmedNames = new Set(confirmedBreaking.map(item => item.name));
  const highRisk = report.filter(item => 
    item.riskLevel === "high" && !confirmedNames.has(item.name)
  );
  
  // Filter medium-risk (excluding confirmed breaking and high-risk)
  const highRiskNames = new Set(highRisk.map(item => item.name));
  const mediumRisk = report.filter(item => 
    item.riskLevel === "medium" && !confirmedNames.has(item.name) && !highRiskNames.has(item.name)
  );
  
  const sections = [];
  
  // Confirmed breaking changes section
  if (confirmedBreaking.length > 0) {
    const items = confirmedBreaking.map(item => {
      const type = item.type;
      let description;
      
      if (item.diff !== "same") {
        description = `${item.diff} update with breaking changes`;
      } else {
        description = "confirmed breaking change";
      }
      
      return `- ${colors.dependencyName(item.name)} ${colors.metadata(`(${type})`)} → ${description}`;
    });
    
    sections.push(colors.breakingHeader(`Confirmed breaking changes (${confirmedBreaking.length}):`));
    sections.push(...items);
    sections.push("");
  }
  
  // High-risk updates section
  if (highRisk.length > 0) {
    const items = highRisk.map(item => {
      const type = item.type;
      const description = item.diff === "major" 
        ? "major version gap" 
        : "high-risk update";
      
      return `- ${colors.dependencyName(item.name)} ${colors.metadata(`(${type})`)} → ${description}`;
    });
    
    sections.push(colors.highRiskHeader(`High-risk updates (${highRisk.length}):`));
    sections.push(...items);
    sections.push("");
  }
  
  // Medium-risk updates section
  if (mediumRisk.length > 0) {
    const items = mediumRisk.map(item => {
      const type = item.type;
      const description = item.diff === "major" 
        ? "major version gap" 
        : "medium-risk update";
      
      return `- ${colors.dependencyName(item.name)} ${colors.metadata(`(${type})`)} → ${description}`;
    });
    
    sections.push(colors.mediumRiskHeader(`Medium-risk updates (${mediumRisk.length}):`));
    sections.push(...items);
    sections.push("");
  }
  
  // Empty state
  if (sections.length === 0) {
    sections.push("No breaking or high-risk dependency changes detected.");
    sections.push("");
  }
  
  return sections.join("\n");
}

module.exports = { formatSummary };

