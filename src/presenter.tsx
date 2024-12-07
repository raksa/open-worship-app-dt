import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from './App';
import { initToolTip } from './tool-tip/init';
import { initApp, getRootElement } from './appInitHelpers';

async function main() {
    await initApp();
    initToolTip();
    const container = getRootElement<HTMLDivElement>();
    const root = createRoot(container);
    root.render(
        <StrictMode>
            <App />
        </StrictMode>
    );
}

main();
