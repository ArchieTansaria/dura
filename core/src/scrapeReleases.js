const { PlaywrightCrawler } = require('crawlee');
const { chromium } = require('playwright');
const { logStep } = require('../utils/logger');
const { detectBreakingChange } = require('./detectBreakingChange');

// creating a global crawler instance - faster
let crawlerInstance = null;

const selectors = [
  "div.release-entry",
  "div.markdown-body",
  "div.Box-body",
  ".markdown-body",
  ".prose",
];

async function assertBrowserAvailable() {
try {
  const browser = await chromium.launch()
  await browser.close()
} catch {
  console.error(
    "\ndura setup required\n\nRun:\n\tdura setup\n(Installs Playwright Chromium used for release analysis)\n"
  )
  process.exit(1)
}}

async function getCrawler(){
  if (crawlerInstance) return crawlerInstance

  await assertBrowserAvailable()

  crawlerInstance = new PlaywrightCrawler({
    // maxRequestsPerCrawl: 1,
    maxConcurrency : 1,
    requestHandlerTimeoutSecs: 60,
    navigationTimeoutSecs: 60,
    requestHandler: async ({ page, request, log }) => {
      log.info(`Visiting Releases Page: ${request.url}`);

      await page.goto(request.url, {
        waitUntil: "domcontentloaded",
        timeout: 60000,
      });

      let text = '';

      for (const selector of selectors) {
        const handle = await page.$(selector);
        if (handle) {
          text = await handle.evaluate((el) => el.innerText || el.textContent || '');
          if (text && text.trim()) {
            log.info(`Extracted text with selector: ${selector}`);
            break;
          }
        }
      }

      //fallback : whole page text
      if (!text || !text.trim()) {
        text = await page.evaluate(() => (document.body ? document.body.innerText || '' : ''));
        log.info('Extracted text from document.body fallback');
      }

      // console.log(text)

      const normalizedText = text.trim();
      
      const breakingChangeResult = detectBreakingChange(normalizedText);
      
      // Extract keywords for backward compatibility
      const allKeywords = [
        ...breakingChangeResult.signals.strong,
        ...breakingChangeResult.signals.medium,
        ...breakingChangeResult.signals.weak
      ];
      
      request.userData.result.text = normalizedText;
      request.userData.result.keywords = allKeywords;
      // Maintain backward compatibility: breaking is true if confirmed or likely
      request.userData.result.breaking = breakingChangeResult.breaking === 'confirmed' || breakingChangeResult.breaking === 'likely';
      request.userData.result.breakingChange = breakingChangeResult;

      log.info(`Extracted release info (length: ${text.length})`);
    },

    failedRequestHandler: ({ request, log }) => {
      log.error(`❌ Failed: ${request.url}`);
    }
  })
  return crawlerInstance
};

function normalizeGitHubUrl(url) {
  if (!url || typeof url !== 'string') return '';
  let clean = url.trim();
  if (clean.startsWith('git+')) {
    clean = clean.slice(4);
  }
  if (clean.startsWith('git@github.com:')) {
    clean = clean.replace('git@github.com:', 'https://github.com/');
  }
  if (clean.endsWith('.git')) {
    clean = clean.slice(0, -4);
  }
  return clean.replace(/\/+$/, '');
}

function defaultReleaseResult() {
  return {
    breaking: false,
    keywords: [],
    text: '',
    breakingChange: {
      breaking: 'unknown',
      confidenceScore: 0,
      signals: {
        strong: [],
        medium: [],
        weak: [],
        negated: false
      }
    }
  };
}

async function scrapeReleases(repoUrl) {
  const baseUrl = normalizeGitHubUrl(repoUrl);

  if (!baseUrl) {
    return defaultReleaseResult();
  }

  const releasesUrl = `${baseUrl}/releases`;
  logStep(`Navigating to ${releasesUrl}`);

  let result = defaultReleaseResult();

  // logStep(`➡️ Visiting Releases Page: ${releasesUrl}`);
  
  const crawler = await getCrawler();

  try {
    await crawler.run([
      {
        url: releasesUrl,
        userData: { result }
      }
    ]);
    // await crawler.teardown();
    logStep('Crawl complete');
  } catch (error) {
    console.error(`Crawler error: ${error.message}`);
    // await crawler.teardown();
  }
  return result;
}

/**
 * Batch scrape release pages for multiple repos in one crawler run.
 * Used by MCP/CI for speed and stability. No per-URL logStep (quiet).
 * @param {string[]} repoUrls - GitHub repo URLs
 * @returns {Promise<Map<string, object>>} Map of normalized base URL -> release result
 */
async function scrapeManyReleases(repoUrls) {
  const baseUrls = [...new Set((repoUrls || []).map(normalizeGitHubUrl).filter(Boolean))];
  if (baseUrls.length === 0) {
    return new Map();
  }

  const requests = baseUrls.map((baseUrl) => ({
    url: `${baseUrl}/releases`,
    userData: { result: defaultReleaseResult(), baseUrl }
  }));

  const crawler = await getCrawler();
  try {
    await crawler.run(requests);
  } catch (error) {
    console.error(`Crawler error: ${error.message}`);
  }

  const map = new Map();
  for (const r of requests) {
    map.set(r.userData.baseUrl, r.userData.result);
  }
  return map;
}

// lifecycle cleanup (module-level)
process.once('SIGINT', async () => {
  if (crawlerInstance) {
    await crawlerInstance.teardown();
  }
  process.exit(0);
});

process.once('SIGTERM', async () => {
  if (crawlerInstance) {
    await crawlerInstance.teardown();
  }
  process.exit(0);
});

process.once('exit', async () => {
  if (crawlerInstance) {
    await crawlerInstance.teardown();
  }
});

module.exports = {
  scrapeReleases,
  scrapeManyReleases,
  normalizeGitHubUrl,
  defaultReleaseResult,
  assertBrowserAvailable
};


