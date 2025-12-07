/**
 * Utility functions for DURA
 */

const { Actor } = require('apify');

function logStep(msg) {
  // Safely use Actor.log if available, otherwise fall back to console.log
  if (Actor.log && Actor.log.info) {
    Actor.log.info(`[DURA] ${msg}`);
  } else {
    console.log(`[DURA] ${msg}`);
  }
}

module.exports = {
  logStep
};

