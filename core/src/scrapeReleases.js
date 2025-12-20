const { PlaywrightCrawler } = require('crawlee');
const { logStep } = require('../utils/logger');
const { detectBreakingChange } = require('./detectBreakingChange');

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
    return { 
      breaking: false, 
      keywords: [], 
      text: "",
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

  const releasesUrl = `${baseUrl}/releases`;
  logStep(`Navigating to ${releasesUrl}`);

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
      
      // Use the new robust breaking change detection
      const breakingChangeResult = detectBreakingChange(normalizedText);
      
      // Extract keywords for backward compatibility
      const allKeywords = [
        ...breakingChangeResult.signals.strong,
        ...breakingChangeResult.signals.medium,
        ...breakingChangeResult.signals.weak
      ];
      
      result.text = normalizedText;
      result.keywords = allKeywords;
      // Maintain backward compatibility: breaking is true if confirmed or likely
      result.breaking = breakingChangeResult.breaking === 'confirmed' || breakingChangeResult.breaking === 'likely';
      result.breakingChange = breakingChangeResult;

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


