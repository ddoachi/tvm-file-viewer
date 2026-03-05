import React from 'react';
import { useCsvImport } from './hooks/useCsvImport';
import { useAppStore } from './store/appStore';

function App() {
  const { importCsv, isLoading } = useCsvImport();
  const { rows, fileName, parseErrors } = useAppStore();

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      fontFamily: 'Arial, sans-serif',
      padding: '20px'
    }}>
      <h1>BH-Support CSV Viewer</h1>

      <button
        onClick={importCsv}
        disabled={isLoading}
        style={{
          marginTop: '20px',
          padding: '10px 20px',
          fontSize: '16px',
          cursor: isLoading ? 'not-allowed' : 'pointer',
          backgroundColor: isLoading ? '#ccc' : '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px'
        }}
      >
        {isLoading ? 'Loading...' : 'Import CSV File'}
      </button>

      {fileName && (
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <p style={{ fontWeight: 'bold' }}>File: {fileName}</p>
          <p>Rows loaded: {rows.length}</p>
        </div>
      )}

      {parseErrors.length > 0 && (
        <div style={{
          marginTop: '20px',
          padding: '10px',
          backgroundColor: '#ffebee',
          borderRadius: '4px',
          maxWidth: '600px'
        }}>
          <h3 style={{ color: '#c62828', margin: '0 0 10px 0' }}>Parse Errors:</h3>
          {parseErrors.map((error, index) => (
            <p key={index} style={{ margin: '5px 0', color: '#c62828' }}>{error}</p>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
