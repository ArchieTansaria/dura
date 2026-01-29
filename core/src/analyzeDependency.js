const {
  fetchNpmInfo,
  extractLatestVersion,
  extractGithubRepoUrl,
} = require("./npmInfo");
const { semverDiff } = require("./semverDiff");
const { scrapeReleases, normalizeGitHubUrl, defaultReleaseResult } = require("./scrapeReleases");
const { computeRisk } = require("./risk");
const { logStep } = require("../utils/logger");

function buildReportItem(dep, diffResult, releaseData, riskResult) {
  const { name, range, type } = dep;
  return {
    name,
    type,
    currentRange: range,
    currentResolved: diffResult.currentResolved,
    latest: releaseData.latest !== undefined ? releaseData.latest : undefined,
    diff: diffResult.diff,
    breakingChange: releaseData.breakingChange,
    riskScore: riskResult.score,
    riskLevel: riskResult.level,
    githubRepoUrl: releaseData.githubRepoUrl !== undefined ? releaseData.githubRepoUrl : undefined,
    releaseKeywords: releaseData.keywords,
  };
}

async function analyzeDependency(dep, index, total, preScrapedResult = null, preKnownGithubUrl = null) {
  const { name, range, type } = dep;
  logStep(`[${index + 1}/${total}] Processing ${name}...`);

  let npmJson = null;
  let latestVersion = null;
  let githubRepoUrl = null;
  let releaseData = defaultReleaseResult();
  let diffResult = { diff: "unknown", currentResolved: null };
  let riskResult = { score: 0, level: "low" };

  try {
    npmJson = await fetchNpmInfo(name);
    latestVersion = extractLatestVersion(npmJson);
    githubRepoUrl = preKnownGithubUrl || extractGithubRepoUrl(npmJson);

    // console.log(npmJson)
    // console.log(latestVersion)
    // console.log(typeof githubRepoUrl)

    if (latestVersion) {
      diffResult = semverDiff(range, latestVersion);
    }

    // console.log(diffResult)

    if (githubRepoUrl) {
      // Use pre-scraped result if available, otherwise scrape individually
      if (preScrapedResult) {
        // Log "Navigating to..." to maintain log order even with pre-scraped results
        const baseUrl = normalizeGitHubUrl(githubRepoUrl);
        if (baseUrl) {
          logStep(`Navigating to ${baseUrl}/releases`);
          logStep('Crawl complete');
        }
        releaseData = preScrapedResult;
      } else {
        try {
          releaseData = await scrapeReleases(githubRepoUrl);
        } catch (error) {
          logStep(`⚠ Scraping failed for ${name}, using fallback`);
          releaseData = defaultReleaseResult();
        }
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

  return buildReportItem(
    dep,
    diffResult,
    { ...releaseData, latest: latestVersion, githubRepoUrl },
    riskResult
  );
}

module.exports = { analyzeDependency, buildReportItem };