
// Extracts dependencies from package.json

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

  // console.log(deps);
  
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

// for testing

// extractDependencies({
//   "name": "dura",
//   "version": "1.0.0",
//   "main": "main.js",
//   "scripts": {
//     "start": "node main.js",
//     "test": "echo \"Error: no test specified\" && exit 1"
//   },
//   "keywords": [],
//   "author": "archie tansaria",
//   "license": "MIT License",
//   "description": "Dependency Update Risk Analyzer",
//   "dependencies": {
//     "crawlee": "^3.15.3",
//     "node-fetch": "^3.3.2",
//     "playwright": "^1.57.0",
//     "semver": "^7.7.3"
//   }
// }
// , true);

module.exports = {
  extractDependencies
};

