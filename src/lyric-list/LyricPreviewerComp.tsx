import { lazy, use, useState } from 'react';

import ResizeActorComp from '../resize-actor/ResizeActorComp';
import { SelectedLyricContext } from './lyricHelpers';

const LazyLyricEditorComp = lazy(() => {
    return import('./LyricEditorComp');
});
const LazyLyricSlidesComp = lazy(() => {
    return import('./LyricSlidesComp');
});

export default function LyricPreviewerComp() {
    const [isFullWidget, setIsFullWidget] = useState(false);
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
    const fullScreenClassname = isFullWidget
        ? 'fullscreen-exit'
        : 'arrows-fullscreen';
    return (
        <div
            className={
                'card w-100 h-100' + ` ${isFullWidget ? ' app-full-view' : ''}`
            }
        >
            <div className="card-body">
                <ResizeActorComp
                    flexSizeName={'lyric-previewer'}
                    isHorizontal
                    flexSizeDefault={{
                        h1: ['2'],
                        h2: ['1'],
                    }}
                    dataInput={[
                        {
                            children: LazyLyricEditorComp,
                            key: 'h1',
                            widgetName: 'Editor',
                        },
                        {
                            children: LazyLyricSlidesComp,
                            key: 'h2',
                            widgetName: 'Slides',
                        },
                    ]}
                />
            </div>
            <div
                className="card-footer"
                style={{
                    maxHeight: '35px',
                }}
            >
                <button
                    className={
                        `btn btn-${isFullWidget ? '' : 'outline-'}info ` +
                        'btn-sm p-0 px-2 float-end'
                    }
                    onClick={async () => {
                        setIsFullWidget(!isFullWidget);
                    }}
                >
                    <i className={`bi bi-${fullScreenClassname}`} />
                </button>
            </div>
        </div>
    );
}
