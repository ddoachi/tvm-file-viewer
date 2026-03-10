import { useEffect } from 'react';
import { useAppStore } from '../store/appStore';
import { parseCsv } from '../services/csvParser';
import { parseJson } from '../services/jsonParser';
import { computeTreePaths } from '../services/treeTransformer';
import type { CsvRow } from '../types';

async function loadFileContent(filePath: string): Promise<CsvRow[]> {
  const content = await window.electronAPI.readFile(filePath);
  const fileExtension = filePath.split('.').pop()?.toLowerCase();

  let parseResult;
  if (fileExtension === 'json') {
    parseResult = parseJson(content);
  } else {
    parseResult = parseCsv(content);
  }

  if (parseResult.errors.length > 0) {
    console.warn('Parse errors during reload:', parseResult.errors);
  }

  return fileExtension === 'csv'
    ? computeTreePaths(parseResult.rows)
    : parseResult.rows;
}

export function useCsvImport() {
  const { addFile, updateFileRows, setParseErrors, setLoading, isLoading, openFiles } = useAppStore();

  const importCsv = async () => {
    try {
      if (!window.electronAPI) {
        throw new Error('Electron API not available. Please restart the application.');
      }

      setParseErrors([]);

      const filePath = await window.electronAPI.openFileDialog();

      if (!filePath) {
        return;
      }

      setLoading(true);

      const rows = await loadFileContent(filePath);

      const fileName = filePath.split(/[\\/]/).pop() || 'unknown';
      const fileId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      addFile({ id: fileId, fileName, filePath, rows });

      // Start watching the file for changes
      window.electronAPI.watchFile(filePath);

    } catch (error) {
      console.error('CSV Import Error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setParseErrors([errorMessage]);

      if (error instanceof Error) {
        alert(`Import failed: ${error.message}\n\nCheck DevTools Console (F12) for details.`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Listen for file change events from main process and reload
  useEffect(() => {
    if (!window.electronAPI) return;

    const cleanup = window.electronAPI.onFileChanged(async (filePath: string) => {
      try {
        const rows = await loadFileContent(filePath);
        updateFileRows(filePath, rows);
      } catch (error) {
        console.error('File reload error:', error);
      }
    });

    return cleanup;
  }, [updateFileRows]);

  // Unwatch files when they are removed (cleanup)
  useEffect(() => {
    if (!window.electronAPI) return;

    return () => {
      for (const file of openFiles) {
        window.electronAPI.unwatchFile(file.filePath);
      }
    };
  }, [openFiles]);

  return {
    importCsv,
    isLoading,
  };
}
