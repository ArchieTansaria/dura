import { aggregateRisk, ReportItem } from 'dura-kit';

export function formatPRComment(dependencies: ReportItem[]): string {
  const summary = aggregateRisk(dependencies);
  const { counts, health, prioritizedDependencies, recommendations } = summary;

  let output = `## 🛡️ Dura Dependency Analysis\n\n`;
  output += `**Health Score:** ${health.score}/100\n**Status:** ${health.status}\n\n`;

  // --- Stats Breakdown Table ---
  output += `### Risk Summary\n\n`;
  output += `| Risk Level | Count |\n`;
  output += `| :--- | :--- |\n`;
  
  if (counts.breaking > 0) {
    output += `| 🛑 **Breaking** | ${counts.breaking} |\n`;
  }
  if (counts.high > 0) {
    output += `| ⚠️ **High** | ${counts.high} |\n`;
  }
  if (counts.medium > 0) {
    output += `| 🟡 **Medium** | ${counts.medium} |\n`;
  }
  if (counts.low > 0) {
    output += `| 🟢 **Low/Patch** | ${counts.low} |\n`;
  }
  
  // Empty State Handling
  if (prioritizedDependencies.length === 0) {
    output += `\nNo dependency bumps detected in this PR.\n`;
    return output;
  }

  // --- Recommendations Task List ---
  if (recommendations && recommendations.length > 0) {
    output += `\n### 🛠️ Action Items\n\n`;
    
    recommendations.forEach(rec => {
      output += `**${rec.title}**\n`;
      rec.steps.forEach(step => {
        output += `- [ ] ${step}\n`;
      });
      output += `\n`;
    });
  }

  // --- Detailed Dependency Breakdown (Collapsible) ---
  output += `\n<details>\n<summary><b>View Detailed Dependency Breakdown</b></summary>\n\n`;

  prioritizedDependencies.forEach((dep, idx) => {
    let icon = "🟢";
    if (dep.riskLevel === "high") icon = "⚠️";
    if (dep.riskLevel === "medium") icon = "🟡";
    if (dep.breakingChange && (dep.breakingChange.breaking === "confirmed" || dep.breakingChange.breaking === "likely")) {
      icon = "🛑";
    }

    output += `#### ${idx + 1}. ${icon} ${dep.name} (${dep.type})\n`;
    output += `- **Update:** \`${dep.currentResolved}\` → \`${dep.latest}\` (${dep.diff})\n`;
    
    if (dep.breakingChange) {
      if (dep.breakingChange.breaking === "confirmed") {
          output += `- **Breaking Change:** Confirmed (${Math.round(dep.breakingChange.confidenceScore * 100)}% confidence)\n`;
      } else if (dep.breakingChange.breaking === "likely") {
         output += `- **Breaking Change:** Likely (${Math.round(dep.breakingChange.confidenceScore * 100)}% confidence)\n`;
      }
    }
    
    if (dep.githubRepoUrl) {
      output += `- **Changelog:** [View Release Notes](${dep.githubRepoUrl}/releases)\n`;
    }
    output += `\n`;
  });

  output += `</details>\n`;

  return output;
}
