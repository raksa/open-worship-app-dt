import './present.scss';

import React from 'react';
import { createRoot } from 'react-dom/client';
import appProviderPresent from './appProviderPresent';
import PresentApp from './PresentApp';

const container = document.getElementById('root');
if (container !== null) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <PresentApp />
    </React.StrictMode>
  );
}

document.addEventListener('wheel', function (event) {
  if (event.ctrlKey) {
    const isUp = event.deltaY < 0;
    appProviderPresent.messageUtils.sendData('present:app:ctrl-scrolling', isUp);
  }
});
document.addEventListener('keyup', function (event) {
  if ((event.ctrlKey || event.altKey)
    && ['ArrowLeft', 'ArrowRight'].includes(event.key)) {
    const isNext = event.key === 'ArrowRight';
    appProviderPresent.messageUtils.sendData('present:app:change-bible', isNext);
  }
});
document.body.style.backgroundColor = 'transparent';
