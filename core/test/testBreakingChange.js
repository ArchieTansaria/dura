const { detectBreakingChange } = require('../src/detectBreakingChange');

// Test cases as requested

console.log('=== Test 1: Explicit Breaking Change ===');
const test1 = `
# Release v2.0.0

## BREAKING CHANGE:
The API has been completely rewritten. All previous methods are removed.

Migration guide: https://example.com/migration
`;
const result1 = detectBreakingChange(test1);
console.log(JSON.stringify(result1, null, 2));
console.log('');

console.log('=== Test 2: Negated Breaking Mention ===');
const test2 = `
# Release v1.5.0

This release includes new features and bug fixes.
No breaking changes in this version.
All APIs remain backward compatible.
`;
const result2 = detectBreakingChange(test2);
console.log(JSON.stringify(result2, null, 2));
console.log('Expected: breaking="unknown", negated=true, no medium matches');
console.log('');

console.log('=== Test 3: Ambiguous Mention ===');
const test3 = `
# Release v1.2.0

We've made some improvements that might break
certain edge cases. Please test thoroughly.
`;
const result3 = detectBreakingChange(test3);
console.log(JSON.stringify(result3, null, 2));
console.log('');

console.log('=== Test 4: No Mention at All ===');
const test4 = `
# Release v1.1.0

- Added new feature X
- Fixed bug Y
- Performance improvements
`;
const result4 = detectBreakingChange(test4);
console.log(JSON.stringify(result4, null, 2));
console.log('');

console.log('=== Test 5: Medium Indicator ===');
const test5 = `
# Release v2.0.0

This release introduces breaking changes to the authentication API.
Please see the upgrade guide for migration instructions.
`;
const result5 = detectBreakingChange(test5);
console.log(JSON.stringify(result5, null, 2));
console.log('');

console.log('=== Test 6: Negation Near Breaking Indicator ===');
const test6 = `
# Release v1.3.0

We considered making breaking changes but decided against it.
This is a non-breaking release with new features.
`;
const result6 = detectBreakingChange(test6);
console.log(JSON.stringify(result6, null, 2));
console.log('');

console.log('=== Test 7: Empty Input ===');
const result7 = detectBreakingChange('');
console.log(JSON.stringify(result7, null, 2));
console.log('');

console.log('=== Test 8: Null Input ===');
const result8 = detectBreakingChange(null);
console.log(JSON.stringify(result8, null, 2));
console.log('');

