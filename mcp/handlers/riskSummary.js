import { getOrFetchAnalysis } from "../utils/helper.js";
import { aggregateRisk } from "dura-kit";

export async function handleRiskSummary(args) {
  const { repoUrl, branch = "main" } = args;

  console.error(`[Risk Summary] ${repoUrl}`);

  const result = await getOrFetchAnalysis(repoUrl, branch);
  const dependencies = result.dependencies || result;
  
  const summary = aggregateRisk(dependencies);
  const { counts, health } = summary;

  let output = `# Dependency Health Summary\n\n`;
  output += `**Repository**: ${repoUrl}\n`;
  output += `**Branch**: ${branch}\n`;
  output += `**Total Dependencies**: ${summary.totalDependencies}\n\n`;

  output += `## Risk Distribution\n\n`;
  output += `- High Risk: ${counts.high}\n`;
  output += `- Medium Risk: ${counts.medium}\n`;
  output += `- Low Risk: ${counts.low}\n`;
  if (counts.breaking > 0) {
    output += `- Breaking Changes: ${counts.breaking}\n`;
  }
  output += `\n`;

  output += `## Health Score: ${health.score}/100\n\n`;

  if (health.status === "excellent") {
    output += `**Excellent**: Dependencies are well-maintained and safe to update.\n`;
  } else if (health.status === "good") {
    output += `⚡ **Good**: Some updates needed but manageable risk.\n`;
  } else if (health.status === "needs-attention") {
    output += `**Needs Attention**: Multiple high-risk updates require planning.\n`;
  } else {
    output += `**Critical**: Significant dependency debt. Prioritize updates.\n`;
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