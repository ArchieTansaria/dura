const pkg = require("../../package.json"); // copy a real package.json here for testing
const { extractDependencies } = require("../src/getDependencies");

console.log(extractDependencies(pkg, true));
