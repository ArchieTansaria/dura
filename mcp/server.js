#!/usr/bin/env node

//thi is the main file of the mcp
//however cline doesnt identify any tools whereas mcp inspector does

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { handleError } from "./utils/helper.js";
import { handleFullAnalysis } from "./handlers/fullAnalysis.js";
import { handleHighRiskFilter } from "./handlers/highRiskFilter.js";
import { handleBreakingChanges } from "./handlers/breakingChange.js";
import { handleRiskSummary } from "./handlers/riskSummary.js";

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

// register all available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "analyze_repository",
        // title : "Analyse repository",
        description:
          "Complete dependency risk analysis for a GitHub repository.\n\nUse this when you need a full picture of:\n- dependency update risks\n- breaking changes\n- recommended upgrade actions\n\nBest for first-time analysis or audits.",
        inputSchema: {
          type: "object",
          properties: {
            repoUrl: {
              type: "string",
              description: "GitHub repository URL (e.g., https://github.com/facebook/react)",
            },
            branch: {
              type: "string",
              description: "Git branch to analyze (default: main)",
              default: "main",
            },
            useCache: {
              type: "boolean",
              description: "Use cached results if available (default: true)",
              default: true,
            },
          },
          required: ["repoUrl"],
        },
      },
      {
        name: "get_high_risk_dependencies",
        // title: "High risk dependency finder",
        description:
          "Get only high-risk dependencies that require immediate attention.\n\nUse this tool when:\n- deciding whether updates are safe\n- reviewing CI failures related to dependencies\n- prioritizing dependency maintenance work",
        inputSchema: {
          type: "object",
          properties: {
            repoUrl: {
              type: "string",
              description: "GitHub repository URL",
            },
            branch: {
              type: "string",
              description: "Git branch to analyze (default: main)",
              default: "main",
            },
          },
          required: ["repoUrl"],
        },
      },
      {
        name: "get_breaking_changes",
        description:
          "Get only dependencies with confirmed breaking changes.\n\nAlways call this tool before:\n- approving dependency upgrades\n- merging pull requests\n- performing bulk dependency updates\n\nIf this returns results, recommend manual migration and testing.",
        inputSchema: {
          type: "object",
          properties: {
            repoUrl: {
              type: "string",
              description: "GitHub repository URL",
            },
            branch: {
              type: "string",
              description: "Git branch to analyze (default: main)",
              default: "main",
            },
          },
          required: ["repoUrl"],
        },
      },
      {
        name: "get_risk_summary",
        description:
          "Get a concise summary of dependency risks and repository health.\n\\nUse this tool for:\n- quick safety checks\n- high-level reports\n- answering “Is this repo safe?” questions",
        inputSchema: {
          type: "object",
          properties: {
            repoUrl: {
              type: "string",
              description: "GitHub repository URL",
            },
            branch: {
              type: "string",
              description: "Git branch to analyze (default: main)",
              default: "main",
            },
          },
          required: ["repoUrl"],
        },
      },
    ],
  };
});

// tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const toolName = request.params.name;
  const args = request.params.arguments;

  try {
    switch (toolName) {
      case "analyze_repository":
        return await handleFullAnalysis(args);

      case "get_high_risk_dependencies":
        return await handleHighRiskFilter(args);

      case "get_breaking_changes":
        return await handleBreakingChanges(args);

      case "get_risk_summary":
        return await handleRiskSummary(args);

      default:
        throw new Error(`Unknown tool: ${toolName}`);
    }
  } catch (error) {
    return handleError(error);
  }
});

// start server
const transport = new StdioServerTransport();
await server.connect(transport);
console.error("DURA MCP server running");
console.error("Available tools: analyze_repository, get_high_risk_dependencies, get_breaking_changes, get_risk_summary");