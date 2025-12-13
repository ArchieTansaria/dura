const { scrapeReleases } = require("../src/scrapeReleases");

(async () => {
    const repo = "https://github.com/expressjs/express";
    const result = await scrapeReleases(repo);
    console.log(result);
})();
