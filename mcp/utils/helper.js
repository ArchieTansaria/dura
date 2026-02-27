import { analyzeRepository, aggregateRisk } from "dura-kit";
import { cache, CACHE_TTL } from "./cache.js";

// format full analysis (smart, actionable Output)
export function formatFullAnalysis(result, fromCache) {
  const summary = aggregateRisk(result);
  const { counts, health, prioritizedDependencies, recommendations } = summary;

  let output = `# Dependency Risk Analysis\n\n`;

  if (fromCache) {
    output += `> Using cached result (refresh by setting useCache: false)\n\n`;
  }

  // Executive Summary
  output += `## Summary\n\n`;
  output += `Analyzed **${summary.totalDependencies}** dependencies:\n`;
  output += `- **${counts.high}** High Risk\n`;
  output += `- **${counts.medium}** Medium Risk\n`;
  output += `- **${counts.low}** Low Risk\n`;
  if (counts.breaking > 0) {
    output += `- **${counts.breaking}** with Breaking Changes\n`;
  }
  output += `\n`;

  // Health Assessment
  output += `**Health Score**: ${health.score}/100 - `;
  if (health.status === "excellent") output += `Excellent\n\n`;
  else if (health.status === "good") output += `⚡ Good\n\n`;
  else if (health.status === "needs-attention") output += `Needs Attention\n\n`;
  else output += `Critical\n\n`;

  // Critical Issues (Breaking Changes + High Risk)
  const criticalIssues = prioritizedDependencies.filter(
     d => d.riskLevel === "high" || (d.breakingChange && d.breakingChange.breaking === "confirmed")
  );
  
  if (criticalIssues.length > 0) {
    output += `## Critical Issues Requiring Attention\n\n`;
    
    criticalIssues.forEach((dep, idx) => {
      output += `### ${idx + 1}. ${dep.name} (${dep.type})\n`;
      output += `**Current**: \`${dep.currentResolved}\` → **Latest**: \`${dep.latest}\`\n`;
      output += `**Update Type**: ${dep.diff} | **Risk Score**: ${dep.riskScore}/100\n\n`;
      
      // why it's risky
      if (dep.breakingChange?.breaking === "confirmed") {
        output += `**Breaking Changes Confirmed** (${(dep.breakingChange.confidenceScore * 100).toFixed(0)}% confidence)\n`;
        if (dep.breakingChange.signals?.strong?.length > 0) {
          output += `> "${dep.breakingChange.signals.strong[0].substring(0, 120)}..."\n\n`;
        }
      } else if (dep.diff === "major") {
        output += `**Major version update** - likely contains breaking changes\n\n`;
      }
      
      // What to do
      output += `**Action Required**:\n`;
      if (dep.breakingChange?.breaking === "confirmed") {
        output += `- Read migration guide: ${dep.githubRepoUrl}/releases\n`;
        output += `- Update affected code before upgrading\n`;
        output += `- Test thoroughly in staging environment\n`;
      } else {
        output += `- Review changelog: ${dep.githubRepoUrl}/releases\n`;
        output += `- Check for breaking changes\n`;
        output += `- Test in development environment first\n`;
      }
      output += `\n---\n\n`;
    });
  }

  // Medium Risk (Brief)
  const medium = prioritizedDependencies.filter(d => d.riskLevel === "medium");
  if (medium.length > 0 && criticalIssues.length === 0) {
    output += `## Medium Risk Dependencies\n\n`;
    output += `${counts.medium} dependencies have medium-risk updates. These should be reviewed but are not critical:\n\n`;
    
    medium.slice(0, 5).forEach((dep) => {
      output += `- **${dep.name}**: \`${dep.currentResolved}\` → \`${dep.latest}\` (${dep.diff})\n`;
    });
    
    if (counts.medium > 5) {
      output += `- ... and ${counts.medium - 5} more\n`;
    }
    output += `\n**Recommendation**: Review changelogs and update when convenient.\n\n`;
  }

  // All Clear Scenario
  if (criticalIssues.length === 0 && medium.length === 0) {
    output += `## All Clear!\n\n`;
    output += `No high or medium risk dependencies detected. All dependencies are safe to update with standard testing.\n\n`;
  }

  // recommendations
  if (recommendations && recommendations.length > 0) {
    output += `## Recommendations\n\n`;
    
    recommendations.forEach(rec => {
      output += `### ${rec.title}\n`;
      rec.steps.forEach((step, index) => {
         output += `${index + 1}. **${step.split(' ').slice(0, 3).join(' ')}** ${step.split(' ').slice(3).join(' ')}\n`;
      });
      output += `\n`;
    });
  }

  // Technical Details (Collapsed)
  output += `\n---\n\n`;
  output += `<details>\n<summary>View All Dependencies (${summary.totalDependencies})</summary>\n\n`;
  
  if (counts.high > 0) {
    output += `### High Risk (${counts.high})\n`;
    prioritizedDependencies.filter(d => d.riskLevel === "high").forEach(d => output += `- ${d.name}: ${d.currentResolved} → ${d.latest}\n`);
    output += `\n`;
  }
  
  if (counts.medium > 0) {
    output += `### Medium Risk (${counts.medium})\n`;
    medium.forEach(d => output += `- ${d.name}: ${d.currentResolved} → ${d.latest}\n`);
    output += `\n`;
  }
  
  if (counts.low > 0) {
    output += `### Low Risk (${counts.low})\n`;
    output += `All up-to-date or safe patch updates.\n\n`;
  }
  
  output += `</details>\n\n`;
  
  output += `<details>\n<summary>Full JSON Data</summary>\n\n`;
  output += `\`\`\`json\n${JSON.stringify(result, null, 2)}\n\`\`\`\n`;
  output += `</details>`;

  return output;
}

// get or fetch analysis (with caching)
export async function getOrFetchAnalysis(repoUrl, branch) {
  const cached = getCachedResult(repoUrl, branch);
  if (cached) {
    console.error("Using cached result");
    return cached;
  }

  const result = await analyzeRepository({ repoUrl, branch, scrapeMode: "batch" });
  setCachedResult(repoUrl, branch, result);
  return result;
}

// cache management
export function getCachedResult(repoUrl, branch) {
  const cacheKey = `${repoUrl}:${branch}`;
  const cached = cache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  return null;
}

export function setCachedResult(repoUrl, branch, data) {
  const cacheKey = `${repoUrl}:${branch}`;
  cache.set(cacheKey, {
    data,
    timestamp: Date.now(),
  });
}

// Error handling
export function handleError(error) {
  let helpText = "";

  if (error.message.includes("404") || error.message.includes("not found")) {
    helpText =
      "\n\nMake sure:\n- Repository URL is correct\n- Repository is public\n- Repository contains a package.json file";
  } else if (error.message.includes("rate limit")) {
    helpText =
      "\n\nGitHub API rate limit reached. Please wait a few minutes and try again.";
  } else if (error.message.includes("timeout")) {
    helpText =
      "\n\nAnalysis timed out. The repository might be too large or network is slow.";
  } else if (error.message.includes("ENOTFOUND")) {
    helpText =
      "\n\nNetwork error. Check your internet connection and try again.";
  }

  console.error(`Error: ${error.message}`);

  return {
    content: [
      {
        type: "text",
        text: `Error: ${error.message}${helpText}`,
      },
    ],
    isError: true,
  };
}