#!/usr/bin/env node

//entrypoint for cli

//making crawlee logs silent for --json flag using env vars
const isJson = process.argv.includes('--json');
if (isJson) {
  process.env.LOG_LEVEL = 'ERROR';
  process.env.CRAWLEE_LOG_LEVEL = 'ERROR';
  process.env.CRAWLEE_LOG_LEVEL_PERF = 'ERROR';
}

const { Command } = require("commander")
const { main } = require("../../core/index");
const { formatTable } = require("../../core/utils/formatTable")
const { helpInfo } = require("../../core/utils/helpInfo")

const pkg = require("../package.json");
const { setSilent } = require("../../core/utils/logger");

const program = new Command()

program
  .name("dura")
  .usage("<github-repo-url> [branch] [options]")
  .version(pkg.version);

program
  .argument("<repoUrl>", "GitHub repository URL e.g. https://github.com/expressjs/express")
  .argument("[branch]", "Git branch to analyze", "main")
  .option("--json", "Output JSON only (no table, no logs)")
  .action(async (repoUrl, branch, options) => {

    try {
      //making custom logger silent for --json flag
      if (options.json){
        setSilent(true)
        const ora = (await import("ora")).default;
        spinner = ora("Analyzing dependencies…\n").start();
      }

      const report = await main({
        repoUrl,
        branch
      });

      if (options.json) {
        console.log(JSON.stringify(report, null, 2));
        if (spinner){
          spinner.succeed("Analysis complete")
        }
      } else {
        console.log("\n" + formatTable(report) + "\n");
        console.log("--- JSON REPORT ---");
        console.log(JSON.stringify(report, null, 2));
      }
      } catch (err) {
        console.error("❌ Error:", err.message, "\nFor usage, type dura --help");
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
`
);

program.showHelpAfterError('(use dura --help for usage and additional information)');

program.parse(process.argv);
