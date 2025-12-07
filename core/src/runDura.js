/**
 * Main orchestration pipeline for DURA
 */

const { fetchPackageJson } = require("./fetchPackageJson");
const { extractDependencies } = require("./getDependencies");
const { fetchNpmInfo, extractGithubRepoUrl } = require("./npmInfo");
const { semverDiff } = require("./semverDiff");
const { computeRisk } = require("./risk");
const { scrapeReleases } = require("./scrapeReleases");
const { logStep } = require("./utils");

/**
 * Runs the full dependency risk analysis pipeline
 * @param {string} repoUrl - GitHub repository URL of a project to analyze
 * @returns {Promise<array>} - List of dependency risk objects
 */
async function runDura(repoUrl) {
  logStep("Starting DURA pipeline...");

  // Step 1: Fetch package.json
  const pkg = await fetchPackageJson(repoUrl);
  if (!pkg) {
    console.error("❌ Failed to fetch package.json");
    return [];
  }

  // Step 2: Extract all dependencies
  const deps = extractDependencies(pkg);
  logStep(`Found ${deps.length} dependencies`);

  const results = [];

  // Step 3: Process each dependency
  for (const dep of deps) {
    logStep(`Processing ${dep.name}...`);

    let latest = null;
    let npmJson = null;
    let repoHomepage = null;
    let diffResult = null;
    let scrapeResult = null;

    try {
      // Fetch from npm registry
      npmJson = await fetchNpmInfo(dep.name);

      if (npmJson?.["dist-tags"]?.latest) {
        latest = npmJson["dist-tags"].latest;
      } else {
        latest = "unknown";
      }

      // Compare semantic versions
      diffResult = semverDiff(dep.currentRange, latest);

      // Extract GitHub repo URL for scraping
      repoHomepage = extractGithubRepoUrl(npmJson);

      // Scrape GitHub releases
      if (repoHomepage) {
        scrapeResult = await scrapeReleases(repoHomepage);
      } else {
        scrapeResult = { breaking: false, keywords: [], text: "" };
      }

    } catch (err) {
      console.error(`⚠️ Error processing ${dep.name}:`, err);
      scrapeResult = { breaking: false, keywords: [], text: "" };
    }

    // Compute risk score
    const risk = computeRisk({
      diff: diffResult?.diff || "unknown",
      type: dep.type,
      breaking: scrapeResult.breaking,
    });

    // Add final result item
    results.push({
      name: dep.name,
      type: dep.type,
      current: dep.currentRange,
      latest,
      diff: diffResult?.diff || "unknown",

      breaking: scrapeResult.breaking,
      breakingKeywords: scrapeResult.keywords,
      releasesUrl: repoHomepage ? repoHomepage + "/releases" : null,

      riskScore: risk.score,
      riskLevel: risk.level,
    });
  }

  logStep("Pipeline complete!");

  return results;
}

module.exports = { runDura };
