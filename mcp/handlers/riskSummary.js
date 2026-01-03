import { getOrFetchAnalysis, calculateHealthScore } from "../utils/helper.js";

export async function handleRiskSummary(args) {
  const { repoUrl, branch = "main" } = args;

  console.error(`[Risk Summary] ${repoUrl}`);

  const result = await getOrFetchAnalysis(repoUrl, branch);
  const dependencies = result.dependencies || result;

  const high = dependencies.filter((d) => d.riskLevel === "high").length;
  const medium = dependencies.filter((d) => d.riskLevel === "medium").length;
  const low = dependencies.filter((d) => d.riskLevel === "low").length;
  const breaking = dependencies.filter(
    (d) => d.breakingChange?.breaking === "confirmed"
  ).length;

  let output = `# Dependency Health Summary\n\n`;
  output += `**Repository**: ${repoUrl}\n`;
  output += `**Branch**: ${branch}\n`;
  output += `**Total Dependencies**: ${dependencies.length}\n\n`;

  output += `## Risk Distribution\n\n`;
  output += `- High Risk: ${high}\n`;
  output += `- Medium Risk: ${medium}\n`;
  output += `- Low Risk: ${low}\n`;
  if (breaking > 0) {
    output += `- Breaking Changes: ${breaking}\n`;
  }
  output += `\n`;

  // Health score
  const healthScore = calculateHealthScore(high, medium, low);
  output += `## Health Score: ${healthScore}/100\n\n`;

  if (healthScore >= 80) {
    output += `**Excellent**: Dependencies are well-maintained and safe to update.\n`;
  } else if (healthScore >= 60) {
    output += `⚡ **Good**: Some updates needed but manageable risk.\n`;
  } else if (healthScore >= 40) {
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