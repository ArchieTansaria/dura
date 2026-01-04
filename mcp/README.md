# DURA MCP Server

MCP (Model Context Protocol) server for [DURA](https://github.com/ArchieTansaria/dura) - Dependency Update Risk Analyzer.

Integrates DURA's dependency analysis capabilities with AI assistants like Cline, Claude Desktop, and any MCP-compatible client.

## Quick Start

### Installation

```bash
npm install -g dura-mcp
```

This automatically makes `dura-mcp` available globally. The server will use `dura-kit` via npx when needed.

### Usage with Cline (VS Code)

1. **Install the MCP server:**
   ```bash
   npm install -g dura-mcp
   ```

2. **Configure Cline:**
   
   Open VS Code Settings (JSON):
   - Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux)
   - Type: "Preferences: Open User Settings (JSON)"
   - Add the following:

   ```json
   {
     "cline.mcpServers": {
       "dura": {
         "command": "dura-mcp"
       }
     }
   }
   ```

3. **Restart VS Code**

4. **Use it with Cline:**
   
   Open Cline and ask natural questions:
   - "Analyze dependencies for https://github.com/expressjs/express"
   - "What are the high-risk dependencies in React?"
   - "Show me breaking changes in Next.js"
   - "Is it safe to update my dependencies?"

### Usage with Claude Desktop

Add to your Claude Desktop configuration file:

**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`

**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "dura": {
      "command": "dura-mcp"
    }
  }
}
```

Restart Claude Desktop and start asking about dependencies!

## Available Tools

The DURA MCP server provides four specialized tools that AI assistants can use:

### 1. `analyze_repository`

Complete dependency analysis with detailed risk assessment and actionable recommendations.

**Parameters:**
- `repoUrl` (required): GitHub repository URL (e.g., `https://github.com/facebook/react`)
- `branch` (optional): Git branch to analyze (default: `main`)
- `useCache` (optional): Use cached results if available (default: `true`)

**Returns:**
- Health score and risk summary
- Critical issues requiring attention
- Breaking changes with evidence
- Prioritized action items
- Suggested update order

**Example:**
```
User: "Analyze dependencies for https://github.com/expressjs/express"

AI receives:
- Health Score: 68/100
- 3 high-risk dependencies
- 2 breaking changes
- Specific actions to take
```

### 2. `get_high_risk_dependencies`

Get only dependencies with high risk that need immediate attention.

**Parameters:**
- `repoUrl` (required): GitHub repository URL
- `branch` (optional): Git branch (default: `main`)

**Returns:**
- List of high-risk dependencies only
- Why each is high-risk
- Specific recommendations for each
- Update priority guidance

**Example:**
```
User: "What are the risky dependencies in React?"

AI gets only the critical dependencies that need review.
```

### 3. `get_breaking_changes`

Get only dependencies with confirmed breaking changes.

**Parameters:**
- `repoUrl` (required): GitHub repository URL
- `branch` (optional): Git branch (default: `main`)

**Returns:**
- Dependencies with confirmed breaking changes
- Confidence scores
- Evidence from release notes
- Migration planning guidance

**Example:**
```
User: "Show me breaking changes in Next.js"

AI gets specific breaking changes and how to handle them.
```

### 4. `get_risk_summary`

Quick health check and risk overview without detailed data.

**Parameters:**
- `repoUrl` (required): GitHub repository URL
- `branch` (optional): Git branch (default: `main`)

**Returns:**
- Health score (0-100)
- Risk distribution (high/medium/low)
- Quick status assessment
- Overall recommendation

**Example:**
```
User: "Is my project safe to update?"

AI gets instant health score and quick answer.
```

## Features

- **Smart Caching**: Analysis results cached for 1 hour to speed up repeated queries
- **Actionable Output**: Prioritized recommendations, not just data dumps
- **Breaking Change Detection**: Scrapes GitHub releases to find confirmed breaking changes
- **Risk Scoring**: Intelligent risk assessment based on version changes and breaking signals
- **Multiple Tools**: Specialized tools for different use cases (overview, deep-dive, specific filters)

## Usage Examples

### Quick Health Check

```
User: "Is express safe to update?"

AI: [calls get_risk_summary]
"Express has a health score of 72/100. There are 3 high-risk 
dependencies that need attention. Would you like details?"
```

### Detailed Analysis

```
User: "Analyze all dependencies in my project"

AI: [calls analyze_repository]
"I found 2 critical issues:
1. eslint (breaking changes confirmed)
2. webpack (major version jump)

Here's the recommended update order..."
```

### Focus on Critical Issues

