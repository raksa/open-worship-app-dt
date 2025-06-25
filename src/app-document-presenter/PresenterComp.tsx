import './PresenterComp.scss';

import { lazy, useState } from 'react';

import {
    useBibleItemShowing,
    useLyricSelecting,
    useVaryAppDocumentSelecting,
} from '../event/PreviewingEventListener';
import { useAppDocumentItemSelecting } from '../event/VaryAppDocumentEventListener';
import { getSetting, useStateSettingString } from '../helper/settingHelpers';
import TabRenderComp, { genTabBody } from '../others/TabRenderComp';
import {
    checkIsVaryAppDocumentOnScreen,
    getSelectedVaryAppDocument,
} from '../app-document-list/appDocumentHelpers';
import LyricAppDocument from '../lyric-list/LyricAppDocument';
import { getSelectedLyric } from '../lyric-list/lyricHelpers';

const LazyAppDocumentPreviewerComp = lazy(() => {
    return import('./items/AppDocumentPreviewerComp');
});
const LazyBiblePreviewerRenderComp = lazy(() => {
    return import('../bible-reader/BiblePreviewerRenderComp');
});
const LazyLyricHandlerComp = lazy(() => {
    return import('../lyric-list/LyricHandlerComp');
});
const LazyPresenterOthersControllerComp = lazy(() => {
    return import('../presenter-others/PresenterOthersControllerComp');
});

const PRESENT_TAB_SETTING_NAME = 'presenter-tab';

export function getIsShowingVaryAppDocumentPreviewer() {
    return getSetting(PRESENT_TAB_SETTING_NAME) === 'd';
}
export function getIsShowingLyricPreviewer() {
    return getSetting(PRESENT_TAB_SETTING_NAME) === 'l';
}
export function getIsShowingBiblePreviewer() {
    return getSetting(PRESENT_TAB_SETTING_NAME) === 'f';
}

async function checkIsOnScreen<T>(targeKey: T) {
    if (targeKey === 'd') {
        const varyAppDocument = await getSelectedVaryAppDocument();
        if (varyAppDocument === null) {
            return false;
        }
        const isOnScreen =
            await checkIsVaryAppDocumentOnScreen(varyAppDocument);
        return isOnScreen;
    } else if (targeKey === 'l') {
        const selectedLyric = await getSelectedLyric();
        if (selectedLyric === null) {
            return false;
        }
        const lyricAppDocument = LyricAppDocument.getInstanceFromLyricFilePath(
            selectedLyric.filePath,
        );
        if (lyricAppDocument === null) {
            return false;
        }
        const isOnScreen =
            await checkIsVaryAppDocumentOnScreen(lyricAppDocument);
        return isOnScreen;
    }
    return false;
}

function RenderToggleFullViewComp({
    isFullWidget,
    setIsFullWidget,
}: Readonly<{
    isFullWidget: boolean;
    setIsFullWidget: (value: boolean) => void;
}>) {
    const fullScreenClassname = isFullWidget
        ? 'fullscreen-exit'
        : 'arrows-fullscreen';
    return (
        <div>
            <button
                className={
                    `btn btn-${isFullWidget ? '' : 'outline-'}info ` + 'btn-sm'
                }
                onClick={async () => {
                    setIsFullWidget(!isFullWidget);
                }}
            >
                <i className={`bi bi-${fullScreenClassname}`} />
            </button>
        </div>
    );
}

const tabTypeList = [
    ['d', 'Documents', LazyAppDocumentPreviewerComp],
    ['l', 'Lyrics', LazyLyricHandlerComp],
    ['b', 'Bibles', LazyBiblePreviewerRenderComp],
    ['a', 'Others', LazyPresenterOthersControllerComp],
] as const;
type TabKeyType = (typeof tabTypeList)[number][0];
export default function PresenterComp() {
    const [isFullWidget, setIsFullWidget] = useState(false);
    const [tabKey, setTabKey] = useStateSettingString<TabKeyType>(
        PRESENT_TAB_SETTING_NAME,
        'd',
    );
    useLyricSelecting(() => setTabKey('l'), []);
    useBibleItemShowing(() => setTabKey('b'), []);
    useVaryAppDocumentSelecting(() => setTabKey('d'));
    useAppDocumentItemSelecting(() => setTabKey('d'));
    return (
        <div
            className={
                'presenter-manager w-100 h-100 d-flex flex-column overflow-hidden' +
                ` ${isFullWidget ? ' app-full-view' : ''}`
            }
        >
            <div className="header d-flex w-100">
                <TabRenderComp<TabKeyType>
                    tabs={tabTypeList.map(([key, name]) => {
                        return {
                            key,
                            title: name,
                            checkIsOnScreen: checkIsOnScreen<TabKeyType>,
                        };
                    })}
                    activeTab={tabKey}
                    setActiveTab={setTabKey}
                    className="flex-fill"
                />
                <RenderToggleFullViewComp
                    isFullWidget={isFullWidget}
                    setIsFullWidget={setIsFullWidget}
                />
            </div>
            <div className="body flex-fill overflow-hidden">
                {tabTypeList.map(([type, _, target]) => {
                    return genTabBody<TabKeyType>(tabKey, [type, target]);
                })}
            </div>
        </div>
    );
}
