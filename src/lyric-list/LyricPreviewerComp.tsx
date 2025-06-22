import { useMemo } from 'react';

import { useAppStateAsync } from '../helper/debuggerHelpers';
import { useSelectedLyricContext } from './lyricHelpers';
import { HTMLDataType, renderLyricSlide } from './markdownHelpers';
import { useFileSourceEvents } from '../helper/dirSourceHelpers';
import { genTimeoutAttempt } from '../helper/helpers';

export default function LyricPreviewerComp() {
    const selectedLyric = useSelectedLyricContext();
    const [htmlData, setHtmlData] = useAppStateAsync<HTMLDataType>(() => {
        return renderLyricSlide(selectedLyric);
    }, [selectedLyric]);
    const attemptTimeout = useMemo(() => {
        return genTimeoutAttempt(500);
    }, []);
    useFileSourceEvents(
        ['update'],
        async () => {
            attemptTimeout(async () => {
                setHtmlData(await renderLyricSlide(selectedLyric));
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
        <div
            className="w-100 h-100 p-3"
            dangerouslySetInnerHTML={{ __html: htmlData.html }}
        />
    );
}
