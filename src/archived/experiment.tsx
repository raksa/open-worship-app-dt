import { createRoot } from 'react-dom/client';

import { getRootElement } from '../appInitHelpers';
import RevealJsComp from './RevealJsComp';
import MonacoMDEditorAppComp from './MonacoMDEditorAppComp';

const container = getRootElement<HTMLDivElement>();
const root = createRoot(container);

root.render(
    <div>
        <RevealJsComp />
        <MonacoMDEditorAppComp />
    </div>,
);
