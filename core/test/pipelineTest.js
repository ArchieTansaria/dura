const { runDura } = require("../src/runDura.js");

(async () => {
    const repoUrl = "https://github.com/expressjs/express";
    const result = await runDura(repoUrl);
    console.log(JSON.stringify(result, null, 2));
})();