```
User: "What breaking changes do I need to worry about?"

AI: [calls get_breaking_changes]
"Found 2 dependencies with breaking changes:
- eslint: Config syntax changed in v9
- react: New JSX transform required

I recommend updating eslint first..."
```

### Repository Comparison

```
User: "Compare dependency health of express vs fastify"

AI: [calls get_risk_summary for both]
"Express: Health score 72/100, 3 high-risk deps
Fastify: Health score 89/100, 0 high-risk deps

Fastify is in better shape for updates."
```

## How It Works

1. **AI Assistant** receives a question about dependencies
2. **MCP Server** provides tools the AI can call
3. **AI chooses** the appropriate tool (full analysis, high-risk filter, etc.)
4. **MCP Server** runs `dura-kit` CLI to analyze the repository
5. **Results** are formatted and returned to the AI
6. **AI presents** findings in natural language to the user

The MCP server acts as a bridge between AI assistants and DURA's analysis engine.

## Caching Behavior

Analysis results are cached for 1 hour to improve performance:

- First query: Fetches fresh data (5-10 seconds)
- Subsequent queries: Returns cached data instantly
- Cache expires: After 1 hour, fresh data fetched automatically
- Force refresh: Set `useCache: false` in parameters

Cache is shared across all tools, so analyzing a repository once makes all other tools fast.

## Requirements

- **Node.js**: 18.0.0 or higher
- **Internet**: Required for GitHub and npm API access
- **Public Repositories**: Currently only supports public GitHub repositories

## Troubleshooting

### Command not found: dura-mcp

**Solution:** Ensure the package is installed globally:
```bash
npm install -g dura-mcp
which dura-mcp  # Should show installation path
```

### Cline doesn't see the MCP server

**Solutions:**
1. Restart VS Code completely (close all windows)
2. Verify settings are saved correctly
3. Check for errors in VS Code Developer Tools: `Help → Toggle Developer Tools → Console`

### MCP server not connecting

**Solutions:**
1. Test the server manually: Run `dura-mcp` in terminal - it should say "Server running"
2. Check Node.js version: `node --version` (must be 18+)
3. Reinstall if needed: `npm uninstall -g dura-mcp && npm install -g dura-mcp`

### Analysis fails or times out

**Common causes:**
- Invalid or private repository URL
- Network connectivity issues
- Repository doesn't contain package.json

**Solutions:**
1. Verify repository is public: Visit the URL in a browser
2. Check internet connection
3. Test with DURA CLI directly: `npx dura-kit <repo-url>`
4. Check repository has package.json in the root

### "Repository not found" error

**Solutions:**
- Ensure URL format is correct: `https://github.com/owner/repo`
- Repository must be public (private repos not supported)
- Check repository actually exists

### Rate limiting

GitHub API rate limits may affect analysis:
- Unauthenticated: 60 requests/hour
- Authenticated: 5000 requests/hour (future feature)

**Solution:** Wait a few minutes before retrying.

## Development

### Running from Source

```bash
git clone https://github.com/ArchieTansaria/dura.git
cd dura/mcp
npm install
node server.js
```

The server will start and wait for MCP protocol messages on stdin.

### Testing

Use the MCP Inspector to test the server:

```bash
npm install -g @modelcontextprotocol/inspector
npx @modelcontextprotocol/inspector node server.js
```

Then test each tool in the web interface.

### Local Development with Cline

```bash
cd dura/mcp
npm link

# Add to VS Code settings:
{
  "cline.mcpServers": {
    "dura": {
      "command": "dura-mcp"
    }
  }
}
```

## Links

- **DURA CLI**: [dura-kit on npm](https://www.npmjs.com/package/dura-kit)
- **GitHub Repository**: [ArchieTansaria/dura](https://github.com/ArchieTansaria/dura)
- **MCP Documentation**: [Model Context Protocol](https://modelcontextprotocol.io)
- **Report Issues**: [GitHub Issues](https://github.com/ArchieTansaria/dura/issues)

## Related Packages

- **dura-kit** - The core CLI tool for dependency analysis
  ```bash
  npm install -g dura-kit
  dura https://github.com/expressjs/express
  ```

## Contributing

Contributions welcome! See the [main repository](https://github.com/ArchieTansaria/dura) for contribution guidelines.

## License

MIT License - see [LICENSE](https://github.com/ArchieTansaria/dura/blob/main/LICENSE) file for details.

## Support

- Documentation: [GitHub Repository](https://github.com/ArchieTansaria/dura)
- Issues: [GitHub Issues](https://github.com/ArchieTansaria/dura/issues)
- Discussions: [GitHub Discussions](https://github.com/ArchieTansaria/dura/discussions)

---

**Built with Model Context Protocol for seamless AI integration**