import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Check if we're in a test environment
const isTestEnvironment = process.env.NODE_ENV === 'test';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App initialAuthState={false} skipAuthCheck={isTestEnvironment} />
  </React.StrictMode>
);
