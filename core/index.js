const { fetchPackageJson } = require("./src/fetchPackageJson");
const { extractDependencies } = require("./src/getDependencies");
const { logStep } = require("./utils/logger");
const { analyzeDependency } = require("./src/analyzeDependency")

async function analyzeRepository({ repoUrl, branch = "main"}) {

  if (!repoUrl) {
    throw new Error("GitHub repository URL is required");
  }

  logStep(`Starting analysis for ${repoUrl} (branch: ${branch})`);

  const pkgJson = await fetchPackageJson(repoUrl, branch);
  const dependencies = extractDependencies(pkgJson, true);

  logStep(`Found ${dependencies.length} dependencies`);

  const report = [];
  for (let i = 0; i < dependencies.length; i++) {
    const result = await analyzeDependency(dependencies[i], i, dependencies.length);
    report.push(result);
  }

  return report
}

module.exports = { analyzeRepository };