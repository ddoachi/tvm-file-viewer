import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { spawn } from 'child_process';

let mainWindow: BrowserWindow | null = null;

// Performance: enable hardware acceleration
app.commandLine.appendSwitch('enable-features', 'VaapiVideoDecoder');
app.commandLine.appendSwitch('enable-gpu-rasterization');

function createWindow() {
  const preloadPath = path.join(__dirname, '../preload/index.js');
  console.log('Preload path:', preloadPath);
  console.log('Preload exists:', fs.existsSync(preloadPath));

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    title: 'Total Voltage Manager',
    show: false, // Performance: show after ready-to-show
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      backgroundThrottling: false,
    },
  });

  // Show window when ready (faster perceived startup)
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  mainWindow.setMenu(null);

  // Open DevTools in development
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  // F12 to toggle DevTools
  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.key === 'F12') {
      mainWindow?.webContents.toggleDevTools();
    }
  });

  // Load the app
  if (process.env.NODE_ENV === 'development') {
    const port = process.env.VITE_DEV_SERVER_PORT || '5173';
    mainWindow.loadURL(`http://localhost:${port}`);
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC Handlers
ipcMain.handle('dialog:openFile', async () => {
  try {
    const result = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [
        { name: 'CSV Files', extensions: ['csv'] },
        { name: 'JSON Files', extensions: ['json'] },
        { name: 'All Files', extensions: ['*'] },
      ],
    });

    if (result.canceled || result.filePaths.length === 0) {
      return null;
    }

    return result.filePaths[0];
  } catch (error) {
    console.error('Error opening file dialog:', error);
    return null;
  }
});

ipcMain.handle('file:read', async (_event, filePath: string) => {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return content;
  } catch (error) {
    console.error('Error reading file:', error);
    throw new Error(`Failed to read file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
});

ipcMain.handle('row:clicked', (_event, rowData: unknown) => {
  console.log('Row clicked:', rowData);
});

ipcMain.handle('file:openInEditor', (_event, filePath: string) => {
  const editorPath = process.env.EDITOR_PATH || 'gvim';
  try {
    const child = spawn(editorPath, [filePath], { detached: true, stdio: 'ignore' });
    child.unref();
  } catch (error) {
    console.error('Failed to open editor:', error);
    throw new Error(`Failed to open editor: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
});
