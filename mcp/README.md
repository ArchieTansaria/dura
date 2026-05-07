# DURA MCP Server (`dura-mcp`)

The Model Context Protocol (MCP) server for DURA. This tool exposes DURA's powerful dependency analysis engine directly to AI coding agents, allowing them to contextually understand the risks of updating dependencies *before* they write the code to do it.

## Quick Setup

The easiest and most reliable way to provide DURA capabilities to your AI agent is via Docker or NPX.

Add one of the following to your agent's MCP configuration settings (usually `mcp_settings.json` or similar):

### Option 1: Docker (Recommended)

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
      "autoApprove": [],
      "cwd": "${workspaceFolder}"
    }
  }
}
```

### Option 2: NPX (No Docker Required)

If you have Node.js installed but not Docker, you can run the server directly via `npx`:

```json
{
  "mcpServers": {
    "dura-mcp": {
      "disabled": false,
      "timeout": 300,
      "type": "stdio",
      "command": "npx",
      "args": [
        "-y",
        "dura-mcp@latest"
      ],
      "autoApprove": [],
      "cwd": "${workspaceFolder}"
    }
  }
}
```

This pattern works for:

- Cline (VS Code)
- Cursor
- Claude Desktop / Claude Code
- Continue.dev
- Other MCP-compatible IDE and desktop clients that accept an `mcpServers` JSON block. [modelcontextprotocol](https://modelcontextprotocol.io/clients)

`cwd` is set to `${workspaceFolder}` so the server runs relative to your current project and can resolve local dependencies or configuration correctly.

| Client | Config Location |
|--------|-----------------|
| Cline | VS Code Settings → MCP |
| Cursor | Settings → MCP Servers |
| Claude Desktop | `~/Library/Application Support/Claude/` |
| Continue.dev | `~/.continue/mcp.json` |
| Roo Code | Settings → Tools |

**491+ MCP clients** - [Full list](https://www.pulsemcp.com/clients)

***

## Configuration Fallbacks

If `docker` does not work in your environment, you can fall back to local or absolute paths as needed.

### Option A: Local Project Install

Install locally in your project:

```bash
npm install dura-mcp
```

Then configure:

```json
{
  "mcpServers": {
    "dura": {
      "command": "node",
      "args": ["./node_modules/.bin/dura-mcp"],
      "cwd": "${workspaceFolder}"
    }
  }
}
```

### Option B: Absolute Path

Useful for global or non-standard installs:

```json
{
  "mcpServers": {
    "dura": {
      "command": "node",
      "args": ["/full/path/to/your/project/node_modules/.bin/dura-mcp"],
      "cwd": "/full/path/to/your/project"
    }
  }
}
```

### Option C: Global Binary

If `npm install -g dura-mcp` is used and `dura-mcp` is on your PATH: 

```json
{
  "mcpServers": {
    "dura": {
      "command": "dura-mcp"
    }
  }
}
```

***

## Verifying the Server in Terminal

From your project root (the same directory used as `cwd`):

```bash
# 1) Start the server
npx dura-mcp

# 2) List tools via MCP
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | npx dura-mcp

# 3) Call a tool directly
echo '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"get_risk_summary","arguments":{"repoUrl":"https://github.com/expressjs/express"}}}' | npx dura-mcp
```

If everything is wired correctly, you should see a JSON response listing four tools on `tools/list` and a structured result for `get_risk_summary` rather than an internal error.

***

## Available Tools

The DURA MCP server provides four tools for dependency risk analysis. 

### 1. `analyze_repository`

Complete dependency analysis with detailed risk assessment and actionable recommendations.

**Parameters**

- `repoUrl` (required): GitHub repository URL, for example `https://github.com/facebook/react`
- `branch` (optional): Git branch to analyze, default `main`
- `useCache` (optional): Use cached results if available, default `true`

**Returns**

- Overall health score and risk summary
- Critical issues requiring attention
- Breaking changes with evidence
- Prioritized action items
- Suggested update order

### 2. `get_high_risk_dependencies`

Focuses on only the highest-risk dependencies that require immediate attention.

**Parameters**

- `repoUrl` (required): GitHub repository URL
- `branch` (optional): Git branch, default `main`

**Returns**

- List of high-risk dependencies
- Explanation of why each is high risk
- Specific recommendations and priority guidance

### 3. `get_breaking_changes`

Returns only dependencies with confirmed breaking changes.

**Parameters**

