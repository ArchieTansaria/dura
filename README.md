# DURA - Dependency Update Risk Analyzer

Analyze dependency update risks and make informed decisions about your dependencies.

## Quick Start

```bash
# Run with npx (no installation)
npx dura-kit https://github.com/facebook/react

# Or install globally
npm install -g dura-kit

# Then use the 'dura' command
dura https://github.com/yourorg/yourrepo --json
```

## Features

- **Risk Assessment** - Categorizes updates as High, Medium, or Low risk
- **Security Analysis** - Detects known vulnerabilities
- **Breaking Changes** - Identifies potential breaking changes
- **JSON Output** - Easy CI/CD integration
- **GitHub Actions** - Automated PR analysis
- **CodeRabbit Integration** - AI-powered code reviews

## GitHub Actions Integration

Add DURA analysis to your PRs automatically:

```yaml
# .github/workflows/dura-analysis.yml
name: DURA Analysis
on: [pull_request]

jobs:
  analyze:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npx dura-kit https://github.com/${{ github.repository }} --json
```

## CodeRabbit Integration

DURA works seamlessly with CodeRabbit for AI-powered dependency reviews:

1. Add DURA workflow (above)
2. Install [CodeRabbit](https://coderabbit.ai)
3. Add `.coderabbit.yaml` config
4. CodeRabbit will reference DURA analysis in reviews! 🤖🦖

See [Integration Guide](./INTEGRATION_GUIDE.md) for details.

## Usage Examples

### CLI

```bash
# Basic analysis
npx dura-kit https://github.com/facebook/react

# JSON output for scripting
npx dura-kit https://github.com/yourorg/yourrepo --json

# Filter high-risk dependencies
npx dura-kit https://github.com/yourorg/yourrepo --json | \
  jq '.dependencies[] | select(.riskLevel=="high")'

# After global install, use shorter command
npm install -g dura-kit
dura https://github.com/yourorg/yourrepo
```

### In Your CI/CD

```bash
# In your build script
npx dura-kit https://github.com/$ORG/$REPO --json > dura-results.json

# Fail if high-risk dependencies found
HIGH_RISK=$(jq '[.dependencies[] | select(.riskLevel=="high")] | length' dura-results.json)
if [ "$HIGH_RISK" -gt "0" ]; then
  echo "High-risk dependencies found!"
  exit 1
fi
```

## Example Output

```
DURA Analysis Results

Risk Summary:
- High Risk: 2 dependencies
- Medium Risk: 5 dependencies
- Low Risk: 20 dependencies

High Risk Dependencies:
  - react@17.0.2 → 18.2.0
    Reason: Breaking changes in concurrent features
  - webpack@4.46.0 → 5.89.0
    Reason: Major version with config changes

Recommendations:
  1. Review React 18 migration guide
  2. Update webpack config for v5
  3. Test thoroughly before deploying
```

## Installation

### npx (Recommended)

No installation needed! Just run:
```bash
npx dura-kit <repo-url>
```

### Global Install

```bash
npm install -g dura-kit
dura <repo-url>
```

### Local Install

```bash
npm install --save-dev dura-kit
npx dura <repo-url>
```

## Configuration

### GitHub Action

See [full workflow example](.github/workflows/dura-analysis.yml)

### CodeRabbit

See [CodeRabbit config](.coderabbit.yaml) and [Integration Guide](./INTEGRATION_GUIDE.md)

## How It Works

1. **Fetches** package.json and lock files
2. **Analyzes** all dependencies (direct + transitive)
3. **Checks** for:
   - Version differences
   - Breaking changes
   - Security vulnerabilities
   - Deprecation notices
4. **Categorizes** risk levels
5. **Provides** actionable recommendations

## Risk Levels

- 🔴 **High Risk**: Breaking changes, security issues, major versions
- 🟡 **Medium Risk**: Minor updates with potential compatibility issues
- 🟢 **Low Risk**: Patch updates, bug fixes

## Use Cases

- PR reviews with automated risk analysis
- Pre-deployment dependency checks
- Security audit automation
- Dependency update planning
- Team dependency policies
- CI/CD quality gates

## Why DURA?

**Without DURA:**
- Manual changelog reading
- Unexpected breaking changes
- Missed security vulnerabilities
- Time-consuming reviews

**With DURA:**
- Automated risk assessment
- Prioritized updates
- Security alerts
- Fast, informed decisions
- AI-powered reviews (with CodeRabbit)

## Contributing

Contributions welcome! See [CONTRIBUTING.md](./CONTRIBUTING.md)

```bash
# Development setup
git clone https://github.com/yourorg/dura
cd dura
npm install

# Run locally
cd cli
npm link
dura https://github.com/facebook/react
```

## License

MIT

## Links

- [npm package](https://www.npmjs.com/package/dura-kit)
- [Documentation](./docs)
- [Issue Tracker](https://github.com/ArchieTansaria/dura/issues)
- [Discussions](https://github.com/ArchieTansaria/dura/discussions)

## Support

- [Integration Guide](./INTEGRATION_GUIDE.md)
- [Community Support](https://github.com/ArchieTansaria/dura/discussions)
- [Report Bug](https://github.com/ArchieTansaria/dura/issues/new)

---

**Made with 🦖 for safer dependency updates**