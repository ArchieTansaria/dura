/**
 * Fetches package.json from a GitHub repository
 */

const fetch = require("node-fetch");
const { logStep } = require("./utils");

/**
 * Parses a GitHub URL to extract owner and repo
 * @param {string} repoUrl - GitHub URL (e.g., https://github.com/user/repo)
 * @returns {{owner: string, repo: string}} Parsed owner and repo
 */
function parseGitHubUrl(repoUrl) {
  const cleaned = repoUrl
    .replace(/\/$/, "")
    .replace(/\.git$/, "");

  const match = cleaned.match(
    /(?:https?:\/\/)?(?:www\.)?github\.com\/([^\/]+)\/([^\/]+)/
  );

  if (!match) {
    throw new Error(`Invalid GitHub URL: ${repoUrl}`);
  }

  return {
    owner: match[1],
    repo: match[2]
  };
}

/**
 * Tries to fetch package.json from a given branch
 */
async function tryBranch(owner, repo, branch) {
  const url = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/package.json`;
  logStep(`Trying branch "${branch}": ${url}`);

  const res = await fetch(url);

  if (res.ok) {
    const pkg = await res.json();
    logStep(`✔ package.json found in branch "${branch}"`);
    return pkg;
  }

  logStep(`✖ package.json not found in branch "${branch}" (HTTP ${res.status})`);
  return null;
}

/**
 * Gets default branch using GitHub API
 */
async function getDefaultBranch(owner, repo) {
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}`;
  logStep(`Fetching default branch from ${apiUrl}`);

  const res = await fetch(apiUrl, {
    headers: { "User-Agent": "DURA-Agent" }
  });

  if (!res.ok) {
    logStep(`⚠ Failed to fetch default branch (HTTP ${res.status})`);
    return null;
  }

  const json = await res.json();
  return json.default_branch || null;
}

/**
 * Fetches package.json from a GitHub repository by trying:
 * 1. main
 * 2. master
 * 3. GitHub default branch
 */
async function fetchPackageJson(repoUrl) {
  const { owner, repo } = parseGitHubUrl(repoUrl);

  // Try main
  let pkg = await tryBranch(owner, repo, "main");
  if (pkg) return pkg;

  // Try master
  pkg = await tryBranch(owner, repo, "master");
  if (pkg) return pkg;

  // Detect default branch
  const defaultBranch = await getDefaultBranch(owner, repo);

  if (defaultBranch && defaultBranch !== "main" && defaultBranch !== "master") {
    pkg = await tryBranch(owner, repo, defaultBranch);
    if (pkg) return pkg;
  }

  throw new Error(`❌ package.json not found in main, master, or default branch for ${owner}/${repo}`);
}

if (require.main === module) {
  fetchPackageJson("https://github.com/vercel/next.js")
    .then(console.log)
    .catch(console.error);
}

module.exports = {
  fetchPackageJson,
  parseGitHubUrl
};
