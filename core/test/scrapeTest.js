const { scrapeReleases } = require("../src/scrapeReleases");

(async () => {
    const repo = "https://github.com/vercel/next.js";
    const result = await scrapeReleases(repo);
    console.log(result);
})();
