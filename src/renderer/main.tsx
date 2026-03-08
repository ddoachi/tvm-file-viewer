import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import './theme/agGridTheme.css';

// AG Grid v32 has tree data and filters built-in (no module registration needed)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
