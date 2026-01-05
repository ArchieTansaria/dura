import { analyzeRepository } from "dura-kit";
import { cache, CACHE_TTL } from "./cache.js";

// format full analysis (smart, actionable Output)
export function formatFullAnalysis(result, fromCache) {
  const dependencies = result.dependencies || result;

  const high = dependencies.filter((d) => d.riskLevel === "high");
  const medium = dependencies.filter((d) => d.riskLevel === "medium");
  const low = dependencies.filter((d) => d.riskLevel === "low");
  const breaking = dependencies.filter(
    (d) => d.breakingChange?.breaking === "confirmed"
  );

  let output = `# Dependency Risk Analysis\n\n`;

  if (fromCache) {
    output += `> Using cached result (refresh by setting useCache: false)\n\n`;
  }

  // Executive Summary
  output += `## Summary\n\n`;
  output += `Analyzed **${dependencies.length}** dependencies:\n`;
  output += `- **${high.length}** High Risk\n`;
  output += `- **${medium.length}** Medium Risk\n`;
  output += `- **${low.length}** Low Risk\n`;
  if (breaking.length > 0) {
    output += `- **${breaking.length}** with Breaking Changes\n`;
  }
  output += `\n`;

  // Health Assessment
  const healthScore = calculateHealthScore(high.length, medium.length, low.length);
  output += `**Health Score**: ${healthScore}/100 - `;
  if (healthScore >= 80) {
    output += `Excellent\n\n`;
  } else if (healthScore >= 60) {
    output += `⚡ Good\n\n`;
  } else if (healthScore >= 40) {
    output += `Needs Attention\n\n`;
  } else {
    output += `Critical\n\n`;
  }

  // Critical Issues (Breaking Changes + High Risk)
  const criticalIssues = [...new Set([...breaking, ...high])]; // Deduplicate
  
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
  if (medium.length > 0 && criticalIssues.length === 0) {
    output += `## Medium Risk Dependencies\n\n`;
    output += `${medium.length} dependencies have medium-risk updates. These should be reviewed but are not critical:\n\n`;
    
    medium.slice(0, 5).forEach((dep) => {
      output += `- **${dep.name}**: \`${dep.currentResolved}\` → \`${dep.latest}\` (${dep.diff})\n`;
    });
    
    if (medium.length > 5) {
      output += `- ... and ${medium.length - 5} more\n`;
    }
    output += `\n**Recommendation**: Review changelogs and update when convenient.\n\n`;
  }

  // All Clear Scenario
  if (criticalIssues.length === 0 && medium.length === 0) {
    output += `## All Clear!\n\n`;
    output += `No high or medium risk dependencies detected. All dependencies are safe to update with standard testing.\n\n`;
  }

  // recommendations
  output += `## Recommendations\n\n`;
  
  if (breaking.length > 0) {
    output += `### Immediate Actions (Breaking Changes)\n`;
    output += `1. **Review migration guides** for ${breaking.length} ${breaking.length === 1 ? 'dependency' : 'dependencies'} with breaking changes\n`;
    output += `2. **Create a feature branch** for dependency updates\n`;
    output += `3. **Update one at a time** and test after each update\n`;
    output += `4. **Allocate testing time** - breaking changes require thorough validation\n\n`;
  }
  
  if (high.length > 0 && breaking.length === 0) {
    output += `### High Priority Actions\n`;
    output += `1. **Review changelogs** for ${high.length} high-risk ${high.length === 1 ? 'dependency' : 'dependencies'}\n`;
    output += `2. **Test in staging** before production deployment\n`;
    output += `3. **Update incrementally** to isolate potential issues\n\n`;
  }
  
  if (medium.length > 0) {
    output += `### Medium Priority Actions\n`;
    output += `1. **Schedule updates** for ${medium.length} medium-risk dependencies in next sprint\n`;
    output += `2. **Batch similar updates** together for efficiency\n`;
    output += `3. **Run full test suite** after updating\n\n`;
  }
  
  if (low.length > 0 && criticalIssues.length === 0 && medium.length === 0) {
    output += `### Maintenance Actions\n`;
    output += `1. **Safe to run** \`npm update\` or \`yarn upgrade\` for low-risk patches\n`;
    output += `2. **Run automated tests** to verify compatibility\n`;
    output += `3. **Commit changes** with clear description\n\n`;
  }

  // Update Priority Order
  if (criticalIssues.length > 0 || medium.length > 0) {
    output += `## Suggested Update Order\n\n`;
    
    let priority = 1;
    
    if (breaking.length > 0) {
      output += `**Priority ${priority}**: Breaking Changes\n`;
      breaking.slice(0, 3).forEach(dep => {
        output += `- ${dep.name}\n`;
      });
      output += `\n`;
      priority++;
    }
    
    if (high.length > 0 && breaking.length === 0) {
      output += `**Priority ${priority}**: High Risk Dependencies\n`;
      high.slice(0, 3).forEach(dep => {
        output += `- ${dep.name}\n`;
      });
      output += `\n`;
      priority++;
    }
    
    if (medium.length > 0) {
      output += `**Priority ${priority}**: Medium Risk Dependencies\n`;
      output += `- Update in batches during regular maintenance\n\n`;
    }
  }

  // Technical Details (Collapsed)
  output += `\n---\n\n`;
  output += `<details>\n<summary>View All Dependencies (${dependencies.length})</summary>\n\n`;
  
  if (high.length > 0) {
    output += `### High Risk (${high.length})\n`;
    high.forEach(d => output += `- ${d.name}: ${d.currentResolved} → ${d.latest}\n`);
    output += `\n`;
  }
  
  if (medium.length > 0) {
    output += `### Medium Risk (${medium.length})\n`;
    medium.forEach(d => output += `- ${d.name}: ${d.currentResolved} → ${d.latest}\n`);
    output += `\n`;
  }
  
  if (low.length > 0) {
    output += `### Low Risk (${low.length})\n`;
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

  const result = await analyzeRepository({ repoUrl, branch });
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

// calculate health score
export function calculateHealthScore(high, medium, low) {
  const total = high + medium + low;
  if (total === 0) return 100;

  const score = ((low + medium * 0.5) / total) * 100;
  return Math.round(score);
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