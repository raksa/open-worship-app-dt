import './Presenter.scss';

import { lazy } from 'react';

import {
    useLyricSelecting,
    useVaryAppDocumentSelecting,
} from '../event/PreviewingEventListener';
import { useAppDocumentItemSelecting } from '../event/SlideListEventListener';
import { getSetting, useStateSettingString } from '../helper/settingHelpers';
import TabRenderComp, { genTabBody } from '../others/TabRenderComp';

const LazyAppDocumentPreviewerComp = lazy(() => {
    return import('./items/AppDocumentPreviewerComp');
});
const LazyBiblePreviewerRenderComp = lazy(() => {
    return import('../bible-reader/BiblePreviewerRenderComp');
});
const LazyLyricPreviewerComp = lazy(() => {
    return import('../advance-presenter/LyricPreviewerComp');
});
const LazyPresenterOthersControllerComp = lazy(() => {
    return import('../presenter-others/PresenterOthersControllerComp');
});

const PRESENT_TAB_SETTING_NAME = 'presenter-tab';
export function getIsShowingVaryAppDocumentPreviewer() {
    return getSetting(PRESENT_TAB_SETTING_NAME) === 'd';
}
export function getIsShowingFTPreviewer() {
    return getSetting(PRESENT_TAB_SETTING_NAME) === 'f';
}

const tabTypeList = [
    ['d', 'Documents', LazyAppDocumentPreviewerComp],
    ['l', 'Lyrics', LazyLyricPreviewerComp],
    ['b', 'Bibles', LazyBiblePreviewerRenderComp],
    ['a', 'Others', LazyPresenterOthersControllerComp],
] as const;
type TabType = (typeof tabTypeList)[number][0];
export default function Presenter() {
    const [tabType, setTabType] = useStateSettingString<TabType>(
        PRESENT_TAB_SETTING_NAME,
        'd',
    );
    useLyricSelecting(() => setTabType('l'));
    useVaryAppDocumentSelecting(() => setTabType('d'));
    useAppDocumentItemSelecting(() => setTabType('d'));
    return (
        <div id="presenter-manager" className="w-100 h-100">
            <TabRenderComp<TabType>
                tabs={tabTypeList.map(([type, name]) => {
                    return [type, name];
                })}
                activeTab={tabType}
                setActiveTab={setTabType}
                className="header"
            />
            <div className="body w-100 overflow-hidden">
                {tabTypeList.map(([type, _, target]) => {
                    return genTabBody<TabType>(tabType, [type, target]);
                })}
            </div>
        </div>
    );
}
