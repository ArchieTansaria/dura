#!/usr/bin/env node

/**
 * DURA - Dependency Update Risk Analyzer
 * Entry point for the CLI tool
 */

const { fetchPackageJson } = require("./src/fetchPackageJson");
const { extractDependencies } = require("./src/getDependencies");
const { fetchNpmInfo, extractLatestVersion, extractGithubRepoUrl } = require("./src/npmInfo");
const { semverDiff } = require("./src/semverDiff");
const { computeRisk } = require("./src/risk");
const { scrapeReleases } = require("./src/scrapeReleases");
const { logStep } = require("./src/utils");

/**
 * Formats a report as a table
 * @param {Array} report - Array of dependency report objects
 */
function printTable(report) {
  console.log("\n" + "=".repeat(100));
  console.log("DEPENDENCY RISK REPORT");
  console.log("=".repeat(100) + "\n");
  
  // Calculate column widths
  const columns = ["name", "type", "currentRange", "currentResolved", "latest", "diff", "breaking", "riskScore", "riskLevel"];
  const widths = {};
  
  columns.forEach(col => {
    widths[col] = Math.max(
      col.length,
      ...report.map(r => String(r[col] || "").length)
    );
  });
  
  // Print header
  const header = columns.map(col => col.padEnd(widths[col])).join(" | ");
  console.log(header);
  console.log("-".repeat(header.length));
  
  // Print rows
  report.forEach(row => {
    const rowStr = columns.map(col => String(row[col] || "").padEnd(widths[col])).join(" | ");
    console.log(rowStr);
  });
  
  console.log("\n" + "=".repeat(100) + "\n");
}

/**
 * Main execution function
 */
async function run() {
  try {
    // Parse CLI arguments
    const repoUrl = process.argv[2];
    const branch = process.argv[3] || "main";
    
    // Validate arguments
    if (!repoUrl) {
      console.error("Usage: node index.js <github-repo-url> [branch]");
      console.error("Example: node index.js https://github.com/vercel/next.js main");
      process.exit(1);
    }
    
    // Step 1: Fetch package.json
    const pkgJson = await fetchPackageJson(repoUrl, branch);
    
    // Step 2: Get dependencies
    const dependencies = extractDependencies(pkgJson, true);
    logStep(`Found ${dependencies.length} dependencies`);
    
    if (dependencies.length === 0) {
      logStep("No dependencies found in package.json");
      console.log("\n--- JSON REPORT ---\n");
      console.log(JSON.stringify([], null, 2));
      return;
    }
    
    // Step 3: Analyze each dependency
    logStep("Analyzing dependencies...");
    const report = [];
    
    for (let i = 0; i < dependencies.length; i++) {
      const dep = dependencies[i];
      const progress = `[${i + 1}/${dependencies.length}]`;
      
      try {
        // Fetch npm info
        const npmJson = await fetchNpmInfo(dep.name);
        const latestVersion = extractLatestVersion(npmJson);
        
        // Extract GitHub repo URL
        const repoUrl = extractGithubRepoUrl(npmJson);
        
        // Scrape releases for breaking changes
        let scrapingResult = null;
        if (repoUrl) {
          try {
            scrapingResult = await scrapeReleases(repoUrl);
          } catch (err) {
            // Fallback on scraping error
            scrapingResult = { breaking: false, keywords: [], text: "" };
          }
        } else {
          scrapingResult = { breaking: false, keywords: [], text: "" };
        }
        
        if (!latestVersion) {
          // No latest version found, mark as unknown
          const diffResult = { diff: "unknown", currentResolved: null };
          const risk = computeRisk({ 
            diff: "unknown", 
            type: dep.type,
            breaking: scrapingResult.breaking
          });
          
          report.push({
            name: dep.name,
            type: dep.type,
            currentRange: dep.range,
            currentResolved: null,
            latest: null,
            diff: "unknown",
            breaking: scrapingResult.breaking,
            breakingKeywords: scrapingResult.keywords,
            repoUrl: repoUrl,
            releaseNotesSnippet: scrapingResult.text.slice(0, 500),
            riskScore: risk.score,
            riskLevel: risk.level
          });
          
          continue;
        }
        
        // Compute semver diff
        const diffResult = semverDiff(dep.range, latestVersion);
        
        // Compute risk (now includes breaking changes)
        const risk = computeRisk({ 
          diff: diffResult.diff, 
          type: dep.type,
          breaking: scrapingResult.breaking
        });
        
        // Add to report
        report.push({
          name: dep.name,
          type: dep.type,
          currentRange: dep.range,
          currentResolved: diffResult.currentResolved,
          latest: latestVersion,
          diff: diffResult.diff,
          breaking: scrapingResult.breaking,
          breakingKeywords: scrapingResult.keywords,
          repoUrl: repoUrl,
          releaseNotesSnippet: scrapingResult.text.slice(0, 500),
          riskScore: risk.score,
          riskLevel: risk.level
        });
        
        // Log progress for every 10th dependency or last one
        if ((i + 1) % 10 === 0 || i === dependencies.length - 1) {
          logStep(`Processed ${i + 1}/${dependencies.length} dependencies...`);
        }
      } catch (error) {
        // Handle errors for individual dependencies
        console.error(`\n[ERROR] Failed to analyze ${dep.name}: ${error.message}`);
        
        // Add error entry to report
        report.push({
          name: dep.name,
          type: dep.type,
          currentRange: dep.range,
          currentResolved: null,
          latest: null,
          diff: "unknown",
          breaking: false,
          breakingKeywords: [],
          repoUrl: null,
          releaseNotesSnippet: "",
          riskScore: 10,
          riskLevel: "low",
          error: error.message
        });
      }
    }
    
    // Step 4: Output results
    printTable(report);
    
    console.log("--- JSON REPORT ---\n");
    console.log(JSON.stringify(report, null, 2));
    
    logStep("Analysis complete!");
    
  } catch (error) {
    console.error(`\n[ERROR] ${error.message}`);
    process.exit(1);
  }
}

// Run the main function
run();

