const { fetchNpmInfo, extractLatestVersion } = require("../src/npmInfo");

(async () => {
    const data = await fetchNpmInfo("express");
    console.log(extractLatestVersion(data));  // should print something like "5.0.0"
})();
