import { lazy } from 'react';

import AppSuspense from '../../others/AppSuspense';

const CustomStyle = lazy(() => {
    return import('./CustomStyle');
});

export default function PresentPreviewerTools() {
    return (
        <div>
            <AppSuspense>
                <CustomStyle />
            </AppSuspense>
        </div>
    );
}
