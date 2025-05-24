import { lazy } from 'react';

import TabRenderComp, { genTabBody } from '../others/TabRenderComp';
import { useStateSettingString } from '../helper/settingHelpers';

const LazyBibleFindPreviewerComp = lazy(() => {
    return import('./BibleFindPreviewerComp');
});
const LazyBibleCrossReferentPreviewerComp = lazy(() => {
    return import('./BibleCrossReferentPreviewerComp');
});

const tabTypeList = [
    ['s', 'Search', LazyBibleFindPreviewerComp],
    ['c', 'Cross Referent', LazyBibleCrossReferentPreviewerComp],
] as const;
type TabType = (typeof tabTypeList)[number][0];
export default function BibleSearchPreviewerComp() {
    const [tabType, setTabType] = useStateSettingString<TabType>(
        'bible-search-tab',
        's',
    );
    return (
        <div className="card w-100 h-100 overflow-hidden d-flex flex-column">
            <div className="card-header">
                <TabRenderComp<TabType>
                    tabs={tabTypeList.map(([type, name]) => {
                        return [type, name];
                    })}
                    activeTab={tabType}
                    setActiveTab={setTabType}
                    className="card-header"
                />
            </div>
            <div className="card-body">
                {tabTypeList.map(([type, _, target]) => {
                    return genTabBody<TabType>(tabType, [type, target]);
                })}
            </div>
        </div>
    );
}
