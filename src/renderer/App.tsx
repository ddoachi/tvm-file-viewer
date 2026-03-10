import React, { useMemo } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box } from '@mui/material';
import { lightTheme, darkTheme } from './theme/muiTheme';
import { AppHeader } from './components/AppHeader';
import { FileTabs } from './components/FileTabs';
import { StatusBar } from './components/StatusBar';
import { DataGrid } from './components/DataGrid';
import { useAppStore } from './store/appStore';

function App() {
  const { themeMode } = useAppStore();
  const currentTheme = useMemo(() => themeMode === 'light' ? lightTheme : darkTheme, [themeMode]);

  return (
    <ThemeProvider theme={currentTheme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <AppHeader />
        <FileTabs />

        <Box sx={{ height: 4, flexShrink: 0 }} />

        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0, width: '100%' }}>
          <DataGrid />
          <StatusBar />
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
