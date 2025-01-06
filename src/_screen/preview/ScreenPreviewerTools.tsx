import { lazy } from 'react';

import AppSuspenseComp from '../../others/AppSuspenseComp';

const LazyCustomStyle = lazy(() => {
    return import('./CustomStyle');
});

export default function ScreenPreviewerTools() {
    return (
        <div>
            <AppSuspenseComp>
                <LazyCustomStyle />
            </AppSuspenseComp>
        </div>
    );
}
