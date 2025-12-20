let silent = true;

function setSilent(value) {
  silent = value;
}

function logStep(message) {
  if (silent) {
    process.env.LOG_LEVEL ??= 'ERROR'
    process.env.CRAWLEE_LOG_LEVEL ??= 'ERROR'
    process.env.CRAWLEE_LOG_LEVEL_PERF ??= 'ERROR'
    return
  };
  console.log(`[DURA] ${message}`);
}

function logError(message) {
  if (silent) return;
  console.error(`[DURA] ${message}`);
}

module.exports = {
  logStep,
  logError,
  setSilent,
};


