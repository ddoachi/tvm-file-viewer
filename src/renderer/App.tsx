import React, { useMemo } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Container, Box } from '@mui/material';
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

        <Container maxWidth="xl" sx={{ flex: 1, py: 3, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ flex: 1, minHeight: 0 }}>
            <DataGrid />
          </Box>

          <StatusBar />
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;