- `repoUrl` (required): GitHub repository URL
- `branch` (optional): Git branch, default `main`

**Returns**

- Dependencies with confirmed breaking changes
- Confidence scores and supporting evidence from release notes
- Migration and upgrade guidance

### 4. `get_risk_summary`

Lightweight health check and risk overview.

**Parameters**

- `repoUrl` (required): GitHub repository URL
- `branch` (optional): Git branch, default `main`

**Returns**

- Health score (0–100)
- Risk distribution (high/medium/low)
- Overall status and recommendation

***

## Typical AI Usage Patterns

These examples illustrate how AI assistants tend to use the tools; they are not strict requirements: 

- Quick check:  
  “Is it safe to update my dependencies?” → `get_risk_summary`
- Deep audit:  
  “Analyze dependencies for https://github.com/expressjs/express” → `analyze_repository`
- Critical-only view:  
  “What are the risky dependencies in React?” → `get_high_risk_dependencies`
- Upgrade planning:  
  “What breaking changes do I need to worry about?” → `get_breaking_changes`

***

## How It Works

1. The AI assistant receives a dependency-related question.
2. The MCP client lists available tools from the DURA MCP server.
3. The AI chooses the appropriate tool (full analysis, high-risk only, breaking changes, or summary).
4. The MCP server runs the `dura-kit` CLI to analyze the target repository. [github](https://github.com/ArchieTansaria/dura/tree/main/cli)
5. Results are normalized into structured JSON and returned via MCP.
6. The AI formats the findings into natural language and follow-up recommendations.

***

## Caching Behavior

The MCP server caches repository analyses for one hour: 

- First query: Fetches fresh data, typically a few seconds.
- Repeated queries: Served from cache for the same repository and branch.
- Cache expiry: After one hour, the next call re-runs analysis.
- Manual refresh: Set `useCache: false` for `analyze_repository` to force a fresh run.

Cache is shared across tools, so one full analysis speeds up subsequent summary or filtered calls for the same repository. 

***

## Requirements

- Node.js 18.0.0 or higher
- Internet access (GitHub and npm APIs)
- Currently supports public GitHub repositories with a `package.json` in the root directory.

***

## Troubleshooting

### Docker: Cannot Connect / Daemon Not Running

If your MCP client fails to initialize the server and you are using the Docker setup:
- **Ensure Docker Desktop is running**: The Docker daemon must be active in the background.
- **Test manually**: Open a terminal and run `docker run --rm -i archietans/dura-mcp:latest`. If Docker is not running, it will give you an explicit error.
- **Pull the image manually**: Sometimes clients fail silently if they time out while pulling a new image. Run `docker pull archietans/dura-mcp:latest` to ensure you have the image downloaded.

### NPX/Node: Command Not Found: `dura-mcp`

If you are using the NPX or global install method and the client cannot find the command:

```bash
npm install -g dura-mcp
which dura-mcp
```

Ensure the printed path is on your `PATH` and update your configuration to use either `dura-mcp` (global) or `npx dura-mcp` as described above. 

### MCP Client Does Not Show Tools

- Confirm your config uses one of the working patterns above (especially `cwd`).
- Restart the client fully after editing MCP config.
- Open the client’s developer tools/console and check for spawn errors or path issues.

### Server Runs But Calls Fail

- **For NPX:** Run `echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | npx dura-mcp`
- **For Docker:** Run `echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | docker run --rm -i archietans/dura-mcp:latest`
- If this terminal test fails, adjust `cwd` and `args` until terminal tests succeed, then mirror that in your MCP config.

### Analysis Errors

- Verify the repository URL is public and valid.
- Ensure the repo contains `package.json` at the root.
- Test the underlying CLI directly:  
  `npx dura-kit https://github.com/owner/repo` 

***

## Development

### Running from Source

```bash
git clone https://github.com/ArchieTansaria/dura.git
cd dura/mcp
npm install
node server.js
```

The server starts and waits for MCP JSON-RPC messages on stdin.

### Testing with MCP Inspector

```bash
npm install -g @modelcontextprotocol/inspector
npx @modelcontextprotocol/inspector node server.js
```

Use the inspector UI to list tools, call each one, and inspect responses. [modelcontextprotocol](https://modelcontextprotocol.info/docs/concepts/resources/)

### Local Development with an MCP Client

```bash
cd dura/mcp
npm link

# Then in your MCP client config:
{
  "mcpServers": {
    "dura-mcp": {
      "command": "dura-mcp"
    }
  }
}
```
