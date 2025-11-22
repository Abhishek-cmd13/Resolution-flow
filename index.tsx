import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

console.log('[Startup] Initializing application...');

const rootElement = document.getElementById('root');

if (rootElement) {
  console.log('[Startup] Root element found. Mounting React application...');
  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log('[Startup] React application mounted successfully.');
  } catch (error) {
    console.error('[Startup] Failed to mount React application:', error);
  }
} else {
  console.error('[Startup] FATAL: Root element with id "root" not found in the document.');
}
