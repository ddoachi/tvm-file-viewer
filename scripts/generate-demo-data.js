#!/usr/bin/env node
import { createWriteStream } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_PATH = join(__dirname, '..', 'demo-data.csv');
const TOTAL_ROWS = 1_000_000;

const VNETS = ['VDD', 'VDDQ', 'VSS', 'VSSQ', 'VEXT', 'VON', 'VOFF', 'VPP', 'VBACK'];
const TOP_LEVELS = ['_DRAM_CORE', '_IO_PAD', '_PHY', '_CTRL', '_DLL'];

function getNetName(i) {
  const topIdx = i % TOP_LEVELS.length;
  const top = TOP_LEVELS[topIdx];

  if (top === '_DRAM_CORE') {
    const bankNum = Math.floor(i / 100) % 16;
    const bank = `BANK${bankNum}`;
    const subIdx = Math.floor(i / 10) % 3;
    if (subIdx === 0) {
      const saNum = Math.floor(i / 50) % 8;
      const sa = `SA${saNum}`;
      const leafIdx = i % 3;
      let leaf;
      if (leafIdx === 0) {
        leaf = `BL${i % 32}`;
      } else if (leafIdx === 1) {
        leaf = `WL${i % 64}`;
      } else {
        leaf = 'EQ';
      }
      return `${top}.${bank}.${sa}.${leaf}.net${i}`;
    } else if (subIdx === 1) {
      const seg = `SEG${Math.floor(i / 20) % 4}`;
      return `${top}.${bank}.WL_DRV.${seg}.net${i}`;
    } else {
      const periSubs = ['DQ0', 'DQ1', 'DQ2', 'DQ3'];
      return `${top}.${bank}.PERI.${periSubs[i % 4]}.DRIVER.net${i}`;
    }
  } else if (top === '_IO_PAD') {
    const buses = ['DQ_BUS', 'CA_BUS', 'CLK_PAD'];
    const bus = buses[Math.floor(i / 40) % 3];
    if (bus === 'DQ_BUS') {
      return `${top}.${bus}.DQ${Math.floor(i / 8) % 16}.DRIVER.net${i}`;
    } else if (bus === 'CA_BUS') {
      return `${top}.${bus}.CA${Math.floor(i / 8) % 10}.BUFFER.net${i}`;
    } else {
      return `${top}.${bus}.${i % 2 === 0 ? 'CK_P' : 'CK_N'}.IBUF.net${i}`;
    }
  } else if (top === '_PHY') {
    const phySubs = ['PLL', 'DLL', 'ZQ', 'LVDS'];
    const phySub = phySubs[Math.floor(i / 30) % 4];
    if (phySub === 'PLL') {
      const pllSubs = ['CORE.VCO', 'DIV.CLK', 'LOCK.DET'];
      return `${top}.${phySub}.${pllSubs[i % 3]}.net${i}`;
    } else if (phySub === 'DLL') {
      return `${top}.${phySub}.DELAY_LINE.TAP${i % 16}.net${i}`;
    } else if (phySub === 'ZQ') {
      return `${top}.${phySub}.CAL.REF.net${i}`;
    } else {
      return `${top}.${phySub}.CH${i % 4}.DIFF.net${i}`;
    }
  } else if (top === '_CTRL') {
    const ctrlSubs = ['CMD_DEC', 'ARB', 'REF_CTRL', 'TIMING'];
    const ctrlSub = ctrlSubs[Math.floor(i / 25) % 4];
    if (ctrlSub === 'CMD_DEC') {
      return `${top}.${ctrlSub}.LOGIC.GATE${i % 8}.net${i}`;
    } else if (ctrlSub === 'ARB') {
      return `${top}.${ctrlSub}.PRIORITY.LVL${i % 4}.net${i}`;
    } else if (ctrlSub === 'REF_CTRL') {
      return `${top}.${ctrlSub}.TIMER.CNT${i % 16}.net${i}`;
    } else {
      return `${top}.${ctrlSub}.DELAY.CHAIN${i % 8}.net${i}`;
    }
  } else {
    // _DLL
    const dllSubs = ['DELAY_LINE', 'PHASE_DET', 'LOCK_DET'];
    const dllSub = dllSubs[Math.floor(i / 20) % 3];
    if (dllSub === 'DELAY_LINE') {
      return `${top}.${dllSub}.SEG${i % 32}.BUF.net${i}`;
    } else if (dllSub === 'PHASE_DET') {
      return `${top}.${dllSub}.COMP.OUT${i % 4}.net${i}`;
    } else {
      return `${top}.${dllSub}.FILTER.RC${i % 8}.net${i}`;
    }
  }
}

const stream = createWriteStream(OUTPUT_PATH, { encoding: 'utf8' });
stream.write('Net,Group,Vnet1,Vnet2\n');

const CHUNK_SIZE = 10_000;
let rowsWritten = 0;

function writeChunk() {
  let ok = true;
  while (rowsWritten < TOTAL_ROWS && ok) {
    const end = Math.min(rowsWritten + CHUNK_SIZE, TOTAL_ROWS);
    const lines = [];
    for (let i = rowsWritten; i < end; i++) {
      const net = getNetName(i);
      const group = (i % 1000) + 1;
      const vnet1 = VNETS[i % VNETS.length];
      const vnet2 = VNETS[Math.floor(i / 11) % VNETS.length];
      lines.push(`${net},${group},${vnet1},${vnet2}`);
    }
    rowsWritten = end;
    ok = stream.write(lines.join('\n') + '\n');
  }

  if (rowsWritten < TOTAL_ROWS) {
    stream.once('drain', writeChunk);
  } else {
    stream.end(() => {
      console.log(`Done. Wrote ${rowsWritten} rows to ${OUTPUT_PATH}`);
    });
  }
}

console.log(`Generating ${TOTAL_ROWS} rows...`);
writeChunk();
