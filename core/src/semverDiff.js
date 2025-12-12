
// Compares semantic versions to determine the difference

const semver = require("semver");

/**
 * Computes the semantic version difference between current range and latest version
 * @param {string} currentRange - Current version range (e.g., "^1.2.3", "~4.5.6", "1.0.0")
 * @param {string} latestVersion - Latest version from npm registry
 * @returns {{diff: string, currentResolved: string|null}} - Diff type and resolved current version
 */
function semverDiff(currentRange, latestVersion) {
  // Resolve the minimum version that satisfies the range
  let currentResolved = null;
  
  try {
    currentResolved = semver.minVersion(currentRange);
    if (currentResolved) {
      currentResolved = currentResolved.version;
    }
  } catch (error) {
    // Invalid range, return unknown
    return {
      diff: "unknown",
      currentResolved: null
    };
  }
  
  // Validate both versions
  if (!currentResolved || !semver.valid(currentResolved)) {
    return {
      diff: "unknown",
      currentResolved: null
    };
  }
  
  if (!semver.valid(latestVersion)) {
    return {
      diff: "unknown",
      currentResolved
    };
  }
  
  // Compare versions
  const currentMajor = semver.major(currentResolved);
  const currentMinor = semver.minor(currentResolved);
  const currentPatch = semver.patch(currentResolved);
  
  const latestMajor = semver.major(latestVersion);
  const latestMinor = semver.minor(latestVersion);
  const latestPatch = semver.patch(latestVersion);
  
  if (currentMajor !== latestMajor) {
    return {
      diff: "major",
      currentResolved
    };
  } else if (currentMinor !== latestMinor) {
    return {
      diff: "minor",
      currentResolved
    };
  } else if (currentPatch !== latestPatch) {
    return {
      diff: "patch",
      currentResolved
    };
  } else {
    return {
      diff: "same",
      currentResolved
    };
  }
}

module.exports = {
  semverDiff
};

