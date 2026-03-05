import { test, expect, _electron as electron } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test.describe('Electron API Integration', () => {
  test('window.electronAPI should be available in renderer', async () => {
    // Launch Electron app
    const app = await electron.launch({
      args: [path.join(__dirname, '../out/main/index.js')],
      env: {
        ...process.env,
        NODE_ENV: 'production',
        ELECTRON_DISABLE_SANDBOX: '1',
      },
    });

    // Get the first window
    const window = await app.firstWindow();

    // Wait for the app to load
    await window.waitForLoadState('domcontentloaded');

    // Check if electronAPI is available
    const hasElectronAPI = await window.evaluate(() => {
      return typeof window.electronAPI !== 'undefined';
    });

    expect(hasElectronAPI).toBe(true);

    // Check if openFileDialog method exists
    const hasOpenFileDialog = await window.evaluate(() => {
      return typeof window.electronAPI?.openFileDialog === 'function';
    });

    expect(hasOpenFileDialog).toBe(true);

    // Check if readFile method exists
    const hasReadFile = await window.evaluate(() => {
      return typeof window.electronAPI?.readFile === 'function';
    });

    expect(hasReadFile).toBe(true);

    // Check if onRowClick method exists
    const hasOnRowClick = await window.evaluate(() => {
      return typeof window.electronAPI?.onRowClick === 'function';
    });

    expect(hasOnRowClick).toBe(true);

    // Close the app
    await app.close();
  });

  test('AG Grid should render with empty state', async () => {
    const app = await electron.launch({
      args: [path.join(__dirname, '../out/main/index.js')],
      env: {
        ...process.env,
        NODE_ENV: 'production',
        ELECTRON_DISABLE_SANDBOX: '1',
      },
    });

    const window = await app.firstWindow();
    await window.waitForLoadState('domcontentloaded');
    await window.waitForTimeout(2000); // Wait for React to render

    // Debug: Take screenshot
    await window.screenshot({ path: 'test-results/empty-state.png' });

    // Check if AG Grid is rendered
    const hasAgGrid = await window.locator('.ag-theme-tvm-light').count();
    expect(hasAgGrid).toBeGreaterThan(0);

    // Check if empty state message is visible
    const emptyStateText = await window.textContent('.ag-overlay-no-rows-center');
    expect(emptyStateText).toContain('No data loaded');

    await app.close();
  });

  test('Custom filter panel should be present', async () => {
    const app = await electron.launch({
      args: [path.join(__dirname, '../out/main/index.js')],
      env: {
        ...process.env,
        NODE_ENV: 'production',
        ELECTRON_DISABLE_SANDBOX: '1',
      },
    });

    const window = await app.firstWindow();
    await window.waitForLoadState('domcontentloaded');

    // Check for search input
    const searchInput = await window.locator('input[placeholder*="Search"]').count();
    expect(searchInput).toBe(1);

    // Check for column selector
    const columnSelect = await window.locator('text=Column').count();
    expect(columnSelect).toBeGreaterThan(0);

    // Check for operator selector
    const operatorSelect = await window.locator('text=Operator').count();
    expect(operatorSelect).toBeGreaterThan(0);

    // Check for value input
    const valueInput = await window.locator('input[label="Value"]').count();
    expect(valueInput).toBeGreaterThan(0);

    await app.close();
  });
});
