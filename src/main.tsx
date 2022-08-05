import './main.scss';

import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { initApp } from './server/appHelper';
import appProvider from './server/appProvider';
import { openConfirm } from './alert/HandleAlert';

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
  openConfirm('Reload is needed',
    'We were sorry, Internal process error, you to refresh the app'
  ).then((isOk) => {
    if (isOk) {
      location.reload();
    }
  });
};

if (appProvider.systemUtils.isDev) {
  window.onunhandledrejection = () => {
    confirmEraseLocalStorage();
  };

  window.onerror = function () {
    confirmEraseLocalStorage();
  };
}
