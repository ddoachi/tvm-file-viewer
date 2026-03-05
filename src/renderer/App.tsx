import React from 'react';

function App() {
  const handleOpenFile = async () => {
    try {
      const filePath = await window.electronAPI.openFileDialog();
      console.log('Selected file:', filePath);
    } catch (error) {
      console.error('Error opening file:', error);
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1>BH-Support CSV Viewer</h1>
      <button
        onClick={handleOpenFile}
        style={{
          marginTop: '20px',
          padding: '10px 20px',
          fontSize: '16px',
          cursor: 'pointer',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px'
        }}
      >
        Open CSV File
      </button>
    </div>
  );
}

export default App;
