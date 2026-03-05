import React from 'react';
import { AppBar, Toolbar, Typography, Button, CircularProgress, Box } from '@mui/material';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import { useCsvImport } from '../hooks/useCsvImport';

export function AppHeader() {
  const { importCsv, isLoading } = useCsvImport();

  return (
    <AppBar position="static" elevation={2}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Total Voltage Manager
        </Typography>

        <Button
          variant="contained"
          color="secondary"
          size="small"
          startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <FileUploadIcon />}
          onClick={importCsv}
          disabled={isLoading}
          sx={{ minWidth: 160 }}
        >
          {isLoading ? 'Importing...' : 'Import'}
        </Button>
      </Toolbar>
    </AppBar>
  );
}
