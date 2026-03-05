import { test, _electron as electron } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test('Debug preload loading', async () => {
  const app = await electron.launch({
    args: [path.join(__dirname, '../out/main/index.js')],
    env: {
      ...process.env,
      NODE_ENV: 'production',
      ELECTRON_DISABLE_SANDBOX: '1',
    },
  });

  const window = await app.firstWindow();

  // Check what's actually available on window
  const windowKeys = await window.evaluate(() => {
    return Object.keys(window);
  });

  console.log('Window keys:', windowKeys);

  // Check if electronAPI exists at all
  const electronAPI = await window.evaluate(() => {
    return {
      exists: typeof window.electronAPI !== 'undefined',
      keys: window.electronAPI ? Object.keys(window.electronAPI) : [],
      type: typeof window.electronAPI,
    };
  });

  console.log('ElectronAPI status:', electronAPI);

  // Get console errors from renderer
  const logs: any[] = [];
  window.on('console', (msg) => {
    logs.push({ type: msg.type(), text: msg.text() });
    console.log('Renderer console:', msg.type(), msg.text());
  });

  // Catch page errors
  window.on('pageerror', (error) => {
    console.log('PAGE ERROR:', error.message);
  });

  // Check page content
  const bodyHTML = await window.evaluate(() => document.body.innerHTML);
  console.log('Body HTML length:', bodyHTML.length);
  console.log('Body preview:', bodyHTML.substring(0, 500));

  await new Promise(resolve => setTimeout(resolve, 2000));

  console.log('Total console messages:', logs.length);
  const errors = logs.filter(l => l.type === 'error');
  console.log('Errors:', errors);

  await app.close();
});
