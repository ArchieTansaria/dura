let silent = false;

function setSilent(value) {
  silent = value;
}

function logStep(message) {
  if (silent) return;
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


