/**
 * Main orchestration pipeline for DURA
 */

const { Actor } = require('apify');
const { fetchPackageJson } = require("./fetchPackageJson");
const { extractDependencies } = require("./getDependencies");
const { fetchNpmInfo, extractGithubRepoUrl, extractLatestVersion } = require("./npmInfo");
const { semverDiff } = require("./semverDiff");
const { computeRisk } = require("./risk");
const { scrapeReleases } = require("./scrapeReleases");
const { logStep } = require("./utils");

/**
 * Runs the full dependency risk analysis pipeline
 * @param {string} repoUrl - GitHub repository URL of a project to analyze
 * @param {string} [branch] - Optional branch name (defaults to "main")
 * @returns {Promise<array>} - List of dependency risk objects
 */
async function runDura(repoUrl, branch = "main") {
  logStep("Starting DURA pipeline...");

  // Step 1: Fetch package.json
  const pkg = await fetchPackageJson(repoUrl, branch);
  if (!pkg) {
    const log = Actor.log || {
      error: (...args) => console.error(...args)
    };
    log.error("❌ Failed to fetch package.json");
    return [];
  }

  // Step 2: Extract all dependencies
  const deps = extractDependencies(pkg);
  logStep(`Found ${deps.length} dependencies`);

  const results = [];

  // Step 3: Process each dependency
  for (let i = 0; i < deps.length; i++) {
    const dep = deps[i];
    const progress = `[${i + 1}/${deps.length}]`;
    logStep(`${progress} Processing ${dep.name}...`);

    let latest = null;
    let npmJson = null;
    let repoHomepage = null;
    let diffResult = null;
    let scrapeResult = null;

    try {
      // Fetch from npm registry
      npmJson = await fetchNpmInfo(dep.name);

      // Extract latest version
      latest = extractLatestVersion(npmJson);
      if (!latest) {
        latest = "unknown";
      }

      // Compare semantic versions
      if (latest !== "unknown") {
        diffResult = semverDiff(dep.range, latest);
      } else {
        diffResult = { diff: "unknown", currentResolved: null };
      }

      // Extract GitHub repo URL for scraping
      repoHomepage = extractGithubRepoUrl(npmJson);

      // Scrape GitHub releases
      if (repoHomepage) {
        scrapeResult = await scrapeReleases(repoHomepage);
      } else {
        scrapeResult = { breaking: false, keywords: [], text: "" };
      }

    } catch (err) {
      const log = Actor.log || {
        warning: (...args) => console.warn(...args)
      };
      log.warning(`⚠️ Error processing ${dep.name}: ${err.message}`);
      scrapeResult = { breaking: false, keywords: [], text: "" };
      diffResult = diffResult || { diff: "unknown", currentResolved: null };
      latest = latest || "unknown";
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
      current: dep.range,
      latest,
      diff: diffResult?.diff || "unknown",
      currentResolved: diffResult?.currentResolved || null,
      breaking: scrapeResult.breaking,
      breakingKeywords: scrapeResult.keywords,
      releasesUrl: repoHomepage ? repoHomepage + "/releases" : null,
      releaseNotesSnippet: scrapeResult.text ? scrapeResult.text.slice(0, 500) : "",
      riskScore: risk.score,
      riskLevel: risk.level,
    });

    // Log progress for every 10th dependency or last one
    if ((i + 1) % 10 === 0 || i === deps.length - 1) {
      logStep(`Processed ${i + 1}/${deps.length} dependencies...`);
    }
  }

  logStep("Pipeline complete!");

  return results;
}

module.exports = { runDura };

