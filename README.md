<div align="center">
  <img src="./client/public/favicon.svg" alt="DURA Logo" width="100" height="100" />

  <br>

  <h1>DURA</h1>
  <p><strong>Dependency Update Risk Analyzer</strong></p>

  <p>
    <img src="https://img.shields.io/badge/Ecosystem-CLI%20%7C%20GitHub%20App%20%7C%20MCP-black?style=for-the-badge" alt="Ecosystem" />
    <img src="https://img.shields.io/badge/npm-v2.0.1-blue?style=for-the-badge&logo=npm" alt="NPM Version" />
    <img src="https://img.shields.io/badge/License-MIT-success?style=for-the-badge" alt="License" />
  </p>
</div>

<br/>

Analyze dependency update risks in your projects and make informed decisions about which dependencies are safe to update. 

DURA is a comprehensive ecosystem designed to help developers update NPM packages safely by analyzing GitHub releases, changelogs, and version diffs to calculate a deterministic "Risk Score" for every update.

---

## The DURA Ecosystem

DURA is accessible through three main interfaces, depending on your workflow:

1. **[DURA CLI (`dura-kit`)](#1-dura-cli-dura-kit)**: For terminal usage and local scripting.
2. **[DURA GitHub App](#2-dura-github-app-client--backend)**: For automated CI/CD PR comments and a unified web dashboard.
3. **[DURA MCP Server (`dura-mcp`)](#3-dura-mcp-server)**: For integrating DURA directly into AI coding agents.

---

## 1. DURA CLI (`dura-kit`)

The core engine of DURA is available as a standalone CLI tool. It requires no installation to try.

### Usage

```bash
# Analyze a repository instantly
npx dura-kit https://github.com/facebook/react

# Or install globally
npm install -g dura-kit
dura https://github.com/expressjs/express
```

### Output Formats
The CLI supports multiple output formats for easy reading or machine parsing:
- `--summary` (Default): Concise summary of high-risk and breaking changes.
- `--table`: Displays all dependencies in a detailed table format.
- `--json`: Outputs machine-readable JSON for CI integration.

> **For detailed usage, options, and programmatic API access, please read the [DURA CLI Documentation](cli/README.md).**

---

## 2. DURA GitHub App (Client & Backend)

The DURA GitHub App automates dependency analysis for your repositories. It runs automatically on pull requests, pushes, and installations, posting comments directly on PRs and displaying historical data on a unified web dashboard.

### Architecture Overview

To maintain a highly available but cost-effective infrastructure, the DURA backend utilizes a custom **Event-Driven, Scale-to-Zero Architecture** hosted on AWS.

**Request Flow:**
1. **GitHub Webhooks** trigger an **AWS Lambda (Proxy)**.
2. The Lambda forwards the payload to the **API Service** and simultaneously wakes up the **Worker Service**.
3. The API Service adds the analysis job to **Redis (BullMQ)**.
4. The Worker Service processes the job from Redis and saves results to **MongoDB**.
5. After 10 minutes of inactivity, the Worker Service programmatically scales itself back down to 0.

### Components
- **Frontend (`/client`)**: A modern Next.js/React application providing a premium glassmorphic dashboard to view repository health, risks, and historical scans.
- **Backend API (`/github-app`)**: An Express API running continuously on AWS ECS Fargate Spot instances. It handles authentication and serves data to the frontend.
- **Scale-to-Zero Worker (`/github-app/src/workers`)**: The heavy lifting (web scraping, dependency analysis) is done by a BullMQ worker.
  - **AWS Lambda Router (`/lambda/webhook-router`)**: To save costs, the Worker service scales to zero when inactive. GitHub webhooks hit a fast AWS Lambda function first.
  - **Self-Termination**: After processing all jobs, the Worker monitors the Redis queue. If the queue remains completely drained for 10 minutes, the Worker calls the AWS SDK to set its own `desiredCount` to 0.

> **For detailed setup, environment variables, and deployment instructions, please read the [DURA GitHub App Documentation](github-app/README.md).**

---

## 3. DURA MCP Server

DURA integrates seamlessly with AI coding agents via the Model Context Protocol (MCP). This allows your AI agents to natively understand the risk of updating a dependency within their context window before writing any code.

### Configuration Setup

You can provide DURA capabilities to any MCP-compatible AI agent by adding the following to your agent's MCP configuration settings (usually `mcp_settings.json` or similar):

```json
{
  "mcpServers": {
    "dura-mcp": {
      "disabled": false,
      "timeout": 300,
      "type": "stdio",
      "command": "docker",
      "args": [
        "run",
        "--rm",
        "-i",
        "--tty=false",
        "archietans/dura-mcp:latest"
      ],
      "autoApprove": []
    }
  }
}
```

Now you can prompt your AI agent: *"Analyze dependencies for https://github.com/expressjs/express and update the low-risk ones."*

> **For detailed tool definitions and prompt examples, please read the [DURA MCP Server Documentation](mcp/README.md).**

---

## Understanding Risk Levels

DURA categorizes dependency updates into three risk levels by calculating a comprehensive **Risk Score (0-100)**:

### High Risk (Score: 51-100)
- Major version updates (breaking changes)
- Known security vulnerabilities
- Deprecated packages
- Confirmed breaking changes via GitHub Release scraping

### Medium Risk (Score: 16-50)
- Minor version updates with significant behavior changes
- "Likely" or "Unknown" breaking changes in changelogs

### Low Risk (Score: 0-15)
- Patch updates
- Bug fixes only
- Well-maintained dependencies with stable APIs

---

## Development Setup

To run DURA locally:

```bash
git clone https://github.com/ArchieTansaria/dura.git
cd dura

# 1. Install dependencies across all workspaces
npm install

# 2. Run the CLI locally
cd dura-kit
npm link
dura https://github.com/facebook/react

# 3. Run the GitHub App & Client
# See github-app/README.md for environment setup
```

---

## License

MIT License - see [LICENSE](LICENSE) file for details.

Made with <3 for safer dependency updates.
