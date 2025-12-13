#!/usr/bin/env node

//entry point for CLI

const { fetchPackageJson } = require("./src/fetchPackageJson");
const { extractDependencies } = require("./src/getDependencies");
const { logStep } = require("./utils/logger");
const { formatTable } = require("./utils/formatTable");
const { analyzeDependency } = require("./src/analyzeDependency")


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
