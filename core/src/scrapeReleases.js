const { PlaywrightCrawler } = require("crawlee");
const { logStep } = require("./utils");

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

  logStep(`➡️ Visiting Releases Page: ${releasesUrl}`);

  const crawler = new PlaywrightCrawler({
    maxRequestsPerCrawl: 1,
    requestHandlerTimeoutSecs: 60,
    launchContext: {
      launchOptions: {
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      },
    },
    requestHandler: async ({ page, request, log }) => {
      await page.setExtraHTTPHeaders({
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
      });

      log.info(`🔍 Navigating to: ${request.url}`);

      const response = await page.goto(request.url, {
        waitUntil: "networkidle",
        timeout: 60000,
      });

      if (!response) {
        log.warning("⚠️ No response from GitHub. Possibly rate-limited.");
        return;
      }

      log.info(`🌐 Status: ${response.status()} ${response.statusText()}`);

      // Prefer release notes div if available
      let text =
        (await page.textContent("div.markdown-body")).trim() ||
        (await page.textContent("body")).trim();

      result.text = text || "";

      const lower = text.toLowerCase();

      const indicators = [
        "breaking change",
        "breaking changes",
        "breaking",
        "deprecated",
        "removed",
        "migration",
        "upgrade guide",
        "not backwards compatible",
        "bc break",
      ];

      const matches = indicators.filter((k) => lower.includes(k));

      if (matches.length > 0) {
        result.breaking = true;
        result.keywords = matches;
      }
    },
    failedRequestHandler: ({ request, log }) => {
      log.error(`❌ Request failed for ${request.url}`);
    },
  });

  await crawler.run([releasesUrl]);

  return result;
}

module.exports = {
  scrapeReleases,
  normalizeGitHubUrl,
};
