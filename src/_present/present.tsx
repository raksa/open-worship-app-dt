import './present.scss';

import React from 'react';
import { createRoot } from 'react-dom/client';
import appProvider from './appProvider';
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

document.addEventListener('wheel', function (e) {
  if (e.ctrlKey) {
    const isUp = e.deltaY < 0;
    appProvider.messageUtils.sendData('present:app:ctrl-scrolling', isUp);
  }
});
document.addEventListener('keyup', function (e) {
  if ((e.ctrlKey || e.altKey)
    && ~['ArrowLeft', 'ArrowRight'].indexOf(e.key)) {
    const isNext = e.key === 'ArrowRight';
    appProvider.messageUtils.sendData('present:app:change-bible', isNext);
  }
});
document.body.style.backgroundColor = 'transparent';
