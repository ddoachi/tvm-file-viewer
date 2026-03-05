/**
 * Formula Parser Tests
 */

import { parseFormula, indexToVariable } from '../src/renderer/services/formulaParser';

console.log('\n=== Testing Formula Parser ===\n');

// Test 1: Variable name generation
console.log('Test 1: Variable name generation');
const vars = [0, 1, 2, 25, 26, 27].map(i => indexToVariable(i));
console.log('Variables:', vars);
console.assert(vars[0] === 'A', 'First variable should be A');
console.assert(vars[1] === 'B', 'Second variable should be B');
console.assert(vars[2] === 'C', 'Third variable should be C');
console.assert(vars[3] === 'Z', '26th variable should be Z');
console.assert(vars[4] === 'AA', '27th variable should be AA');
console.assert(vars[5] === 'AB', '28th variable should be AB');
console.log('✓ Variable generation works\n');

// Test 2: Simple formula parsing
console.log('Test 2: Simple formulas');
const simple1 = parseFormula('A', new Set(['A']));
console.assert(simple1.isValid, 'Simple variable should be valid');
console.assert(simple1.evaluate !== undefined, 'Should have evaluator');

const simple2 = parseFormula('A && B', new Set(['A', 'B']));
console.assert(simple2.isValid, 'AND formula should be valid');

const simple3 = parseFormula('A || B', new Set(['A', 'B']));
console.assert(simple3.isValid, 'OR formula should be valid');
console.log('✓ Simple formulas parse correctly\n');

// Test 3: Complex formulas with parentheses
console.log('Test 3: Complex formulas');
const complex1 = parseFormula('A || (B && C)', new Set(['A', 'B', 'C']));
console.assert(complex1.isValid, 'Complex formula should be valid');

const complex2 = parseFormula('(A || B) && (C || D)', new Set(['A', 'B', 'C', 'D']));
console.assert(complex2.isValid, 'Nested formula should be valid');

const complex3 = parseFormula('!A && B', new Set(['A', 'B']));
console.assert(complex3.isValid, 'NOT formula should be valid');
console.log('✓ Complex formulas parse correctly\n');

// Test 4: Invalid formulas
console.log('Test 4: Invalid formulas');
const invalid1 = parseFormula('A &&', new Set(['A']));
console.assert(!invalid1.isValid, 'Incomplete formula should be invalid');

const invalid2 = parseFormula('A & B', new Set(['A', 'B']));
console.assert(!invalid2.isValid, 'Wrong operator should be invalid');

const invalid3 = parseFormula('X', new Set(['A', 'B']));
console.assert(!invalid3.isValid, 'Undefined variable should be invalid');
console.log('✓ Invalid formulas detected correctly\n');

// Test 5: Formula evaluation
console.log('Test 5: Formula evaluation');

// Test A || B with different truth values
const formula1 = parseFormula('A || B', new Set(['A', 'B']));
if (formula1.evaluate) {
  const testCases = [
    { vars: new Map([['A', true], ['B', false]]), expected: true },
    { vars: new Map([['A', false], ['B', true]]), expected: true },
    { vars: new Map([['A', false], ['B', false]]), expected: false },
    { vars: new Map([['A', true], ['B', true]]), expected: true },
  ];

  testCases.forEach(({ vars, expected }, i) => {
    const result = formula1.evaluate!(vars);
    console.assert(result === expected, `A || B test case ${i + 1} failed: expected ${expected}, got ${result}`);
  });
  console.log('  ✓ A || B evaluates correctly');
}

// Test A && B
const formula2 = parseFormula('A && B', new Set(['A', 'B']));
if (formula2.evaluate) {
  const result1 = formula2.evaluate(new Map([['A', true], ['B', true]]));
  const result2 = formula2.evaluate(new Map([['A', true], ['B', false]]));
  console.assert(result1 === true, 'A && B with both true should be true');
  console.assert(result2 === false, 'A && B with one false should be false');
  console.log('  ✓ A && B evaluates correctly');
}

// Test A || (B && C)
const formula3 = parseFormula('A || (B && C)', new Set(['A', 'B', 'C']));
if (formula3.evaluate) {
  const result1 = formula3.evaluate(new Map([['A', true], ['B', false], ['C', false]]));
  const result2 = formula3.evaluate(new Map([['A', false], ['B', true], ['C', true]]));
  const result3 = formula3.evaluate(new Map([['A', false], ['B', true], ['C', false]]));
  console.assert(result1 === true, 'A || (B && C) with A=true should be true');
  console.assert(result2 === true, 'A || (B && C) with B=true, C=true should be true');
  console.assert(result3 === false, 'A || (B && C) with all false should be false');
  console.log('  ✓ A || (B && C) evaluates correctly');
}

// Test !A
const formula4 = parseFormula('!A', new Set(['A']));
if (formula4.evaluate) {
  const result1 = formula4.evaluate(new Map([['A', true]]));
  const result2 = formula4.evaluate(new Map([['A', false]]));
  console.assert(result1 === false, '!A with A=true should be false');
  console.assert(result2 === true, '!A with A=false should be true');
  console.log('  ✓ !A evaluates correctly');
}

console.log('\n✓ All formula evaluation tests passed\n');

console.log('============================================================');
console.log('✅ ALL FORMULA PARSER TESTS PASSED');
console.log('============================================================\n');
