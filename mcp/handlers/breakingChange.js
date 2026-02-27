import { getOrFetchAnalysis } from "../utils/helper.js";
import { aggregateRisk } from "dura-kit";

export async function handleBreakingChanges(args) {
  const { repoUrl, branch = "main" } = args;

  console.error(`[Breaking Changes] ${repoUrl}`);

  const result = await getOrFetchAnalysis(repoUrl, branch);
  const dependencies = result.dependencies || result;
  
  const summary = aggregateRisk(dependencies);
  const breaking = summary.prioritizedDependencies.filter(
    (d) => d.breakingChange?.breaking === "confirmed" || d.breakingChange?.breaking === "likely"
  );

  if (breaking.length === 0) {
    return {
      content: [
        {
          type: "text",
          text: "No confirmed breaking changes detected in dependency updates.",
        },
      ],
    };
  }

  let output = `# Breaking Changes Detected (${breaking.length})\n\n`;

  breaking.forEach((dep, idx) => {
    output += `${idx + 1}. **${dep.name}** (${dep.type})\n`;
    output += `   - Current: ${dep.currentResolved}\n`;
    output += `   - Latest: ${dep.latest}\n`;
    output += `   - Confidence: ${(dep.breakingChange.confidenceScore * 100).toFixed(0)}%\n`;

    if (dep.breakingChange.signals?.strong?.length > 0) {
      output += `   - Evidence: "${dep.breakingChange.signals.strong[0].substring(0, 100)}..."\n`;
    }

    output += `   - GitHub: ${dep.githubRepoUrl}\n`;
    output += `\n`;
  });

  const immediateRecs = summary.recommendations.find(r => r.priority === 'immediate');
  if (immediateRecs) {
    output += `\n## Migration Planning\n\n`;
    output += `These dependencies have confirmed breaking changes. Before updating:\n\n`;
    immediateRecs.steps.forEach((step, index) => {
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