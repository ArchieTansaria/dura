// this file serves as the public api entrypoint for dura

const { analyzeRepository } = require("./core/index");
const { aggregateRisk } = require('./core/src/aggregate')
const { calculateHealthScore } = require('./core/src/aggregate')
const { determineHealthStatus } = require('./core/src/aggregate')
const { generateRecommendations } = require('./core/src/aggregate')

module.exports = {
  analyzeRepository,
  aggregateRisk,
  calculateHealthScore,
  determineHealthStatus,
  generateRecommendations
};
