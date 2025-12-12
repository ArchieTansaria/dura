const { PlaywrightCrawler } = require('crawlee');

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
  console.log(`Navigating to ${releasesUrl}`);

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
    async requestHandler({ page, request, log }) {
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
        console.log('Extracted text from document.body fallback');
      }

      const normalizedText = text.trim();
      const lowered = normalizedText.toLowerCase();
      const found = detectionTerms.filter((term) => lowered.includes(term));

      result.text = normalizedText;
      result.keywords = Array.from(new Set(found));
      result.breaking = result.keywords.length > 0;
    },
  });

  await crawler.run([releasesUrl]);
  console.log('Crawl complete');
  return result;
}

module.exports = {
  scrapeReleases,
  normalizeGitHubUrl,
};


