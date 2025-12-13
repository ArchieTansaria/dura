// DURA orchestration pipeline (refactored to match CLI style)

/* 
this file was only created to isolate and test the scraping pipeline logic. 
this does not serve any real purpose with the core engine, however can be used for testing
*/


const { fetchPackageJson } = require("./fetchPackageJson");
const { extractDependencies } = require("./getDependencies");
const {
  fetchNpmInfo,
  extractLatestVersion,
  extractGithubRepoUrl,
} = require("./npmInfo");
const { semverDiff } = require("./semverDiff");
const { computeRisk } = require("./risk");
const { scrapeReleases } = require("./scrapeReleases");
const { logStep } = require("../utils/logger");

/**
 * Runs the full dependency risk analysis pipeline
 * @param {string} repoUrl - GitHub repo URL
 * @param {string} branch  - branch name (default "main")
 * @returns {Promise<Array>} - structured dependency analysis results
 */
async function runDura(repoUrl, branch = "main") {
  logStep(`Starting DURA analysis for ${repoUrl} (branch: ${branch})`);

  // Step 1: fetch package.json
  const pkgJson = await fetchPackageJson(repoUrl, branch);
  if (!pkgJson) {
    console.error("❌ Failed to fetch package.json");
    return [];
  }

  // Step 2: extract dependencies
  const deps = extractDependencies(pkgJson, true);
  logStep(`Found ${deps.length} dependencies`);

  const results = [];

  // Step 3: analyze dependencies
  for (let i = 0; i < deps.length; i++) {
    const dep = deps[i];
    logStep(`[${i + 1}/${deps.length}] Processing ${dep.name}...`);

    let npmJson = null;
    let latestVersion = null;
    let githubRepoUrl = null;

    let diffResult = { diff: "unknown", currentResolved: null };
    let releaseData = { breaking: false, keywords: [], text: "" };
    let riskResult = { score: 0, level: "low" };

    try {
      // Fetch metadata from npm
      npmJson = await fetchNpmInfo(dep.name);
      latestVersion = extractLatestVersion(npmJson);

      // Semver diff
      if (latestVersion) {
        diffResult = semverDiff(dep.range || dep.currentRange, latestVersion);
      }

      // Extract repo URL
      githubRepoUrl = extractGithubRepoUrl(npmJson);

      // Scrape releases
      if (githubRepoUrl) {
        try {
          releaseData = await scrapeReleases(githubRepoUrl);
        } catch (err) {
          logStep(`⚠ Scraping failed for ${dep.name}, using fallback`);
          releaseData = { breaking: false, keywords: [], text: "" };
        }
      }

      // Compute risk score
      riskResult = computeRisk({
        diff: diffResult.diff,
        type: dep.type,
        breaking: releaseData.breaking,
      });
    } catch (error) {
      logStep(`⚠ Error processing ${dep.name}: ${error.message}`);
    }

    // Build final result object
    results.push({
      name: dep.name,
      type: dep.type,
      currentRange: dep.range || dep.currentRange,
      currentResolved: diffResult.currentResolved,
      latest: latestVersion || "N/A",
      diff: diffResult.diff || "unknown",
      breaking: releaseData.breaking,
      releaseKeywords: releaseData.keywords,
      githubRepoUrl,
      riskScore: riskResult.score,
      riskLevel: riskResult.level,
    });
  }

  logStep("DURA pipeline complete!");
  return results;
}


module.exports = { runDura };
