import './PresenterComp.scss';

import { lazy } from 'react';

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

const LazyAppDocumentPreviewerComp = lazy(() => {
    return import('./items/AppDocumentPreviewerComp');
});
const LazyBiblePreviewerRenderComp = lazy(() => {
    return import('../bible-reader/BiblePreviewerRenderComp');
});
const LazyLyricPreviewerComp = lazy(() => {
    return import('../lyric-list/LyricPreviewerComp');
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
    }
    return false;
}

const tabTypeList = [
    ['d', 'Documents', LazyAppDocumentPreviewerComp],
    ['l', 'Lyrics', LazyLyricPreviewerComp],
    ['b', 'Bibles', LazyBiblePreviewerRenderComp],
    ['a', 'Others', LazyPresenterOthersControllerComp],
] as const;
type TabKeyType = (typeof tabTypeList)[number][0];
export default function PresenterComp() {
    const [tabKey, setTabKey] = useStateSettingString<TabKeyType>(
        PRESENT_TAB_SETTING_NAME,
        'd',
    );
    useLyricSelecting(() => setTabKey('l'), []);
    useBibleItemShowing(() => setTabKey('b'), []);
    useVaryAppDocumentSelecting(() => setTabKey('d'));
    useAppDocumentItemSelecting(() => setTabKey('d'));
    return (
        <div id="presenter-manager" className="w-100 h-100">
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
                className="header"
            />
            <div className="body w-100 overflow-hidden">
                {tabTypeList.map(([type, _, target]) => {
                    return genTabBody<TabKeyType>(tabKey, [type, target]);
                })}
            </div>
        </div>
    );
}
