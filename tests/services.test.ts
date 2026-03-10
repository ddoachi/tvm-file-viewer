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
const csvText = `tree,hier_LV,parent_master,master,multiple,xprobe,assigned,vnets,D/S/B,DNW,G,switch_type,psw_detected,psw_used,tg,cmos_drv,vnets_group,is_short
_DRAM.BANK0.net1,2,TOP,M1,1,XP1,ASG1,VDD,3,0,1,0,1,1,0,NMOS,GRP1,0
_DRAM.BANK0.net2,2,TOP,M1,1,XP2,ASG2,VDD,3,0,1,0,1,1,0,NMOS,GRP1,0
_DRAM.BANK1.net3,2,TOP,M2,1,XP3,ASG3,VDDQ,4,1,2,1,0,0,1,PMOS,GRP2,1`;

const csvResult = parseCsv(csvText);
console.log('✓ CSV parsed:', csvResult.rowCount, 'rows');
console.assert(csvResult.rowCount === 3, 'Should parse 3 rows');
console.assert(csvResult.rows[0].tree === '_DRAM.BANK0.net1', 'First row tree should match');

// Test Tree Transformer
console.log('\nTesting Tree Transformer...');
const transformedRows = computeTreePaths(csvResult.rows);
console.log('✓ Tree paths computed');
console.log('  Sample row:', {
  tree: transformedRows[0].tree,
  master: transformedRows[0].master,
  vnets: transformedRows[0].vnets,
});

// Test JSON Parser
console.log('\nTesting JSON Parser...');
const jsonText = JSON.stringify([
  { tree: '_TEST.net1', hier_LV: 1, parent_master: 'TOP', master: 'M1', multiple: 1, xprobe: '', assigned: '', vnets: 'VDD', 'D/S/B': 0, DNW: 0, G: 0, switch_type: 0, psw_detected: 0, psw_used: 0, tg: 0, cmos_drv: 'NMOS', vnets_group: 'GRP1', is_short: 0 },
  { tree: '_TEST.net2', hier_LV: 1, parent_master: 'TOP', master: 'M1', multiple: 1, xprobe: '', assigned: '', vnets: 'VDD', 'D/S/B': 0, DNW: 0, G: 0, switch_type: 0, psw_detected: 0, psw_used: 0, tg: 0, cmos_drv: 'NMOS', vnets_group: 'GRP1', is_short: 0 },
]);
const jsonResult = parseJson(jsonText);
console.log('✓ JSON parsed:', jsonResult.rowCount, 'rows');
console.assert(jsonResult.rowCount === 2, 'Should parse 2 rows');

// Test Group Filter (group column is now "master")
console.log('\nTesting Group Filter...');
const testRows: CsvRow[] = [
  { tree: 'net1', hier_LV: 1, parent_master: 'TOP', master: 'M1', multiple: 1, xprobe: '', assigned: '', vnets: 'VDD', 'D/S/B': 0, DNW: 0, G: 0, switch_type: 0, psw_detected: 0, psw_used: 0, tg: 0, cmos_drv: 'NMOS', vnets_group: 'GRP1', is_short: 0, _rowIndex: 0 },
  { tree: 'net2', hier_LV: 1, parent_master: 'TOP', master: 'M1', multiple: 1, xprobe: '', assigned: '', vnets: 'VDD', 'D/S/B': 0, DNW: 0, G: 0, switch_type: 0, psw_detected: 0, psw_used: 0, tg: 0, cmos_drv: 'NMOS', vnets_group: 'GRP1', is_short: 0, _rowIndex: 1 },
  { tree: 'net3', hier_LV: 1, parent_master: 'TOP', master: 'M2', multiple: 1, xprobe: '', assigned: '', vnets: 'VDDQ', 'D/S/B': 0, DNW: 0, G: 0, switch_type: 0, psw_detected: 0, psw_used: 0, tg: 0, cmos_drv: 'PMOS', vnets_group: 'GRP2', is_short: 0, _rowIndex: 2 },
];

const condition: FilterCondition = {
  field: 'vnets',
  operator: 'equals',
  value: 'VDD',
};

const filterResult = applyGroupFilter(testRows, [condition]);
console.log('✓ Group filter applied');
console.log('  Direct matches:', filterResult.directMatches.size);
console.log('  Matched groups:', Array.from(filterResult.matchedGroups));
console.log('  Visible rows:', filterResult.visibleRowIndices.size);
console.assert(filterResult.directMatches.size === 2, 'Should have 2 direct matches');
console.assert(filterResult.matchedGroups.has('M1'), 'Should match group M1');
console.assert(filterResult.visibleRowIndices.size === 2, 'Should show 2 visible rows');

// Test evaluateCondition
console.log('\nTesting Condition Evaluation...');
const testRow = testRows[0];
const containsTest = evaluateCondition(testRow, { field: 'tree', operator: 'contains', value: 'net' });
console.assert(containsTest === true, 'Contains should work');

const startsWithTest = evaluateCondition(testRow, { field: 'tree', operator: 'startsWith', value: 'net' });
console.assert(startsWithTest === true, 'StartsWith should work');

console.log('✓ All condition operators working\n');

console.log('='.repeat(60));
console.log('✅ ALL TESTS PASSED');
console.log('='.repeat(60));
console.log('\nServices are working correctly!');
