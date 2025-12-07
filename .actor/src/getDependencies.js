/**
 * Extracts dependencies from package.json
 */

/**
 * Gets all dependencies from package.json
 * @param {Object} pkgJson - Parsed package.json object
 * @param {boolean} includeDev - Whether to include devDependencies (default: true)
 * @returns {Array<{name: string, range: string, type: "prod"|"dev"}>} - Array of dependency objects
 */
function extractDependencies(pkgJson, includeDev = true) {
  const deps = [];
  
  // Process production dependencies
  if (pkgJson.dependencies && typeof pkgJson.dependencies === "object") {
    for (const [name, range] of Object.entries(pkgJson.dependencies)) {
      deps.push({
        name,
        range: range || "",
        type: "prod"
      });
    }
  }
  
  // Process dev dependencies
  if (includeDev && pkgJson.devDependencies && typeof pkgJson.devDependencies === "object") {
    for (const [name, range] of Object.entries(pkgJson.devDependencies)) {
      deps.push({
        name,
        range: range || "",
        type: "dev"
      });
    }
  }
  
  return deps;
}

module.exports = {
  extractDependencies
};

