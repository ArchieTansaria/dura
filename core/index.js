const { fetchPackageJson, parseGitHubUrl } = require("./src/fetchPackageJson");
const { extractDependencies } = require("./src/getDependencies");
const {
  fetchNpmInfo,
  extractLatestVersion,
  extractGithubRepoUrl,
} = require("./src/npmInfo");
const { semverDiff } = require("./src/semverDiff");
const { computeRisk } = require("./src/risk");
const { scrapeReleases } = require("./src/scrapeReleases");
const { logStep } = require("./utils/logger");

// async function tryBranch(owner, repo, branch) {
//   const url = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/package.json`;
//   logStep(`Trying branch "${branch}": ${url}`);

//   const res = await fetch(url);
//   if (res.ok) {
//     const pkg = await res.json();
//     logStep(`✔ package.json found in branch "${branch}"`);
//     return pkg;
//   }

//   logStep(`✖ package.json not found in branch "${branch}" (HTTP ${res.status})`);
//   return null;
// }

// async function getDefaultBranch(owner, repo) {
//   const apiUrl = `https://api.github.com/repos/${owner}/${repo}`;
//   logStep(`Fetching default branch from ${apiUrl}`);

//   const res = await fetch(apiUrl, {
//     headers: { "User-Agent": "DURA-Agent" }
//   });

//   if (!res.ok) {
//     logStep(`⚠ Failed to fetch default branch (HTTP ${res.status})`);
//     return null;
//   }

//   const json = await res.json();
//   return json.default_branch || null;
// }

// async function fetchPackageJson(repoUrl, branch) {
//   const { owner, repo } = parseGitHubUrl(repoUrl);

//   // Try specified branch first
//   let pkg = await tryBranch(owner, repo, branch);
//   if (pkg) return pkg;

//   // Fall back to main if not already tried
//   if (branch !== "main") {
//     pkg = await tryBranch(owner, repo, "main");
//     if (pkg) return pkg;
//   }

//   // Fall back to master if not already tried
//   if (branch !== "master") {
//     pkg = await tryBranch(owner, repo, "master");
//     if (pkg) return pkg;
//   }

//   // Try default branch
//   const defaultBranch = await getDefaultBranch(owner, repo);
//   if (defaultBranch && defaultBranch !== branch && defaultBranch !== "main" && defaultBranch !== "master") {
//     pkg = await tryBranch(owner, repo, defaultBranch);
//     if (pkg) return pkg;
//   }

//   throw new Error(`❌ package.json not found in ${branch}, main, master, or default branch for ${owner}/${repo}`);
// }

function formatTable(report) {
  const headers = [
    "name",
    "type",
    "currentRange",
    "currentResolved",
    "latest",
    "diff",
    "breaking",
    "riskScore",
    "riskLevel",
  ];

  const rows = report.map((dep) => [
    dep.name || "",
    dep.type || "",
    dep.currentRange || "",
    dep.currentResolved || "N/A",
    dep.latest || "N/A",
    dep.diff || "unknown",
    dep.breaking ? "yes" : "no",
    dep.riskScore?.toString() || "0",
    dep.riskLevel || "low",
  ]);

  const allRows = [headers, ...rows];
  const colWidths = headers.map((_, colIdx) => {
    return Math.max(
      ...allRows.map((row) => (row[colIdx] || "").toString().length),
      headers[colIdx].length
    );
  });

  const pad = (str, width) => {
    const s = (str || "").toString();
    return s.padEnd(width);
  };

  const separator = "+" + colWidths.map((w) => "-".repeat(w + 2)).join("+") + "+";

  let output = separator + "\n";
  output +=
    "| " +
    headers.map((h, i) => pad(h, colWidths[i])).join(" | ") +
    " |\n";
  output += separator + "\n";

  for (const row of rows) {
    output +=
      "| " +
      row.map((cell, i) => pad(cell, colWidths[i])).join(" | ") +
      " |\n";
  }

  output += separator;
  return output;
}

async function analyzeDependency(dep, index, total) {
  const { name, range, type } = dep;
  logStep(`[${index + 1}/${total}] Processing ${name}...`);

  let npmJson = null;
  let latestVersion = null;
  let githubRepoUrl = null;
  let releaseData = { breaking: false, keywords: [], text: "" };
  let diffResult = { diff: "unknown", currentResolved: null };
  let riskResult = { score: 0, level: "low" };

  try {
    npmJson = await fetchNpmInfo(name);
    latestVersion = extractLatestVersion(npmJson);
    githubRepoUrl = extractGithubRepoUrl(npmJson);

    // console.log(npmJson)
    // console.log(latestVersion)
    // console.log(githubRepoUrl)

    if (latestVersion) {
      diffResult = semverDiff(range, latestVersion);
    }

    // console.log(diffResult)

    if (githubRepoUrl) {
      try {
        releaseData = await scrapeReleases(githubRepoUrl);
      } catch (error) {
        logStep(`⚠ Scraping failed for ${name}, using fallback`);
        releaseData = { breaking: false, keywords: [], text: "" };
      }
    }

    riskResult = computeRisk({
      diff: diffResult.diff,
      type,
      breaking: releaseData.breaking,
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
    breaking: releaseData.breaking,
    riskScore: riskResult.score,
    riskLevel: riskResult.level,
    githubRepoUrl,
    releaseKeywords: releaseData.keywords,
  };
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error("Usage: node index.js <github-repo-url> [branch]");
    process.exit(1);
  }

  const repoUrl = args[0];
  const branch = args[1] || "main";

  try {
    logStep(`Starting analysis for ${repoUrl} (branch: ${branch})`);

    const pkgJson = await fetchPackageJson(repoUrl, branch);
    const dependencies = extractDependencies(pkgJson, true);

    logStep(`Found ${dependencies.length} dependencies`);

    const report = [];
    for (let i = 0; i < dependencies.length; i++) {
      const result = await analyzeDependency(dependencies[i], i, dependencies.length);
      report.push(result);
    }

    console.log("\n" + formatTable(report) + "\n");
    console.log("--- JSON REPORT ---");
    console.log(JSON.stringify(report, null, 2));
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { main };
