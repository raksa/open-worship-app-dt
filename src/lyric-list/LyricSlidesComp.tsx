import { useAppStateAsync } from '../helper/debuggerHelpers';
import { useSelectedLyricContext } from './lyricHelpers';
import { renderLyricMarkdown } from './markdownHelpers';
import { useFileSourceEvents } from '../helper/dirSourceHelpers';
import { useMemo } from 'react';
import { genTimeoutAttempt } from '../helper/helpers';

export default function LyricSlidesComp() {
    const selectedLyric = useSelectedLyricContext();
    const [html, setHtml] = useAppStateAsync<string>(() => {
        return renderLyricMarkdown(selectedLyric);
    }, [selectedLyric]);
    const attemptTimeout = useMemo(() => {
        return genTimeoutAttempt(500);
    }, []);
    useFileSourceEvents(
        ['update'],
        async () => {
            attemptTimeout(async () => {
                setHtml(await renderLyricMarkdown(selectedLyric));
            });
        },
        [],
        selectedLyric.filePath,
    );
    if (!html) {
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
    );
}
