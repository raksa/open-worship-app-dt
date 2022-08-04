import './index.scss';

import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { initApp } from './server/appHelper';

initApp().then(() => {
  const container = document.getElementById('root');
  if (container !== null) {
    const root = createRoot(container);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  }
});

const confirmEraseLocalStorage = () => {
  const message = 'We were sorry, Internal process error, do you want to clear all session?';
  const isYes = window.confirm(message);
  if (isYes) {
    window.localStorage.clear();
  }
  window.location.reload();
};

if (window.process.env.NODE_ENV !== 'development') {
  window.onunhandledrejection = () => {
    confirmEraseLocalStorage();
  };

  window.onerror = function () {
    confirmEraseLocalStorage();
  };
}
