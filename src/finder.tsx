import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/css/bootstrap.css';
import './others/font.scss';

import { StrictMode } from 'react';

import { createRoot } from 'react-dom/client';
import appProviderScreen from './_screen/appProviderScreen';
import FinderAppComp from './_find/FinderAppComp';

const container = document.getElementById('root');
if (container !== null) {
    const root = createRoot(container);
    root.render(
        <StrictMode>
            <FinderAppComp
                onClose={() => {
                    appProviderScreen.messageUtils.sendData(
                        'finder:app:close-finder',
                    );
                }}
            />
        </StrictMode>,
    );
}
