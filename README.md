# DURA - Dependency Update Risk Analyzer

Analyze dependency update risks in your projects and make informed decisions about which dependencies are safe to update.

## Installation

### NPX (No Installation Required)
```bash
npx dura-kit https://github.com/facebook/react
```

### Global Installation
```bash
npm install -g dura-kit
dura https://github.com/facebook/react
```

### Local Installation
```bash
npm install --save-dev dura-kit
npx dura https://github.com/facebook/react
```

## Usage

### Basic Usage
```bash
# Analyze a repository
dura <github-repo-url> [branch] [options]

# Examples
dura https://github.com/expressjs/express
dura https://github.com/expressjs/express develop
dura https://github.com/facebook/react main
```

### Output Formats

#### Summary (Default)
```bash
dura https://github.com/expressjs/express
```

Shows a concise summary of high-risk and breaking changes.

#### Table Format
```bash
dura https://github.com/expressjs/express --table
```

Displays all dependencies in a detailed table format with risk scores.

#### JSON Format
```bash
dura https://github.com/expressjs/express --json
```

Outputs machine-readable JSON for integration with other tools.

#### Combined Formats
```bash
dura https://github.com/expressjs/express --json --table
dura https://github.com/expressjs/express --table --summary
```

All flags are additive and can be combined.

### Debug Options

#### Verbose Mode
```bash
dura https://github.com/expressjs/express --verbose
```

Shows detailed progress information and warnings.

#### Debug Mode
```bash
dura https://github.com/expressjs/express --debug
```

Enables comprehensive debug logging including network requests and internal processing details.

## Understanding Risk Levels

DURA categorizes dependency updates into three risk levels:

### High Risk

- Major version updates (breaking changes)
- Known security vulnerabilities
- Deprecated packages
- Significant API changes

**Recommendation**: Review migration guides, update tests, and deploy to staging before production.

### Medium Risk

- Minor version updates with behavior changes
- New features that may affect existing functionality
- Dependencies with incomplete documentation

**Recommendation**: Review changelogs and test thoroughly.

### Low Risk

- Patch updates
- Bug fixes only
- Well-maintained dependencies with stable APIs

**Recommendation**: Generally safe to update with standard testing.

## Output Examples

### Summary Output
```
Confirmed breaking changes (2):
- merge-descriptors (prod) → confirmed breaking change
- eslint (dev) → major update with breaking changes

High-risk updates (3):
- accepts (prod) → major version gap
- cookie (prod) → major version gap
- fresh (prod) → major version gap

Medium-risk updates (4):
- connect-redis (dev) → major version update
- marked (dev) → major version update
```

### Table Output
```
+---------------+------+--------------+-----------------+--------+-------+----------------+-----------+-----------+
| name          | type | currentRange | currentResolved | latest | diff  | breakingSignal | riskScore | riskLevel |
+---------------+------+--------------+-----------------+--------+-------+----------------+-----------+-----------+
| express       | prod | ^4.18.2      | 4.18.2          | 5.0.0  | major | confirmed      | 75        | high      |
| lodash        | prod | ^4.17.20     | 4.17.20         | 4.17.21| patch | unknown        | 5         | low       |
+---------------+------+--------------+-----------------+--------+-------+----------------+-----------+-----------+
```

### JSON Output
```json
[
  {
    "name": "express",
    "type": "prod",
    "currentRange": "^4.18.2",
    "currentResolved": "4.18.2",
    "latest": "5.0.0",
    "diff": "major",
    "breakingChange": {
      "breaking": "confirmed",
      "confidenceScore": 0.9,
      "signals": {
        "strong": ["Breaking: Removed support for..."],
        "medium": [],
        "weak": []
      }
    },
    "riskScore": 75,
    "riskLevel": "high",
    "githubRepoUrl": "https://github.com/expressjs/express"
  }
]
```

## Command Reference

### Arguments

