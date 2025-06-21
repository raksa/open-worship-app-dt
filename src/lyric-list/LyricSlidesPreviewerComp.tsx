import { useMemo } from 'react';

import { useAppStateAsync } from '../helper/debuggerHelpers';
import { useSelectedLyricContext } from './lyricHelpers';
import { HTMLDataType, renderLyricSlidesMarkdown } from './markdownHelpers';
import { useFileSourceEvents } from '../helper/dirSourceHelpers';
import { genTimeoutAttempt } from '../helper/helpers';

function RenderItemComp({ html }: Readonly<{ html: string }>) {
    return (
        <div
            className="m-1"
            style={{
                transition: 'width 0.3s, height 0.3s',
                height: '300px',
            }}
        >
            <iframe
                className="w-100 h-100 p-0 m-0 overflow-hidden"
                srcDoc={html}
                sandbox="allow-same-origin allow-scripts"
                style={{
                    border: 'none',
                    backgroundColor: 'black',
                }}
                title="Lyric Slides"
            />
        </div>
    );
}

export default function LyricSlidesPreviewerComp() {
    const selectedLyric = useSelectedLyricContext();
    const [htmlDataList, setHtmlDataList] = useAppStateAsync<
        HTMLDataType[]
    >(() => {
        return renderLyricSlidesMarkdown(selectedLyric);
    }, [selectedLyric]);
    const attemptTimeout = useMemo(() => {
        return genTimeoutAttempt(500);
    }, []);
    useFileSourceEvents(
        ['update'],
        async () => {
            attemptTimeout(async () => {
                setHtmlDataList(await renderLyricSlidesMarkdown(selectedLyric));
            });
        },
        [],
        selectedLyric.filePath,
    );
    if (!htmlDataList) {
        return (
            <div
                className={
                    'w-100 h-100 d-flex justify-content-center' +
                    ' align-items-center'
                }
            >
                <h3 className="text-muted">`Rendered Text Not</h3>
            </div>
        );
    }
    return (
        <div className="w-100 h-100 d-flex flex-column p-1">
            {htmlDataList.map((htmlData) => (
                <RenderItemComp key={htmlData.id} html={htmlData.html} />
            ))}
        </div>
    );
}
