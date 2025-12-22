#!/usr/bin/env node

//entrypoint for cli

const { Command } = require("commander")
const { analyzeRepository } = require("../../core/index");
const { formatTable } = require("../../core/utils/formatTable")
const { formatSummary } = require("../../core/utils/formatSummary")
const { helpInfo } = require("../../core/utils/helpInfo")
const pkg = require("../package.json");
const { setSilent } = require("../../core/utils/logger");
const chalk = require("chalk")

const colors = {
  helpHint: chalk.dim
};

const program = new Command()

program
  .name("dura")
  .usage("<github-repo-url> [branch] [options]")
  .version(pkg.version);

program
  .argument("<repoUrl>", "gitHub repository URL e.g. https://github.com/expressjs/express")
  .argument("[branch]", "git branch to analyze", "main")
  .option("--json", "output machine readable JSON only (no table, logs or summary)")
  .option("--verbose", "get detailed progress, warning and scraper logs")
  .option("--debug", "enable debug-level logs including internal scraper, network, and performance details (very noisy)")
  .option("--table", "output in tabular format")
  .option("--summary", "output summary (default)")
  .action(async (repoUrl, branch, options) => {

    try {
      let spinner = null;

      //making spinner disappear for --verbose and --debug flags
      if (!options.verbose && !options.debug){
        const ora = (await import("ora")).default;
        spinner = ora("Analyzing dependencies…\n")
        spinner.start();
      }
      
      //configuring playwright log levels for different flags
      if (options.verbose) {
        process.env.LOG_LEVEL = 'INFO';
        process.env.CRAWLEE_LOG_LEVEL = 'INFO';
        process.env.CRAWLEE_LOG_LEVEL_PERF = 'OFF';
        setSilent(false)
      }

      if (options.debug){
        process.env.LOG_LEVEL = 'DEBUG';
        process.env.CRAWLEE_LOG_LEVEL = 'DEBUG';
        process.env.CRAWLEE_LOG_LEVEL_PERF = 'INFO';
        setSilent(false)
      }

      const report = await analyzeRepository({
        repoUrl,
        branch
      });

      if (spinner) {
        spinner.stop();
      }

      if (options.json) {
        console.log(JSON.stringify(report, null, 2));
      } else {
          if (options.debug || options.verbose) {
            console.log("\n" + formatTable(report) + "\n");
            console.log("\n" + formatSummary(report) + "\n");
          } else {
            if (options.table) {
              console.log("\n" + formatTable(report) + "\n");
              // console.log("\n" + formatSummary(report) + "\n");
            } 
          }
          if (options.summary || (!options.verbose && !options.debug && !options.table)) {
            console.log("\n" + formatSummary(report));
          }
      }
      if (spinner){
        spinner.succeed("Analysis complete\n")
      }

      //footer for all flags except json
      if (!options.json){
        console.log(colors.helpHint(`(Run "dura --help" for additional options)`))
      }

      } catch (err) {
        if (options.json) {
        // For JSON mode, output structured error to stderr
          console.error(JSON.stringify({
            error: true,
            message: err.message,
            stack: options.debug ? err.stack : undefined
          }, null, 2));
        } else {
          console.error("❌ Error:", err.message, "\nFor usage, type dura --help");
        }
        process.exit(1);
      }
  });

program.addHelpText(
  "beforeAll",
  helpInfo
)

program.addHelpText(
  "afterAll",
  `
Examples:
  $ dura https://github.com/expressjs/express
  $ dura https://github.com/expressjs/express next
  $ dura https://github.com/expressjs/express --json
  $ dura https://github.com/expressjs/express --verbose
  $ dura https://github.com/expressjs/express --table --summary
  (all flags are additive in nature except --json)

Additional:
  # Pretty print
  dura <repo> --json | jq .

  # Extract fields
  dura <repo> --json | jq '.dependencies[] | select(.riskLevel=="high")'

  # Save to file
  dura <repo> --json > report.json

  # Count confirmed breakings
  dura <repo> --json | jq '[.[] | select(.breakingChange.breaking=="confirmed")] | length'
  `
);

program.showHelpAfterError('(use dura --help for usage and additional information)');

program.parse(process.argv);
