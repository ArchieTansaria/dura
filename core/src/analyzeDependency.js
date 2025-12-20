const {
  fetchNpmInfo,
  extractLatestVersion,
  extractGithubRepoUrl,
} = require("./npmInfo");
const { semverDiff } = require("./semverDiff");
const { scrapeReleases } = require("./scrapeReleases");
const { computeRisk } = require("./risk");
const { logStep } = require("../utils/logger");

async function analyzeDependency(dep, index, total) {
  const { name, range, type } = dep;
  logStep(`[${index + 1}/${total}] Processing ${name}...`);

  let npmJson = null;
  let latestVersion = null;
  let githubRepoUrl = null;
  let releaseData = { 
    breaking: false, 
    keywords: [], 
    text: "",
    breakingChange: {
      breaking: 'unknown',
      confidenceScore: 0,
      signals: {
        strong: [],
        medium: [],
        weak: [],
        negated: false
      }
    }
  };
  let diffResult = { diff: "unknown", currentResolved: null };
  let riskResult = { score: 0, level: "low" };

  try {
    npmJson = await fetchNpmInfo(name);
    latestVersion = extractLatestVersion(npmJson);
    githubRepoUrl = extractGithubRepoUrl(npmJson);

    // console.log(npmJson)
    // console.log(latestVersion)
    // console.log(typeof githubRepoUrl)

    if (latestVersion) {
      diffResult = semverDiff(range, latestVersion);
    }

    // console.log(diffResult)

    if (githubRepoUrl) {
      try {
        releaseData = await scrapeReleases(githubRepoUrl);
      } catch (error) {
        logStep(`⚠ Scraping failed for ${name}, using fallback`);
        releaseData = { 
          breaking: false, 
          keywords: [], 
          text: "",
          breakingChange: {
            breaking: 'unknown',
            confidenceScore: 0,
            signals: {
              strong: [],
              medium: [],
              weak: [],
              negated: false
            }
          }
        };
      }
    }

    riskResult = computeRisk({
      diff: diffResult.diff,
      type,
      breakingChange: releaseData.breakingChange,
    });
  } catch (error) {
    logStep(`⚠ Error processing ${name}: ${error.message}`);
  }

  return {
    name,
    type,
    currentRange: range,
    currentResolved: diffResult.currentResolved,
    latest: latestVersion,
    diff: diffResult.diff,
    breakingChange: releaseData.breakingChange,
    riskScore: riskResult.score,
    riskLevel: riskResult.level,
    githubRepoUrl,
    releaseKeywords: releaseData.keywords,
  };
}

module.exports = { analyzeDependency }