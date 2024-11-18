import { lazy } from 'react';

import AppSuspense from '../../others/AppSuspense';

const CustomStyle = lazy(() => {
    return import('./CustomStyle');
});

export default function ScreenPreviewerTools() {
    return (
        <div>
            <AppSuspense>
                <CustomStyle />
            </AppSuspense>
        </div>
    );
}
