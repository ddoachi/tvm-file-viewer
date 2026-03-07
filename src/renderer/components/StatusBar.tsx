import React, { useState } from 'react';
import { Box, Typography, Paper, Tooltip, Divider, Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { useAppStore, selectFilterResult } from '../store/appStore';

export function StatusBar() {
  const { openFiles, activeFileId, gridFilteredCount, parseErrors, isLoading } = useAppStore();
  const filterResult = useAppStore(selectFilterResult);
  const [contextMenu, setContextMenu] = useState<{ mouseX: number; mouseY: number } | null>(null);

  const activeFile = openFiles.find(f => f.id === activeFileId);

  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    setContextMenu({ mouseX: event.clientX, mouseY: event.clientY });
  };

  const handleCloseContextMenu = () => {
    setContextMenu(null);
  };

  const handleOpenInGvim = async () => {
    if (activeFile?.filePath && window.electronAPI) {
      try {
        await window.electronAPI.openInEditor(activeFile.filePath);
      } catch (err) {
        console.error('Failed to open in editor:', err);
      }
    }
    handleCloseContextMenu();
  };

  return (
    <Paper elevation={1} sx={{ px: 1.5, py: 0.5, mt: 0.5, flexShrink: 0 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minHeight: 28 }}>
        {activeFile && (
          <>
            <Tooltip title="File" arrow>
              <Typography
                variant="body2"
                onContextMenu={handleContextMenu}
                sx={{ fontSize: 12, fontWeight: 500, cursor: 'default' }}
              >
                {activeFile.fileName}
              </Typography>
            </Tooltip>

            <Divider orientation="vertical" flexItem />

            <Tooltip title="Total Rows" arrow>
              <Typography variant="body2" sx={{ fontSize: 12, fontWeight: 500, cursor: 'default' }}>
                {activeFile.rows.length.toLocaleString()}
              </Typography>
            </Tooltip>

            {(filterResult || gridFilteredCount !== null) && (
              <>
                <Divider orientation="vertical" flexItem />
                <Tooltip title="Filtered Rows" arrow>
                  <Typography variant="body2" sx={{ fontSize: 12, fontWeight: 500, color: 'primary.main', cursor: 'default' }}>
                    {filterResult
                      ? filterResult.directMatches.size.toLocaleString()
                      : gridFilteredCount?.toLocaleString()}
                  </Typography>
                </Tooltip>
              </>
            )}
          </>
        )}

        {isLoading && (
          <Typography variant="body2" sx={{ fontSize: 12 }} color="primary">
            Loading...
          </Typography>
        )}

        {!activeFile && !isLoading && (
          <Typography variant="body2" sx={{ fontSize: 12 }} color="text.secondary">
            No file loaded
          </Typography>
        )}

        <Box sx={{ flex: 1 }} />

        {parseErrors.length > 0 && (
          <Tooltip title={parseErrors.join('\n')} arrow>
            <Typography variant="body2" sx={{ fontSize: 11, color: 'error.main', cursor: 'default' }}>
              {parseErrors.length} error{parseErrors.length > 1 ? 's' : ''}
            </Typography>
          </Tooltip>
        )}
      </Box>

      <Menu
        open={contextMenu !== null}
        onClose={handleCloseContextMenu}
        anchorReference="anchorPosition"
        anchorPosition={contextMenu ? { top: contextMenu.mouseY, left: contextMenu.mouseX } : undefined}
      >
        <MenuItem onClick={handleOpenInGvim} sx={{ fontSize: 13 }}>
          <ListItemIcon><OpenInNewIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Open with gVim</ListItemText>
        </MenuItem>
      </Menu>
    </Paper>
  );
}
