#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import { fileURLToPath } from "url";

const execAsync = promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Path to your CLI
const CLI_PATH = path.join(__dirname, "../cli/bin/dura.js");

const server = new Server(
  {
    name: "dura-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "analyze_dependencies",
        description:
          "Analyze dependency update risks for a GitHub repository. Returns risk analysis including high/medium/low risk dependencies, security vulnerabilities, and update recommendations.",
        inputSchema: {
          type: "object",
          properties: {
            repoUrl: {
              type: "string",
              description: "The GitHub repository URL to analyze (e.g., https://github.com/user/repo)",
            },
            format: {
              type: "string",
              enum: ["json", "summary"],
              description: "Output format: 'json' for full details or 'summary' for human-readable overview",
              default: "json",
            },
          },
          required: ["repoUrl"],
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === "analyze_dependencies") {
    const { repoUrl, format = "json" } = request.params.arguments;

    try {
      // Run your CLI command
      const command = `node ${CLI_PATH} ${repoUrl} --json`;
      const { stdout, stderr } = await execAsync(command, {
        maxBuffer: 10 * 1024 * 1024, // 10MB buffer for large outputs
        timeout: 120000, // 2 minute timeout
      });

      if (stderr && !stderr.includes("warning")) {
        return {
          content: [
            {
              type: "text",
              text: `⚠️ Error analyzing repository:\n${stderr}`,
            },
          ],
          isError: true,
        };
      }

      // Parse the JSON output
      const results = JSON.parse(stdout);

      // Format output based on request
      if (format === "summary") {
        const summary = formatSummary(results);
        return {
          content: [
            {
              type: "text",
              text: summary,
            },
          ],
        };
      }

      // Return full JSON
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(results, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `❌ Failed to analyze repository: ${error.message}\n\nPlease ensure:\n- The repository URL is valid\n- The repository is public or you have access\n- Your DURA CLI is properly configured`,
          },
        ],
        isError: true,
      };
    }
  }

  throw new Error(`Unknown tool: ${request.params.name}`);
});

// Helper function to format summary
function formatSummary(results) {
  const { dependencies = [], summary = {}, recommendations = [] } = results;

  const highRisk = dependencies.filter((d) => d.riskLevel === "high").length;
  const mediumRisk = dependencies.filter((d) => d.riskLevel === "medium").length;
  const lowRisk = dependencies.filter((d) => d.riskLevel === "low").length;

  let output = `
🦖 DURA Analysis Results
========================

📊 Risk Summary:
- ⚠️  High Risk: ${highRisk} dependencies
- ⚡ Medium Risk: ${mediumRisk} dependencies
- ✅ Low Risk: ${lowRisk} dependencies

`;

  if (highRisk > 0) {
    output += `\n🚨 High Risk Dependencies:\n`;
    dependencies
      .filter((d) => d.riskLevel === "high")
      .slice(0, 5)
      .forEach((dep) => {
        output += `  - ${dep.name}@${dep.currentVersion} → ${dep.latestVersion}\n`;
        if (dep.reason) output += `    Reason: ${dep.reason}\n`;
      });
  }

  if (recommendations.length > 0) {
    output += `\n💡 Top Recommendations:\n`;
    recommendations.slice(0, 3).forEach((rec, i) => {
      output += `  ${i + 1}. ${rec}\n`;
    });
  }

  return output.trim();
}

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("🦖 DURA MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Failed to start MCP server:", error);
  process.exit(1);
});