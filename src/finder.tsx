import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/css/bootstrap.css';
import './others/font.scss';

import { StrictMode } from 'react';

import { createRoot } from 'react-dom/client';
import FinderAppComp from './_find/FinderAppComp';
import appProvider from './server/appProvider';

const container = document.getElementById('root');
if (container !== null) {
    const root = createRoot(container);
    root.render(
        <StrictMode>
            <FinderAppComp
                onClose={() => {
                    appProvider.messageUtils.sendData(
                        'finder:app:close-finder',
                    );
                }}
            />
        </StrictMode>,
    );
}
