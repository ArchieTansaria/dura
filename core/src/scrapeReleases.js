const { PlaywrightCrawler } = require('crawlee');
const { logStep } = require('../utils/logger')

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

async function scrapeReleases(repoUrl) {
  const baseUrl = normalizeGitHubUrl(repoUrl);

  if (!baseUrl) {
    return { breaking: false, keywords: [], text: "" };
  }

  const releasesUrl = `${baseUrl}/releases`;
  logStep(`Navigating to ${releasesUrl}`);

  const detectionTerms = [
    'breaking change',
    'breaking changes',
    'breaking',
    'deprecated',
    'removed',
    'migration',
    'upgrade guide',
    'not backwards compatible',
    'bc break',
  ];

  const selectors = [
    "div.release-entry",
    'div.markdown-body',
    'div.Box-body',
    '.markdown-body',
    '.prose',
  ];

  let result = {
    breaking: false,
    keywords: [],
    text: ''
  };

  // logStep(`➡️ Visiting Releases Page: ${releasesUrl}`);
  
  
  const crawler = new PlaywrightCrawler({
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
      const lowered = normalizedText.toLowerCase();
      const found = detectionTerms.filter((term) => lowered.includes(term));

      result.text = normalizedText;
      result.keywords = Array.from(new Set(found));
      result.breaking = result.keywords.length > 0;

      log.info(`Extracted release info (length: ${text.length})`);
    },

    failedRequestHandler: ({ request, log }) => {
      log.error(`❌ Failed: ${request.url}`);
    },
  });

  try {
    await crawler.run([releasesUrl]);
    await crawler.teardown();
    logStep('Crawl complete');
  } catch (error) {
    console.error(`Crawler error: ${error.message}`);
    await crawler.teardown();
  }
  return result;
}

module.exports = {
  scrapeReleases,
  normalizeGitHubUrl,
};


