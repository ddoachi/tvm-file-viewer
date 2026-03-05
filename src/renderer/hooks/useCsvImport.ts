import { useAppStore } from '../store/appStore';
import { parseCsv } from '../services/csvParser';
import { computeTreePaths } from '../services/treeTransformer';

export function useCsvImport() {
  const { setRows, setParseErrors, setLoading, isLoading } = useAppStore();

  const importCsv = async () => {
    try {
      setLoading(true);
      setParseErrors([]);

      // Open file dialog
      const filePath = await window.electronAPI.openFileDialog();

      if (!filePath) {
        setLoading(false);
        return;
      }

      // Read file content
      const content = await window.electronAPI.readFile(filePath);

      // Parse CSV
      const parseResult = parseCsv(content);

      // Check for parse errors
      if (parseResult.errors.length > 0) {
        const errorMessages = parseResult.errors.map(
          err => `Row ${err.row}: ${err.message}`
        );
        setParseErrors(errorMessages);
      }

      // Transform with tree paths
      const rowsWithPaths = computeTreePaths(parseResult.rows);

      // Extract filename from path
      const fileName = filePath.split(/[\\/]/).pop() || 'unknown.csv';

      // Update store
      setRows(rowsWithPaths, fileName);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setParseErrors([errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return {
    importCsv,
    isLoading,
  };
}
