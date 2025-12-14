# DURA + CodeRabbit Integration Guide

Complete integration of dura-kit with CodeRabbit for automated dependency reviews.

## Quick Setup (5 Minutes)

### 1. Add GitHub Action

Create `.github/workflows/dura-analysis.yml`:
```yaml
name: DURA Analysis
on:
  pull_request:
    paths:
      - 'package.json'
      - 'package-lock.json'

permissions:
  pull-requests: write

jobs:
  analyze:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npx dura-kit https://github.com/${{ github.repository }} --json
```

### 2. Add CodeRabbit Config

Copy `.coderabbit.yaml` from [this repo](link-to-your-config)

### 3. Enable CodeRabbit

1. Go to https://coderabbit.ai
2. Sign in with GitHub
3. Install CodeRabbit GitHub App
4. Select your repository

### 4. Test It
```bash
# Create test branch
git checkout -b test-dura

# Modify package.json (add any dependency)
npm install lodash

# Commit and push
git add package.json package-lock.json
git commit -m "test: Add dependency"
git push -u origin test-dura

# Create PR and watch the magic!
```

## What Happens

When you create a PR that modifies dependencies:

1. **DURA runs automatically** (GitHub Action)
2. **Posts analysis comment** with risk levels
3. **CodeRabbit reviews the PR** 
4. **CodeRabbit references DURA findings**
5. **You get comprehensive analysis!**

## Example Output

### DURA Comment:
```
DURA Dependency Analysis

- Risk Summary
- High Risk: 2 dependencies
- Medium Risk: 5 dependencies
- Low Risk: 20 dependencies

High Risk Dependencies:
1. react: 17.0.0 → 18.0.0
   - Breaking changes detected
   - Review migration guide
...
```

### CodeRabbit Review:
```
CodeRabbit Review

According to DURA analysis, this PR updates React to v18 
which includes breaking changes. Please:

1. Review React 18 migration guide
2. Update components using deprecated APIs
3. Test Concurrent features if used
4. Check third-party library compatibility

Approve after addressing these items.
```

## For Your Team

Share this with your team:
```bash
# Install dura-kit CLI
npm install -g dura-kit

# Analyze before creating PR
dura https://github.com/yourorg/yourrepo

# Check specific dependencies
dura https://github.com/yourorg/yourrepo --json | jq '.dependencies[] | select(.riskLevel=="high")'
```

## Troubleshooting

**DURA action fails?**
- Check workflow logs in Actions tab
- Verify repository URL is correct
- Ensure PR modifies dependency files

**CodeRabbit not reviewing?**
- Check CodeRabbit is installed for your repo
- Verify `.coderabbit.yaml` is committed
- Check CodeRabbit dashboard

**No DURA comment on PR?**
- Ensure PR modifies package.json or lock files
- Check GitHub Action completed successfully
- Verify PR has write permissions

## Advanced Usage

### Monorepos

For monorepos with multiple package.json files:
```yaml
on:
  pull_request:
    paths:
      - '**/package.json'
      - '**/package-lock.json'
```

### Custom Risk Thresholds

Edit workflow to fail on medium risk:
```yaml
- name: Check Risk Level
  run: |
    if [ "${{ steps.parse.outputs.medium_risk }}" -gt "0" ]; then
      exit 1
    fi
```

### Scheduled Scans

Run DURA weekly:
```yaml
on:
  schedule:
    - cron: '0 0 * * 0'  # Every Sunday
```

## Links

- [dura-kit on npm](https://www.npmjs.com/package/dura-kit)
- [CodeRabbit](https://coderabbit.ai)