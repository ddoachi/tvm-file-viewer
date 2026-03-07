import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  CircularProgress,
  IconButton,
  Tooltip,
  TextField,
  Box,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import EditIcon from '@mui/icons-material/Edit';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { useCsvImport } from '../hooks/useCsvImport';
import { useAppStore } from '../store/appStore';

export function AppHeader() {
  const { importCsv, isLoading } = useCsvImport();
  const { openFiles, activeFileId, themeMode, setThemeMode, renameFile } = useAppStore();
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState('');

  const activeFile = openFiles.find(f => f.id === activeFileId);
  const fileName = activeFile?.fileName;
  const filePath = activeFile?.filePath;

  const handleThemeToggle = () => {
    setThemeMode(themeMode === 'light' ? 'dark' : 'light');
  };

  const handleStartRename = () => {
    if (fileName) {
      setRenameValue(fileName);
      setIsRenaming(true);
    }
  };

  const handleFinishRename = () => {
    if (activeFileId && renameValue.trim()) {
      renameFile(activeFileId, renameValue.trim());
    }
    setIsRenaming(false);
  };

  const handleRenameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleFinishRename();
    if (e.key === 'Escape') setIsRenaming(false);
  };

  const handleOpenInEditor = async () => {
    if (filePath && window.electronAPI) {
      try {
        await window.electronAPI.openInEditor(filePath);
      } catch (err) {
        console.error('Failed to open in editor:', err);
      }
    }
  };

  return (
    <AppBar position="static" elevation={2}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Total Voltage Manager
        </Typography>

        {fileName && !isRenaming && (
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
            <Typography
              variant="body2"
              sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
            >
              {fileName}
            </Typography>
            <Tooltip title="Rename">
              <IconButton
                size="small"
                onClick={handleStartRename}
                sx={{ ml: 0.5, color: 'rgba(255, 255, 255, 0.5)' }}
              >
                <EditIcon sx={{ fontSize: 14 }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Open in gVim">
              <IconButton
                size="small"
                onClick={handleOpenInEditor}
                sx={{ ml: 0.25, color: 'rgba(255, 255, 255, 0.5)' }}
              >
                <OpenInNewIcon sx={{ fontSize: 14 }} />
              </IconButton>
            </Tooltip>
          </Box>
        )}

        {isRenaming && (
          <TextField
            size="small"
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onBlur={handleFinishRename}
            onKeyDown={handleRenameKeyDown}
            autoFocus
            sx={{
              mr: 2,
              '& .MuiInputBase-input': { color: 'white', fontSize: 14, py: 0.5, px: 1 },
              '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.3)' },
              '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.5)' },
            }}
          />
        )}

        <IconButton
          onClick={handleThemeToggle}
          color="inherit"
          size="small"
          sx={{ marginRight: 1 }}
        >
          {themeMode === 'light' ? <Brightness4Icon /> : <Brightness7Icon />}
        </IconButton>

        <Tooltip title="Import File">
          <IconButton
            color="inherit"
            size="small"
            onClick={importCsv}
            disabled={isLoading}
          >
            {isLoading ? <CircularProgress size={20} color="inherit" /> : <DownloadIcon />}
          </IconButton>
        </Tooltip>
      </Toolbar>
    </AppBar>
  );
}
