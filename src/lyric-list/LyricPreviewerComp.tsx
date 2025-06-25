import { useMemo, useState } from 'react';

import { useAppStateAsync } from '../helper/debuggerHelpers';
import { useSelectedLyricContext } from './lyricHelpers';
import { HTMLDataType, renderLyricSlide } from './markdownHelpers';
import { useFileSourceEvents } from '../helper/dirSourceHelpers';
import { genTimeoutAttempt } from '../helper/helpers';
import LoadingComp from '../others/LoadingComp';
import LyricEditingManager, {
    useLyricEditingManagerContext,
} from './LyricEditingManager';
import FontFamilyControlComp from '../others/FontFamilyControlComp';

function genOptions(lyricEditingManager: LyricEditingManager) {
    return {
        theme: 'dark',
        fontFamily: lyricEditingManager.lyricEditingProps.fontFamily,
    };
}

function RenderHeaderComp() {
    const lyricEditingManager = useLyricEditingManagerContext();
    const [localFontFamily, setLocalFontFamily] = useState(
        lyricEditingManager.fontFamily,
    );
    const setLocalFontFamily1 = (fontFamily: string) => {
        setLocalFontFamily(fontFamily);
        lyricEditingManager.fontFamily = fontFamily;
    };
    const [localFontWeight, setLocalFontWeight] = useState(
        lyricEditingManager.fontWeight,
    );
    const setLocalFontWeight1 = (fontWeight: string) => {
        setLocalFontWeight(fontWeight);
        lyricEditingManager.fontWeight = fontWeight;
    };
    return (
        <div className="card-header d-flex justify-content-between align-items-center">
            <div className="d-flex">
                <strong>Font Family:</strong>
                <FontFamilyControlComp
                    fontFamily={localFontFamily}
                    setFontFamily={setLocalFontFamily1}
                    fontWeight={localFontWeight}
                    setFontWeight={setLocalFontWeight1}
                    isShowingLabel={false}
                />
            </div>
        </div>
    );
}

function RenderBodyComp() {
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
            className="w-100 h-100 p-3"
            dangerouslySetInnerHTML={{ __html: htmlData.html }}
        />
    );
}

export default function LyricPreviewerComp() {
    return (
        <div className="card w-100 h-100 ">
            <RenderHeaderComp />
            <div className="card-body overflow-hidden">
                <RenderBodyComp />
            </div>
        </div>
    );
}
