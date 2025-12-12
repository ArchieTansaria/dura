const { PlaywrightCrawler } = require("crawlee");
// const { logStep } = require("./utils");

function normalizeGitHubUrl(repoUrl) {
  if (!repoUrl) return null;

  let cleaned = repoUrl
    .replace(/^git\+/, "")
    .replace(/^git:\/\//, "")
    .replace(/\.git$/, "")
    .replace(/\/$/, "");

  if (!cleaned.startsWith("http://") && !cleaned.startsWith("https://")) {
    if (cleaned.includes("github.com")) cleaned = "https://" + cleaned;
    else return null;
  }

  cleaned = cleaned.replace(/^http:\/\//, "https://");

  if (!cleaned.match(/^https:\/\/github\.com\/[^\/]+\/[^\/]+/)) return null;

  return cleaned;
}

async function scrapeReleases(repoUrl) {
  const normalizedUrl = normalizeGitHubUrl(repoUrl);

  if (!normalizedUrl) {
    return { breaking: false, keywords: [], text: "" };
  }

  const releasesUrl = `${normalizedUrl}/releases`;

  let result = {
    breaking: false,
    keywords: [],
    text: "",
  };

  // logStep(`Visiting Releases Page: ${releasesUrl}`);

  const crawler = new PlaywrightCrawler({
    maxConcurrency: 1,
    requestHandlerTimeoutSecs: 60,
    navigationTimeoutSecs: 60,
    launchContext: {
      launchOptions: {
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      },
    },
    requestHandler: async ({ page, request, log }) => {
      log.info(`Visiting Releases Page: ${request.url}`);

      await page.goto(request.url, {
        waitUntil: "domcontentloaded",
        timeout: 60000,
      });

      // Try multiple GitHub selectors
      const POSSIBLE_SELECTORS = [
        "div.release-entry", // legacy
        "div.markdown-body", // older GitHub pages
        "div.Box-body", // newer style
        ".prose", // GitHub's new markdown wrapper
        ".markdown-body", // fallback
      ];

      let text = "";

      for (const selector of POSSIBLE_SELECTORS) {
        if (await page.$(selector)) {
          text = await page.$eval(selector, (el) => el.innerText.trim());
          break;
        }
      }

      if (!text) {
        // fallback: whole page text
        text = await page.evaluate(() => document.body.innerText);
      }

      result.text = text;

      const lower = text.toLowerCase();

      const indicators = [
        "breaking change",
        "breaking changes",
        "deprecated",
        "removed",
        "migration",
        "not backwards compatible",
        "upgrade guide",
        "bc break",
      ];

      const matches = indicators.filter((k) => lower.includes(k));

      if (matches.length > 0) {
        result.breaking = true;
        result.keywords = matches;
      }

      log.info(`Extracted release info (length: ${text.length})`);
    },

    failedRequestHandler: ({ request, log }) => {
      log.error(`❌ Failed: ${request.url}`);
    },
  });

  await crawler.run([releasesUrl]);

  return result;
}

module.exports = {
  scrapeReleases,
  normalizeGitHubUrl,
};
