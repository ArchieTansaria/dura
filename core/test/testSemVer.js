const { semverDiff } = require("../src/semverDiff.js");

console.log(semverDiff("^4.18.2", "5.0.0"));
console.log(semverDiff("1.2.3", "1.2.3"));
console.log(semverDiff("^1.2.3", "1.3.0"));
