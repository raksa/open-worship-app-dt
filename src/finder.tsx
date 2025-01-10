import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/css/bootstrap.css';
import './others/font.scss';

import { StrictMode } from 'react';

import { createRoot } from 'react-dom/client';
import appProviderScreen from './_screen/appProviderScreen';
import FinderApp from './_find/FinderApp';

const container = document.getElementById('root');
if (container !== null) {
    const root = createRoot(container);
    root.render(
        <StrictMode>
            <FinderApp
                onClose={() => {
                    appProviderScreen.messageUtils.sendData(
                        'finder:app:close-finder',
                    );
                }}
            />
        </StrictMode>,
    );
}
