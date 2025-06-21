import { useMemo } from 'react';

import { useAppStateAsync } from '../helper/debuggerHelpers';
import { useSelectedLyricContext } from './lyricHelpers';
import { HTMLDataType, renderLyricMarkdown } from './markdownHelpers';
import { useFileSourceEvents } from '../helper/dirSourceHelpers';
import { genTimeoutAttempt } from '../helper/helpers';

export default function LyricPreviewerComp() {
    const selectedLyric = useSelectedLyricContext();
    const [htmlData, setHtmlData] = useAppStateAsync<HTMLDataType>(() => {
        return renderLyricMarkdown(selectedLyric);
    }, [selectedLyric]);
    const attemptTimeout = useMemo(() => {
        return genTimeoutAttempt(500);
    }, []);
    useFileSourceEvents(
        ['update'],
        async () => {
            attemptTimeout(async () => {
                setHtmlData(await renderLyricMarkdown(selectedLyric));
            });
        },
        [],
        selectedLyric.filePath,
    );
    if (!htmlData) {
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
            <iframe
                className="w-100 h-100 p-0 m-0 overflow-hidden"
                srcDoc={htmlData.html}
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
