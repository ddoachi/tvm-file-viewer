import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, '');
  const port = parseInt(env.VITE_DEV_SERVER_PORT || '5173', 10);

  return {
    plugins: [react()],
    root: resolve(__dirname, 'src/renderer'),
    base: './',
    build: {
      outDir: resolve(__dirname, 'out/renderer'),
      emptyOutDir: true,
    },
    server: {
      port,
    },
  };
});
