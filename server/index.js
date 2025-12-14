#!/usr/bin/env node

const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const { promisify } = require('util');
const path = require('path');

const execAsync = promisify(exec);
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Get the path to the CLI
const CLI_PATH = path.join(__dirname, '../cli/bin/dura.js');

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'DURA API is running' });
});

// Analyze endpoint
app.post('/api/analyze', async (req, res) => {
  const { repoUrl, branch = 'main' } = req.body;

  if (!repoUrl) {
    return res.status(400).json({
      error: 'Missing required parameter: repoUrl',
      message: 'Please provide a GitHub repository URL',
    });
  }

  // Validate GitHub URL format
  const githubUrlPattern = /^https?:\/\/(www\.)?github\.com\/[\w\-\.]+\/[\w\-\.]+/;
  if (!githubUrlPattern.test(repoUrl)) {
    return res.status(400).json({
      error: 'Invalid repository URL',
      message: 'Please provide a valid GitHub repository URL (e.g., https://github.com/facebook/react)',
    });
  }

  try {
    // Run the DURA CLI command
    const command = `node ${CLI_PATH} "${repoUrl}" ${branch} --json`;
    
    const { stdout, stderr } = await execAsync(command, {
      maxBuffer: 10 * 1024 * 1024, // 10MB buffer
      timeout: 120000, // 2 minute timeout
      cwd: path.join(__dirname, '..'),
    });

    // Check for errors in stderr (non-fatal warnings are okay)
    if (stderr && !stderr.includes('warning') && !stderr.includes('Analyzing')) {
      console.error('CLI stderr:', stderr);
    }

    // Parse JSON output
    let results;
    try {
      results = JSON.parse(stdout);
    } catch (parseError) {
      console.error('Failed to parse JSON:', stdout);
      return res.status(500).json({
        error: 'Failed to parse analysis results',
        message: 'The analysis completed but returned invalid JSON',
      });
    }

    // Ensure results is an array
    if (!Array.isArray(results)) {
      results = [results];
    }

    // Return the results
    res.json(results);
  } catch (error) {
    console.error('Analysis error:', error);
    
    // Handle timeout
    if (error.code === 'ETIMEDOUT' || error.signal === 'SIGTERM') {
      return res.status(504).json({
        error: 'Analysis timeout',
        message: 'The analysis took too long to complete. Please try again or check if the repository is accessible.',
      });
    }

    // Handle command not found
    if (error.code === 'ENOENT') {
      return res.status(500).json({
        error: 'CLI not found',
        message: 'The DURA CLI could not be found. Please ensure it is properly installed.',
      });
    }

    // Generic error
    res.status(500).json({
      error: 'Analysis failed',
      message: error.message || 'An unexpected error occurred during analysis',
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🦖 DURA API server running on http://localhost:${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/api/health`);
  console.log(`   Analyze endpoint: POST http://localhost:${PORT}/api/analyze`);
});
