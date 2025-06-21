import { lazy, use } from 'react';

import ResizeActorComp from '../resize-actor/ResizeActorComp';
import { SelectedLyricContext } from './lyricHelpers';

const LazyLyricPreviewerTopComp = lazy(() => {
    return import('./LyricPreviewerTopComp');
});
const LazyLyricSlidesPreviewerComp = lazy(() => {
    return import('./LyricSlidesPreviewerComp');
});

export default function LyricHandlerComp() {
    const context = use(SelectedLyricContext);
    const selectedLyric = context?.selectedLyric ?? null;
    if (selectedLyric === null) {
        return (
            <div
                className={
                    'w-100 h-100 d-flex justify-content-center' +
                    ' align-items-center'
                }
            >
                <h3 className="text-muted">`No Lyric Selected</h3>
            </div>
        );
    }
    return (
        <div className="card w-100 h-100">
            <div className="card-body">
                <ResizeActorComp
                    flexSizeName={'lyric-previewer'}
                    isHorizontal={false}
                    flexSizeDefault={{
                        v1: ['1'],
                        v2: ['1'],
                    }}
                    dataInput={[
                        {
                            children: LazyLyricPreviewerTopComp,
                            key: 'v1',
                            widgetName: 'Editor',
                        },
                        {
                            children: LazyLyricSlidesPreviewerComp,
                            key: 'v2',
                            widgetName: 'Slides',
                        },
                    ]}
                />
            </div>
        </div>
    );
}
