import { useMemo } from 'react';

import { useAppStateAsync } from '../helper/debuggerHelpers';
import { useSelectedLyricContext } from './lyricHelpers';
import { HTMLDataType, renderLyricSlide } from './markdownHelpers';
import { useFileSourceEvents } from '../helper/dirSourceHelpers';
import { genTimeoutAttempt } from '../helper/helpers';
import LoadingComp from '../others/LoadingComp';
import LyricEditingManager, {
    useLyricEditingManagerContext,
} from './LyricEditingManager';

function genOptions(lyricEditingManager: LyricEditingManager) {
    return {
        theme: 'dark',
        fontFamily: lyricEditingManager.lyricEditingProps.fontFamily,
    };
}

export default function LyricPreviewerComp() {
    const selectedLyric = useSelectedLyricContext();
    const lyricEditingManager = useLyricEditingManagerContext();
    const [htmlData, setHtmlData] = useAppStateAsync<HTMLDataType>(() => {
        return renderLyricSlide(selectedLyric, genOptions(lyricEditingManager));
    }, [selectedLyric, lyricEditingManager]);
    const attemptTimeout = useMemo(() => {
        return genTimeoutAttempt(500);
    }, []);
    useFileSourceEvents(
        ['update'],
        async () => {
            attemptTimeout(async () => {
                setHtmlData(
                    await renderLyricSlide(
                        selectedLyric,
                        genOptions(lyricEditingManager),
                    ),
                );
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
                <LoadingComp />
            </div>
        );
    }
    return (
        <div
            className="card w-100 h-100 p-3"
            dangerouslySetInnerHTML={{ __html: htmlData.html }}
        />
    );
}
