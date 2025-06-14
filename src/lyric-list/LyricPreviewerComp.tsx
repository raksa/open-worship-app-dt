import { lazy, use } from 'react';

import ResizeActorComp from '../resize-actor/ResizeActorComp';
import { SelectedLyricContext } from './lyricHelpers';

const LazyLyricEditorComp = lazy(() => {
    return import('./LyricEditorComp');
});
const LazyLyricSlidesComp = lazy(() => {
    return import('./LyricSlidesComp');
});

export default function LyricPreviewerComp() {
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
    );
}
