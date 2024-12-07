import { lazy } from 'react';

import AppSuspense from '../../others/AppSuspense';

const LazyCustomStyle = lazy(() => {
    return import('./CustomStyle');
});

export default function ScreenPreviewerTools() {
    return (
        <div>
            <AppSuspense>
                <LazyCustomStyle />
            </AppSuspense>
        </div>
    );
}
