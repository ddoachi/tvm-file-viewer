import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  openFileDialog: (): Promise<string | null> => {
    return ipcRenderer.invoke('dialog:openFile');
  },
  readFile: (filePath: string): Promise<string> => {
    return ipcRenderer.invoke('file:read', filePath);
  },
  onRowClick: (rowData: any): Promise<void> => {
    return ipcRenderer.invoke('row:clicked', rowData);
  },
  openInEditor: (filePath: string): Promise<void> => {
    return ipcRenderer.invoke('file:openInEditor', filePath);
  },
  watchFile: (filePath: string): Promise<void> => {
    return ipcRenderer.invoke('file:watch', filePath);
  },
  unwatchFile: (filePath: string): Promise<void> => {
    return ipcRenderer.invoke('file:unwatch', filePath);
  },
  onFileChanged: (callback: (filePath: string) => void): (() => void) => {
    const handler = (_event: Electron.IpcRendererEvent, filePath: string) => callback(filePath);
    ipcRenderer.on('file:changed', handler);
    return () => ipcRenderer.removeListener('file:changed', handler);
  },
});
