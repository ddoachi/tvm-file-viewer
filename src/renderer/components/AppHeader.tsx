import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  CircularProgress,
  IconButton,
  Tooltip,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useCsvImport } from '../hooks/useCsvImport';
import { useAppStore } from '../store/appStore';

export function AppHeader() {
  const { importCsv, isLoading } = useCsvImport();
  const { themeMode, setThemeMode } = useAppStore();

  const handleThemeToggle = () => {
    setThemeMode(themeMode === 'light' ? 'dark' : 'light');
  };

  return (
    <AppBar position="static" elevation={2}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Total Voltage Manager
        </Typography>

        <IconButton
          onClick={handleThemeToggle}
          color="inherit"
          size="small"
          sx={{
            marginRight: 1,
            transition: 'background-color 0.15s',
            '&:hover': { bgcolor: 'rgba(255,255,255,0.15)' },
          }}
        >
          {themeMode === 'light' ? <Brightness4Icon /> : <Brightness7Icon />}
        </IconButton>

        <Tooltip title="Import File">
          <IconButton
            color="inherit"
            size="small"
            onClick={importCsv}
            disabled={isLoading}
            sx={{
              transition: 'background-color 0.15s',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.15)' },
            }}
          >
            {isLoading ? <CircularProgress size={20} color="inherit" /> : <DownloadIcon />}
          </IconButton>
        </Tooltip>
      </Toolbar>
    </AppBar>
  );
}
