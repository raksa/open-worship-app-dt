import { lazy } from 'react';

import { resizeSettingNames } from './resize-actor/flexSizeHelpers';
import ResizeActorComp from './resize-actor/ResizeActorComp';

const LazyAppDocumentListComp = lazy(() => {
    return import('./app-document-list/AppDocumentListComp');
});
const LazyLyricList = lazy(() => {
    return import('./lyric-list/LyricListComp');
});
const LazyPlaylistList = lazy(() => {
    return import('./playlist/PlaylistListComp');
});

export default function AppPresenterLeftComp() {
    return (
        <ResizeActorComp
            flexSizeName={resizeSettingNames.appPresenterLeft}
            isHorizontal={false}
            flexSizeDefault={{
                v1: ['1'],
                v2: ['1'],
                v3: ['1'],
            }}
            dataInput={[
                {
                    children: LazyAppDocumentListComp,
                    key: 'v1',
                    widgetName: 'Document List',
                    className: 'flex-item',
                },
                {
                    children: LazyLyricList,
                    key: 'v2',
                    widgetName: 'Lyric List',
                    className: 'flex-item',
                },
                {
                    children: LazyPlaylistList,
                    key: 'v3',
                    widgetName: 'Playlist List',
                    className: 'flex-item',
                },
            ]}
        />
    );
}
