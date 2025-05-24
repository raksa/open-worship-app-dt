import { createRoot } from 'react-dom/client';

import { getRootElement } from '../appInitHelpers';
import MonacoMDEditorAppComp from './MonacoMDEditorAppComp';

const container = getRootElement<HTMLDivElement>();
const root = createRoot(container);

root.render(
    <div>
        <MonacoMDEditorAppComp />
    </div>,
);
