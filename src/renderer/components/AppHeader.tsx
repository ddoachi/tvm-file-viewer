import React from 'react';
import { AppBar, Toolbar, Typography, Button, CircularProgress, IconButton } from '@mui/material';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useCsvImport } from '../hooks/useCsvImport';
import { useAppStore } from '../store/appStore';

export function AppHeader() {
  const { importCsv, isLoading } = useCsvImport();
  const { fileName, themeMode, setThemeMode } = useAppStore();

  const handleThemeToggle = () => {
    setThemeMode(themeMode === 'light' ? 'dark' : 'light');
  };

  return (
    <AppBar position="fixed" elevation={2} sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Total Voltage Manager
        </Typography>

        <Typography
          variant="body2"
          sx={{
            marginRight: 2,
            color: 'rgba(255, 255, 255, 0.7)',
          }}
        >
          {fileName || 'No file loaded'}
        </Typography>

        <IconButton
          onClick={handleThemeToggle}
          color="inherit"
          size="small"
          sx={{ marginRight: 1 }}
        >
          {themeMode === 'light' ? <Brightness4Icon /> : <Brightness7Icon />}
        </IconButton>

        <Button
          variant="contained"
          color="secondary"
          size="small"
          startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <FileUploadIcon />}
          onClick={importCsv}
          disabled={isLoading}
          sx={{ minWidth: 80 }}
        >
          {isLoading ? 'Importing...' : 'Import'}
        </Button>
      </Toolbar>
    </AppBar>
  );
}
