import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  openFileDialog: (): Promise<string | null> => {
    return ipcRenderer.invoke('dialog:openFile');
  },
  readFile: (filePath: string): Promise<string> => {
    return ipcRenderer.invoke('file:read', filePath);
  },
});
