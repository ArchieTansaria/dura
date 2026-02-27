import { getOrFetchAnalysis } from "../utils/helper.js";
import { aggregateRisk } from "dura-kit";

export async function handleHighRiskFilter(args) {
  const { repoUrl, branch = "main" } = args;

  console.error(`[High Risk Filter] ${repoUrl}`);

  const result = await getOrFetchAnalysis(repoUrl, branch);
  const dependencies = result.dependencies || result;
  
  const summary = aggregateRisk(dependencies);
  
  const highRisk = summary.prioritizedDependencies.filter((d) => d.riskLevel === "high");

  if (highRisk.length === 0) {
    return {
      content: [
        {
          type: "text",
          text: "No high-risk dependencies found! All dependencies are safe to update.",
        },
      ],
    };
  }

  let output = `# High-Risk Dependencies (${highRisk.length})\n\n`;
  if (highRisk.length > 1) {
    output += `Found ${highRisk.length} dependencies that require careful review:\n\n`;
  } else {
    output += `Found ${highRisk.length} dependency that requires careful review:\n\n`;
  }

  highRisk.forEach((dep, idx) => {
    output += `${idx + 1}. **${dep.name}** (${dep.type})\n`;
    output += `   - Current: ${dep.currentResolved}\n`;
    output += `   - Latest: ${dep.latest}\n`;
    output += `   - Update Type: ${dep.diff}\n`;
    output += `   - Risk Score: ${dep.riskScore}/100\n`;
    if (dep.breakingChange?.breaking === "confirmed") {
      output += `   - Breaking changes confirmed\n`;
    }
    output += `\n`;
  });

  const highRecs = summary.recommendations.find(r => r.priority === 'high');
  if (highRecs) {
    output += `\n## Recommendations\n\n`;
    highRecs.steps.forEach((step, index) => {
      output += `${index + 1}. ${step}\n`;
    });
  }

  return {
    content: [
      {
        type: "text",
        text: output,
      },
    ],
  };
}