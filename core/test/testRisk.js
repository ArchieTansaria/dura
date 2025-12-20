const { computeRisk } = require('../src/risk');

console.log('=== Test 1: Major + Confirmed Breaking (High Confidence) ===');
const result1 = computeRisk({
  diff: 'major',
  type: 'prod',
  breakingChange: {
    breaking: 'confirmed',
    confidenceScore: 0.9
  }
});
console.log('Result:', result1);
console.log('Expected: high risk (score >= 60)');
console.log('');

console.log('=== Test 2: Minor + Likely Breaking (Medium Confidence) ===');
const result2 = computeRisk({
  diff: 'minor',
  type: 'prod',
  breakingChange: {
    breaking: 'likely',
    confidenceScore: 0.6
  }
});
console.log('Result:', result2);
console.log('Expected: medium risk (score >= 30)');
console.log('');

console.log('=== Test 3: Patch + Possible Breaking (Low Confidence) ===');
const result3 = computeRisk({
  diff: 'patch',
  type: 'prod',
  breakingChange: {
    breaking: 'possible',
    confidenceScore: 0.3
  }
});
console.log('Result:', result3);
console.log('Expected: low risk (score < 30)');
console.log('');

console.log('=== Test 4: Major + Unknown Breaking ===');
const result4 = computeRisk({
  diff: 'major',
  type: 'prod',
  breakingChange: {
    breaking: 'unknown',
    confidenceScore: 0
  }
});
console.log('Result:', result4);
console.log('Expected: high risk (from semver only, score = 60)');
console.log('');

console.log('=== Test 5: Minor + Confirmed Breaking (Low Confidence) ===');
const result5 = computeRisk({
  diff: 'minor',
  type: 'prod',
  breakingChange: {
    breaking: 'confirmed',
    confidenceScore: 0.2
  }
});
console.log('Result:', result5);
console.log('Expected: medium risk (20 + 40*0.2 = 28, but should be at least medium)');
console.log('');

console.log('=== Test 6: Dev Dependency (Reduced Risk) ===');
const result6 = computeRisk({
  diff: 'major',
  type: 'dev',
  breakingChange: {
    breaking: 'confirmed',
    confidenceScore: 0.9
  }
});
console.log('Result:', result6);
console.log('Expected: score reduced by 30% (96 * 0.7 = 67)');
console.log('');

console.log('=== Test 7: Missing breakingChange (Backward Compatibility) ===');
const result7 = computeRisk({
  diff: 'major',
  type: 'prod'
});
console.log('Result:', result7);
console.log('Expected: high risk (semver only, score = 60)');
console.log('');

console.log('=== Test 8: Confirmed Breaking Alone (No Semver Info) ===');
const result8 = computeRisk({
  diff: 'unknown',
  type: 'prod',
  breakingChange: {
    breaking: 'confirmed',
    confidenceScore: 0.8
  }
});
console.log('Result:', result8);
console.log('Expected: medium risk (10 + 40*0.8 = 42)');
console.log('');

