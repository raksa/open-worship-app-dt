import { lazy } from 'react';

import { resizeSettingNames } from './resize-actor/flexSizeHelpers';
import ResizeActor from './resize-actor/ResizeActor';

const LazySlideListComp = lazy(() => {
    return import('./app-document-list/AppDocumentListComp');
});
const LazyAppDocumentPreviewerComp = lazy(() => {
    return import('./app-document-presenter/items/AppDocumentPreviewerComp');
});

export default function AppEditorLeft() {
    return (
        <ResizeActor
            flexSizeName={resizeSettingNames.appEditorLeft}
            isHorizontal={false}
            flexSizeDefault={{
                v1: ['1'],
                v2: ['2'],
            }}
            dataInput={[
                {
                    children: LazySlideListComp,
                    key: 'v1',
                    widgetName: 'Document List',
                    className: 'flex-item',
                },
                {
                    children: LazyAppDocumentPreviewerComp,
                    key: 'v2',
                    widgetName: 'App Document Previewer',
                    className: 'flex-item',
                },
            ]}
        />
    );
}
