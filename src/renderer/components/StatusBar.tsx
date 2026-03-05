import React from 'react';
import { Box, Typography, Alert, Paper } from '@mui/material';
import { useAppStore } from '../store/appStore';

export function StatusBar() {
  const { fileName, rows, parseErrors, isLoading } = useAppStore();

  return (
    <Paper elevation={1} sx={{ p: 2, mt: 2 }}>
      <Box sx={{ display: 'flex', gap: 3, alignItems: 'center', flexWrap: 'wrap' }}>
        {fileName && (
          <>
            <Box>
              <Typography variant="caption" color="text.secondary">
                File
              </Typography>
              <Typography variant="body2" fontWeight={500}>
                {fileName}
              </Typography>
            </Box>

            <Box>
              <Typography variant="caption" color="text.secondary">
                Total Rows
              </Typography>
              <Typography variant="body2" fontWeight={500}>
                {rows.length.toLocaleString()}
              </Typography>
            </Box>
          </>
        )}

        {isLoading && (
          <Typography variant="body2" color="primary">
            Loading...
          </Typography>
        )}

        {!fileName && !isLoading && (
          <Typography variant="body2" color="text.secondary">
            No file loaded. Click "Import CSV" to get started.
          </Typography>
        )}
      </Box>

      {parseErrors.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Alert severity="error">
            <Typography variant="subtitle2" gutterBottom>
              Parse Errors ({parseErrors.length})
            </Typography>
            {parseErrors.map((error, index) => (
              <Typography key={index} variant="body2" sx={{ mt: 0.5 }}>
                {error}
              </Typography>
            ))}
          </Alert>
        </Box>
      )}
    </Paper>
  );
}
