import { useAppStore } from '../store/appStore';
import { parseCsv } from '../services/csvParser';
import { parseJson } from '../services/jsonParser';
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

      // Determine file type from extension
      const fileExtension = filePath.split('.').pop()?.toLowerCase();

      // Parse based on file type
      let parseResult;
      if (fileExtension === 'json') {
        parseResult = parseJson(content);
      } else {
        // Default to CSV parsing
        parseResult = parseCsv(content);
      }

      // Check for parse errors
      if (parseResult.errors.length > 0) {
        const errorMessages = parseResult.errors.map(
          err => `Row ${err.row}: ${err.message}`
        );
        setParseErrors(errorMessages);
      }

      // Transform with parent-child relationships (only needed for CSV)
      const rowsWithRelations = fileExtension === 'csv'
        ? computeTreePaths(parseResult.rows)
        : parseResult.rows;

      // Extract filename from path
      const fileName = filePath.split(/[\\/]/).pop() || 'unknown';

      // Update store
      setRows(rowsWithRelations, fileName);

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
