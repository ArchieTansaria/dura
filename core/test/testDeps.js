const pkg = require("../package.json"); // copy a real package.json here for testing
const { getDependencies } = require("../src/getDependencies");

console.log(getDependencies(pkg, true));
