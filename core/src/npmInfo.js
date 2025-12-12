
// Fetches package information from npm registry

// const fetch = require("node-fetch");

/**
 * Fetches package metadata from npm registry
 * @param {string} name - Package name (can be scoped like @types/node)
 * @returns {Promise<Object>} - Parsed JSON from npm registry
 */
async function fetchNpmInfo(name) {
  // Encode scoped packages properly
  const encodedName = encodeURIComponent(name);
  const url = `https://registry.npmjs.org/${encodedName}`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`NPM package not found: ${name}`);
    }
    throw new Error(`Failed to fetch npm info for ${name}: HTTP ${response.status}`);
  }
  
  return await response.json();
}

/**
 * Extracts the latest version from npm registry JSON
 * @param {Object} npmJson - Parsed JSON from npm registry
 * @returns {string|null} - Latest version string or null if not found
 */
function extractLatestVersion(npmJson) {
  if (npmJson["dist-tags"] && npmJson["dist-tags"].latest) {
    return npmJson["dist-tags"].latest;
  }
  return null;
}

/**
 * Extracts and normalizes GitHub repository URL from npm package metadata
 * @param {Object} npmJson - Parsed JSON from npm registry
 * @returns {string|null} - Cleaned GitHub URL (https://github.com/owner/repo) or null if not found
 */
function extractGithubRepoUrl(npmJson) {
  // Check repository field
  if (!npmJson.repository) {
    return null;
  }
  
  // Handle both string and object formats
  let repoUrl = null;
  if (typeof npmJson.repository === 'string') {
    repoUrl = npmJson.repository;
  } else if (npmJson.repository.url) {
    repoUrl = npmJson.repository.url;
  } else {
    return null;
  }
  
  // Normalize the URL
  // Remove git+ prefix
  let cleaned = repoUrl.replace(/^git\+/, '');
  
  // Remove git:// prefix
  cleaned = cleaned.replace(/^git:\/\//, '');
  
  // Remove .git suffix
  cleaned = cleaned.replace(/\.git$/, '');
  
  // Remove trailing slash
  cleaned = cleaned.replace(/\/$/, '');
  
  // Ensure it starts with https://
  if (!cleaned.startsWith('http://') && !cleaned.startsWith('https://')) {
    // If it's just github.com/owner/repo, add https://
    if (cleaned.includes('github.com')) {
      cleaned = 'https://' + cleaned;
    } else {
      return null;
    }
  }
  
  // Convert http:// to https://
  cleaned = cleaned.replace(/^http:\/\//, 'https://');
  
  // Validate it's a GitHub URL
  if (!cleaned.match(/^https:\/\/github\.com\/[^\/]+\/[^\/]+/)) {
    return null;
  }
  
  return cleaned;
}

module.exports = {
  fetchNpmInfo,
  extractLatestVersion,
  extractGithubRepoUrl
};

