import { defineConfig } from 'tsup';

export default defineConfig([
  // Main process
  {
    entry: { 'main/index': 'src/main/index.ts' },
    format: ['cjs'],
    outDir: 'out',
    platform: 'node',
    target: 'node20',
    external: ['electron'],
    splitting: false,
    sourcemap: true,
    clean: false,
    shims: true,
  },
  // Preload script
  {
    entry: { 'preload/index': 'src/preload/index.ts' },
    format: ['cjs'],
    outDir: 'out',
    platform: 'node',
    target: 'node20',
    external: ['electron'],
    splitting: false,
    sourcemap: true,
    clean: false,
    shims: true,
  },
]);
