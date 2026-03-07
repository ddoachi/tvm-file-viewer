import React, { useState } from 'react';
import { Box, Tabs, Tab, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import { useAppStore } from '../store/appStore';
import { useCsvImport } from '../hooks/useCsvImport';
import { colors } from '../theme/designSystem';

export const FileTabs: React.FC = () => {
  const { openFiles, activeFileId, setActiveFile, removeFile, themeMode } = useAppStore();
  const { importCsv } = useCsvImport();
  const [confirmingClose, setConfirmingClose] = useState<string | null>(null);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: string) => {
    setActiveFile(newValue);
  };

  const handleCloseTab = (fileId: string, fileName: string, event: React.MouseEvent) => {
    event.stopPropagation();

    // Show confirmation dialog
    const confirmed = window.confirm(
      `Close ${fileName}? Unsaved changes will be lost.`
    );

    if (confirmed) {
      removeFile(fileId);
    }
  };

  const handleAddFile = () => {
    importCsv();
  };

  if (openFiles.length === 0) {
    return null;
  }

  return (
    <Box
      sx={{
        borderBottom: 1,
        borderColor: themeMode === 'light' ? colors.light.border.default : colors.dark.border.default,
        bgcolor: themeMode === 'light' ? colors.light.bg.secondary : colors.dark.bg.secondary,
        px: 2,
        display: 'flex',
        alignItems: 'center',
        minHeight: 32,
      }}
    >
      <Tabs
        value={activeFileId || false}
        onChange={handleTabChange}
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          minHeight: 32,
          '& .MuiTab-root': {
            minHeight: 32,
            py: 0.5,
            px: 2,
            fontSize: '0.875rem',
            textTransform: 'none',
            minWidth: 'auto',
          },
        }}
      >
        {openFiles.map((file) => (
          <Tab
            key={file.id}
            value={file.id}
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <span>{file.fileName}</span>
                <Box
                  component="span"
                  onClick={(e: React.MouseEvent) => handleCloseTab(file.id, file.fileName, e)}
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: 0,
                    width: 16,
                    height: 16,
                    borderRadius: '4px',
                    cursor: 'pointer',
                    '&:hover': {
                      bgcolor: themeMode === 'light' ? '#e0e0e0' : '#424242',
                    },
                  }}
                >
                  <CloseIcon sx={{ fontSize: 16 }} />
                </Box>
              </Box>
            }
          />
        ))}
      </Tabs>
      <IconButton
        size="small"
        onClick={handleAddFile}
        sx={{
          ml: 1,
          width: 24,
          height: 24,
        }}
      >
        <AddIcon sx={{ fontSize: 18 }} />
      </IconButton>
    </Box>
  );
};
