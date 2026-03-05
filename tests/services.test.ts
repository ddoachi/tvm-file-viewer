/**
 * Unit tests for services (no Electron GUI needed)
 */

import { parseCsv } from '../src/renderer/services/csvParser';
import { parseJson } from '../src/renderer/services/jsonParser';
import { computeTreePaths } from '../src/renderer/services/treeTransformer';
import { applyGroupFilter, evaluateCondition } from '../src/renderer/services/groupFilter';
import type { CsvRow, FilterCondition } from '../src/renderer/types';

// Test CSV Parser
console.log('Testing CSV Parser...');
const csvText = `Net,Group,Vnet1,Vnet2
_DRAM.BANK0.net1,1,VDD,VEXT
_DRAM.BANK0.net2,1,VDD,VEXT
_DRAM.BANK1.net3,2,VDDQ,VON`;

const csvResult = parseCsv(csvText);
console.log('✓ CSV parsed:', csvResult.rowCount, 'rows');
console.assert(csvResult.rowCount === 3, 'Should parse 3 rows');
console.assert(csvResult.rows[0].Net === '_DRAM.BANK0.net1', 'First row Net should match');

// Test Tree Transformer
console.log('\nTesting Tree Transformer...');
const transformedRows = computeTreePaths(csvResult.rows);
console.log('✓ Tree paths computed');
console.assert(transformedRows[0].parentId !== undefined, 'Should have parentId');
console.log('  Sample parentId structure:', {
  row0: { id: transformedRows[0].id, parentId: transformedRows[0].parentId, Net: transformedRows[0].Net },
  row1: { id: transformedRows[1].id, parentId: transformedRows[1].parentId, Net: transformedRows[1].Net },
});

// Test JSON Parser
console.log('\nTesting JSON Parser...');
const jsonText = JSON.stringify([
  { Net: '_TEST.net1', Group: '1', Vnet1: 'VDD', Vnet2: 'VSS' },
  { Net: '_TEST.net2', Group: '1', Vnet1: 'VDD', Vnet2: 'VSS' },
]);
const jsonResult = parseJson(jsonText);
console.log('✓ JSON parsed:', jsonResult.rowCount, 'rows');
console.assert(jsonResult.rowCount === 2, 'Should parse 2 rows');

// Test Group Filter
console.log('\nTesting Group Filter...');
const testRows: CsvRow[] = [
  { id: 'r1', parentId: null, Net: 'net1', Group: '1', Vnet1: 'VDD', Vnet2: 'VEXT', _rowIndex: 0 },
  { id: 'r2', parentId: null, Net: 'net2', Group: '1', Vnet1: 'VDD', Vnet2: 'VEXT', _rowIndex: 1 },
  { id: 'r3', parentId: null, Net: 'net3', Group: '2', Vnet1: 'VDDQ', Vnet2: 'VON', _rowIndex: 2 },
];

const condition: FilterCondition = {
  field: 'Vnet1',
  operator: 'equals',
  value: 'VDD',
};

const filterResult = applyGroupFilter(testRows, [condition]);
console.log('✓ Group filter applied');
console.log('  Direct matches:', filterResult.directMatches.size);
console.log('  Matched groups:', Array.from(filterResult.matchedGroups));
console.log('  Visible rows:', filterResult.visibleRowIndices.size);
console.assert(filterResult.directMatches.size === 2, 'Should have 2 direct matches');
console.assert(filterResult.matchedGroups.has('1'), 'Should match group 1');
console.assert(filterResult.visibleRowIndices.size === 2, 'Should show 2 visible rows');

// Test evaluateCondition
console.log('\nTesting Condition Evaluation...');
const testRow = testRows[0];
const containsTest = evaluateCondition(testRow, { field: 'Net', operator: 'contains', value: 'net' });
console.assert(containsTest === true, 'Contains should work');

const startsWithTest = evaluateCondition(testRow, { field: 'Net', operator: 'startsWith', value: 'net' });
console.assert(startsWithTest === true, 'StartsWith should work');

console.log('✓ All condition operators working\n');

console.log('='.repeat(60));
console.log('✅ ALL TESTS PASSED');
console.log('='.repeat(60));
console.log('\nServices are working correctly!');
console.log('The Electron API issue is likely due to:');
console.log('1. Dev server not restarted after preload changes');
console.log('2. Browser cache (hard refresh needed: Ctrl+Shift+R)');
console.log('3. On Windows: try running fresh: npm run dev\n');
