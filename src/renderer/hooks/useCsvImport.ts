import { useAppStore } from '../store/appStore';
import { parseCsv } from '../services/csvParser';
import { parseJson } from '../services/jsonParser';
import { computeTreePaths } from '../services/treeTransformer';

export function useCsvImport() {
  const { addFile, setParseErrors, setLoading, isLoading } = useAppStore();

  const importCsv = async () => {
    try {
      // Check if Electron API is available
      if (!window.electronAPI) {
        throw new Error('Electron API not available. Please restart the application.');
      }

      setParseErrors([]);

      // Open file dialog (no spinner yet — user hasn't picked a file)
      const filePath = await window.electronAPI.openFileDialog();

      if (!filePath) {
        return;
      }

      // File selected — now show loading spinner
      setLoading(true);

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

      // Generate unique file ID
      const fileId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Update store with new file
      addFile({
        id: fileId,
        fileName,
        filePath,
        rows: rowsWithRelations,
      });

    } catch (error) {
      console.error('❌ CSV Import Error:', error);
      console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack');

      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setParseErrors([errorMessage]);

      // Show alert for critical errors
      if (error instanceof Error) {
        alert(`Import failed: ${error.message}\n\nCheck DevTools Console (F12) for details.`);
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    importCsv,
    isLoading,
  };
}