- `<repoUrl>` (required) - GitHub repository URL (e.g., https://github.com/expressjs/express)
- `[branch]` (optional) - Git branch to analyze (default: main)

### Options

- `--json` - Output in JSON format
- `--table` - Display results in table format
- `--summary` - Show summary (enabled by default)
- `--verbose` - Enable verbose logging
- `--debug` - Enable debug logging
- `--help` - Display help information
- `--version` - Display version number

## Use Cases

### Before Updating Dependencies
```bash
# Check what needs attention before running npm update
dura https://github.com/yourorg/yourproject
```

### Code Review
```bash
# Analyze dependencies changed in a PR
dura https://github.com/yourorg/yourproject feature-branch
```

### Security Audits
```bash
# Generate a report of all dependency risks
dura https://github.com/yourorg/yourproject --json > audit-report.json
```

## How It Works

1. **Fetches Repository Data** - Retrieves package.json and lock files from the specified repository
2. **Analyzes Dependencies** - Examines both direct and transitive dependencies
3. **Checks for Updates** - Compares current versions against latest available versions
4. **Detects Breaking Changes** - Scrapes GitHub releases and changelogs for breaking change indicators
5. **Calculates Risk Scores** - Assigns risk levels based on version differences, breaking changes, and security issues
6. **Generates Report** - Provides actionable recommendations for each dependency

## Breaking Change Detection

DURA analyzes GitHub releases and changelogs to detect breaking changes using multiple signals:

- **Strong Signals**: Explicit "BREAKING CHANGE" or "Breaking:" in release notes
- **Medium Signals**: Major version bumps, API removals, deprecations
- **Weak Signals**: "may break", "could affect", behavioral changes

Confidence scores range from 0.0 to 1.0, with 0.8+ indicating confirmed breaking changes.

## Risk Score Calculation

Risk scores are calculated based on:

- **Version Difference** (0-40 points)
  - Same version: 0 points
  - Patch: 5 points
  - Minor: 20 points
  - Major: 40 points

- **Breaking Change Signal** (0-30 points)
  - Confirmed: 30 points
  - Likely: 20 points
  - Unknown: 0 points

- **Security Vulnerabilities** (0-30 points)
  - Known vulnerabilities: 30 points
  - No known issues: 0 points

Total scores are mapped to risk levels:
- **0-15**: Low Risk
- **16-50**: Medium Risk
- **51-100**: High Risk

## Limitations

- Requires publicly accessible GitHub repositories
- Relies on publicly available release notes and changelogs
- May not detect all breaking changes if not documented
- Does not analyze code changes directly
- Network-dependent (requires internet connection)

## Troubleshooting

### "Repository not found"

Ensure the repository URL is correct and publicly accessible. Private repositories are not currently supported.

### "Rate limit exceeded"

GitHub API rate limits may be reached. Wait a few minutes and try again, or use authenticated requests (planned feature).

### "Cannot parse package.json"

Verify the repository contains a valid package.json file in the root or specified branch.

### Slow Analysis

Large repositories with many dependencies may take longer to analyze. Use `--verbose` to see progress.

## Contributing

Contributions are welcome! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup
```bash
git clone https://github.com/yourorg/dura
cd dura
npm install

# Link for local development
cd cli
npm link

# Run locally
dura https://github.com/facebook/react
```
## AI Assistant Integration

DURA integrates seamlessly with Cline and other AI assistants via MCP (Model Context Protocol).

### Quick Setup
```bash
# Install MCP server
npm install -g dura-mcp

# Configure Cline
# Add to VS Code Settings (JSON):
{
  "cline.mcpServers": {
    "dura": {
      "command": "dura-mcp"
    }
  }
}

# Restart VS Code
```

Now ask Cline: "Analyze dependencies for https://github.com/expressjs/express"

[Read full integration guide →](docs/CLINE_INTEGRATION.md)

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Links

- [npm Package](https://www.npmjs.com/package/dura-kit)
- [GitHub Repository](https://github.com/ArchieTansaria/dura)
- [Issue Tracker](https://github.com/ArchieTansaria/dura/issues)
- [Changelog](CHANGELOG.md)

## Related Projects

- [CodeRabbit Integration](docs/coderabbit-integration.md) - AI-powered code reviews with DURA
- [GitHub Actions](docs/github-actions.md) - Automated dependency analysis in CI/CD
- [MCP Server](docs/mcp-server.md) - Use DURA with Cline CLI

## Credits

Built with:
- [Commander.js](https://github.com/tj/commander.js) - CLI framework
- [Crawlee](https://crawlee.dev/) - Web scraping
- [Playwright](https://playwright.dev/) - Browser automation
- [Ora](https://github.com/sindresorhus/ora) - Terminal spinners
- [Chalk](https://github.com/chalk/chalk) - Terminal colors

## Support

For questions, issues, or feature requests:
- Open an [Issue](https://github.com/ArchieTansaria/dura/issues)
- Start a [Discussion](https://github.com/ArchieTansaria/dura/discussions)
- Read the [Documentation](docs/)

---

Made with <3 for safer dependency updates.