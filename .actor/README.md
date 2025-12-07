# DURA Actor - Dependency Update Risk Analyzer

An Apify Actor that analyzes Node.js project dependencies to assess the risk of updating them. The Actor fetches package.json from a GitHub repository, compares current dependency versions with the latest available versions, scrapes GitHub releases for breaking changes, and computes a risk score for each dependency.

## Features

- Fetches package.json from GitHub repositories
- Analyzes both production and development dependencies
- Compares semantic versions (major, minor, patch differences)
- Detects breaking changes by scraping GitHub releases
- Computes risk scores for each dependency
- Outputs structured JSON results to Apify dataset

## Using This Actor from the Apify Store

This Actor is available in the [Apify Store](https://apify.com/store), making it easy for anyone to use without writing code. Here's how to run it:

### Step-by-Step Guide

1. **Open the Actor in Apify Store**
   - Visit the Apify Store and search for "DURA" or "Dependency Update Risk Analyzer"
   - Click on the Actor to open its page

2. **Start a Run**
   - Click the **"Try for Free"** or **"Run"** button
   - You'll be redirected to the Apify Console with the Actor ready to run

3. **Enter Input**
   - In the **Input** section, you'll see a JSON input field
   - Paste your GitHub repository URL:
     ```json
     {
       "repoUrl": "https://github.com/your-username/your-repo"
     }
     ```
   - Optionally specify a branch:
     ```json
     {
       "repoUrl": "https://github.com/your-username/your-repo",
       "branch": "develop"
     }
     ```

4. **Start the Actor**
   - Click the **"Start"** button
   - The Actor will begin analyzing dependencies
   - You can monitor progress in real-time via the logs

5. **View Results**
   - Once the run completes, navigate to **Storage → Dataset**
   - Click on the default dataset to view all analyzed dependencies
   - Each dependency will have its risk score, version differences, and breaking change indicators

### Exporting Results

You can export your results in multiple formats:

- **JSON**: Click "Download JSON" to get all results as a JSON file
- **CSV**: Click "Download CSV" for spreadsheet-compatible format
- **Excel**: Click "Download Excel" for Microsoft Excel format
- **API**: Use the Dataset API to fetch results programmatically

### Scheduling Runs (Optional)

For periodic monitoring, you can set up a schedule:

1. Go to **Schedules** in the Apify Console
2. Create a new schedule for this Actor
3. Set your desired frequency (daily, weekly, etc.)
4. The Actor will automatically run and update your dataset

This is perfect for monitoring dependency updates over time and catching breaking changes early!

## Input

The Actor accepts the following input via JSON:

```json
{
  "repoUrl": "https://github.com/expressjs/express",
  "branch": "main"
}
```

### Input Parameters

- **repoUrl** (required): The GitHub repository URL to analyze
- **branch** (optional): The git branch to analyze (defaults to "main")

## Output

The Actor outputs results to the default Apify dataset. Each dependency is represented as a JSON object with the following structure:

```json
{
  "name": "express",
  "type": "prod",
  "current": "^4.18.2",
  "latest": "4.19.2",
  "diff": "minor",
  "currentResolved": "4.18.2",
  "breaking": false,
  "breakingKeywords": [],
  "releasesUrl": "https://github.com/expressjs/express/releases",
  "releaseNotesSnippet": "...",
  "riskScore": 20,
  "riskLevel": "medium"
}
```

### Output Fields

- **name**: Package name
- **type**: Dependency type ("prod" or "dev")
- **current**: Current version range from package.json
- **latest**: Latest version available on npm
- **diff**: Version difference type ("major", "minor", "patch", "same", or "unknown")
- **currentResolved**: Resolved minimum version from the range
- **breaking**: Boolean indicating if breaking changes were detected
- **breakingKeywords**: Array of breaking change keywords found
- **releasesUrl**: URL to GitHub releases page (if available)
- **releaseNotesSnippet**: First 500 characters of release notes
- **riskScore**: Computed risk score (0-100)
- **riskLevel**: Risk level ("high", "medium", or "low")

## Risk Scoring

The risk score is calculated based on:

- **Version difference**: Major updates (+60), minor updates (+20), patch updates (+5)
- **Breaking changes**: Additional +25 if breaking changes detected
- **Dependency type**: Dev dependencies are weighted 0.7x (less risky)

Risk levels:
- **High**: Score ≥ 60
- **Medium**: Score ≥ 30
- **Low**: Score < 30

## Running with Apify CLI (Full Instructions)

The Apify CLI allows you to run and test the Actor locally before deploying it to Apify Cloud.

#### Prerequisites

1. **Install Node.js** (version 18 or higher)
   ```bash
   node --version  # Should show v18.x.x or higher
   ```

2. **Install Apify CLI globally**
   ```bash
   npm install -g apify-cli
   ```

3. **Install project dependencies**
   ```bash
   cd .actor
   npm install
   ```

#### Running the Actor Locally

**Option 1: Run with default input**

If you have an `INPUT.json` file in the `.actor` folder:
```bash
apify run
```

**Option 2: Run with custom JSON input**

Provide input directly via command line:
```bash
apify run --input '{"repoUrl": "https://github.com/expressjs/express"}'
```

Or with a specific branch:
```bash
apify run --input '{"repoUrl": "https://github.com/expressjs/express", "branch": "main"}'
```

**Option 3: Run with input file**

Create an `INPUT.json` file in the `.actor` folder:
```json
{
  "repoUrl": "https://github.com/expressjs/express",
  "branch": "main"
}
```

Then run:
```bash
apify run
```

#### Viewing Dataset Results Locally

After running the Actor, results are stored locally in:
```
.actor/storage/datasets/default/
```

You can view the JSON files directly, or use the Apify CLI to inspect:
```bash
apify run --purge  # Clean previous runs
apify run           # Run the Actor
# Results will be in .actor/storage/datasets/default/
```

#### Deploying to Apify Cloud

1. **Push your Actor to Apify**
   ```bash
   apify push
   ```
   This uploads your Actor code to your Apify account.

2. **Run from Apify Console**
   - Go to [Apify Console](https://console.apify.com)
   - Navigate to **Actors → Your Actors**
   - Find your "dura" Actor
   - Click **"Start"**
   - Enter input in the JSON field
   - Click **"Start"** to begin the run

3. **Run via CLI after pushing**
   ```bash
   apify run --remote
   ```
   This runs the Actor in Apify Cloud instead of locally.

## Output Access in Apify Console

All Actor results are automatically stored in Apify's built-in storage system. Here's how to access them:

### Finding Your Dataset

1. **Navigate to Storage**
   - After a run completes, go to the **Storage** tab in the Apify Console
   - Click on **"Datasets"** in the left sidebar

2. **Open Your Dataset**
   - Find the dataset named after your Actor run (e.g., "dura-XXXXX")
   - Click on it to view all dependency analysis results

3. **View Results**
   - Each row represents one dependency analysis
   - Click on any row to see the full JSON object with all details
   - Use the search/filter functionality to find specific dependencies

### Downloading Results

**Download Options:**
- **JSON**: Click "Download JSON" for raw data
- **CSV**: Click "Download CSV" for spreadsheet analysis
- **Excel**: Click "Download Excel" for Microsoft Excel
- **JSONL**: Click "Download JSONL" for line-delimited JSON

### Accessing via API

You can also fetch results programmatically using the Apify API:

```bash
# Get dataset ID from the console, then:
curl "https://api.apify.com/v2/datasets/{DATASET_ID}/items?token={YOUR_API_TOKEN}"
```

Or using the Apify JavaScript client:
```javascript
const { ApifyClient } = require('apify-client');
const client = new ApifyClient({ token: 'YOUR_API_TOKEN' });
const { items } = await client.dataset('DATASET_ID').listItems();
```

### Dataset Structure

Each dataset contains one item per dependency, with the structure shown in the [Output](#output) section above.

## Example

Analyze Express.js dependencies:

```json
{
  "repoUrl": "https://github.com/expressjs/express",
  "branch": "main"
}
```

The Actor will:
1. Fetch package.json from the Express repository
2. Extract all dependencies
3. For each dependency:
   - Fetch latest version from npm
   - Compare semantic versions
   - Scrape GitHub releases for breaking changes
   - Compute risk score
4. Output results to the dataset

## How It Works (High-Level Architecture)

Understanding the Actor's internal workflow helps you interpret results and troubleshoot issues:

### 1. Package.json Fetch
- The Actor parses the GitHub repository URL
- Attempts to fetch `package.json` from the specified branch (or tries `main`, `master`, or the default branch)
- Uses GitHub's raw content API for efficient retrieval

### 2. Dependency Extraction
- Parses `package.json` to extract both `dependencies` and `devDependencies`
- Normalizes version ranges (e.g., `^1.2.3`, `~4.5.6`, `>=7.0.0`)
- Categorizes each dependency as either production (`prod`) or development (`dev`)

### 3. NPM Registry Lookup
- For each dependency, queries the npm registry API
- Retrieves the latest published version
- Extracts GitHub repository URL from package metadata (if available)

### 4. Semantic Version Analysis
- Uses the `semver` library to compare current version range with latest version
- Resolves the minimum version that satisfies the current range
- Determines the difference type:
  - **major**: Breaking changes likely
  - **minor**: New features, backward compatible
  - **patch**: Bug fixes only
  - **same**: Already up to date
  - **unknown**: Version comparison failed

### 5. GitHub Releases Scraping
- If a GitHub repository URL is found in npm metadata:
  - Uses **PlaywrightCrawler** (from Crawlee) to scrape the releases page
  - Loads the page in a headless browser
  - Extracts release notes text
  - Searches for breaking change indicators:
    - "breaking change", "breaking changes", "breaking"
    - "deprecated", "removed", "migration"
    - "upgrade guide", "not backwards compatible", "bc break"
- If no GitHub URL is found, marks breaking changes as `false`

### 6. Risk Score Computation
- Calculates a base score from version difference:
  - Major: +60 points
  - Minor: +20 points
  - Patch: +5 points
  - Same: 0 points
  - Unknown: +10 points
- Adds +25 points if breaking changes are detected
- Applies 0.7x multiplier for dev dependencies (less critical)
- Categorizes risk level:
  - **High**: Score ≥ 60
  - **Medium**: Score ≥ 30
  - **Low**: Score < 30

### 7. Dataset Output
- Each dependency analysis is pushed to the default Apify dataset using `Actor.pushData()`
- Results are immediately available in the Apify Console
- Data persists even after the Actor run completes

### Error Handling

The Actor is designed to be resilient:
- If a dependency can't be found on npm, it's marked as "unknown"
- If GitHub scraping fails, breaking changes default to `false`
- Individual dependency errors don't stop the entire analysis
- All errors are logged for debugging

## Requirements

- Node.js 18+
- Apify account and CLI configured
- Internet access for fetching npm registry and GitHub data

## License

MIT License

Copyright (c) 2025 Archie Tansaria

