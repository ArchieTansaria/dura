const { fetchPackageJson } = require("./src/fetchPackageJson");
const { extractDependencies } = require("./src/getDependencies");
const {
  fetchNpmInfo,
  extractLatestVersion,
  extractGithubRepoUrl,
} = require("./src/npmInfo");
const { semverDiff } = require("./src/semverDiff");
const { computeRisk } = require("./src/risk");
const { scrapeManyReleases, normalizeGitHubUrl, defaultReleaseResult } = require("./src/scrapeReleases");
const { analyzeDependency, buildReportItem } = require("./src/analyzeDependency");
const { logStep } = require("./utils/logger");

/**
 * @param {object} opts
 * @param {string} opts.repoUrl - GitHub repository URL
 * @param {string} [opts.branch="main"] - branch to analyze
 * @param {"sequential"|"batch"} [opts.scrapeMode="sequential"] - sequential = per-dep scrape + pretty logs (CLI --verbose/--debug); batch = scrapeManyReleases (MCP/CI, quiet + fast)
 */
async function analyzeRepository({ repoUrl, branch = "main", scrapeMode = "sequential" }) {

  if (!repoUrl) {
    throw new Error("GitHub repository URL is required");
  }

  logStep(`Starting analysis for ${repoUrl} (branch: ${branch})`);

  const pkgJson = await fetchPackageJson(repoUrl, branch);
  const dependencies = extractDependencies(pkgJson, true);

  logStep(`Found ${dependencies.length} dependencies`);

  const report = [];

  if (scrapeMode === "batch") {
    const preList = [];
    for (let i = 0; i < dependencies.length; i++) {
      const dep = dependencies[i];
      let latestVersion = null;
      let githubRepoUrl = null;
      let diffResult = { diff: "unknown", currentResolved: null };
      try {
        const npmJson = await fetchNpmInfo(dep.name);
        latestVersion = extractLatestVersion(npmJson);
        githubRepoUrl = extractGithubRepoUrl(npmJson);
        if (latestVersion) {
          diffResult = semverDiff(dep.range, latestVersion);
        }
      } catch (err) {
        // keep defaults
      }
      preList.push({ dep, latestVersion, githubRepoUrl, diffResult });
    }

    const uniqueUrls = [...new Set(preList.map((p) => p.githubRepoUrl).filter(Boolean))];
    const releaseMap = await scrapeManyReleases(uniqueUrls);

    for (const { dep, latestVersion, githubRepoUrl, diffResult } of preList) {
      const releaseData = githubRepoUrl
        ? (releaseMap.get(normalizeGitHubUrl(githubRepoUrl)) || defaultReleaseResult())
        : defaultReleaseResult();
      const riskResult = computeRisk({
        diff: diffResult.diff,
        type: dep.type,
        breakingChange: releaseData.breakingChange,
      });
      report.push(
        buildReportItem(dep, diffResult, { ...releaseData, latest: latestVersion, githubRepoUrl }, riskResult)
      );
    }
  } else {
    for (let i = 0; i < dependencies.length; i++) {
      const result = await analyzeDependency(dependencies[i], i, dependencies.length);
      report.push(result);
    }
  }

  return report;
}

module.exports = { analyzeRepository };