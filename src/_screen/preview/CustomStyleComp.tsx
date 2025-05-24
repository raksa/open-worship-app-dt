import './CustomStyle.scss';

import { lazy } from 'react';

import { useStateSettingString } from '../../helper/settingHelpers';
import TabRenderComp, { genTabBody } from '../../others/TabRenderComp';

const LazyAppearanceComp = lazy(() => {
    return import('./AppearanceComp');
});
const LazyTextShadowComp = lazy(() => {
    return import('./TextShadow');
});

export default function CustomStyleComp() {
    return (
        <div className="custom-style card pointer app-border-white-round mt-1">
            <Body />
        </div>
    );
}

const tabTypeList = [
    ['a', 'Appearance', LazyAppearanceComp],
    ['s', 'Shadow', LazyTextShadowComp],
] as const;
type TabType = (typeof tabTypeList)[number][0];
function Body() {
    const [tabType, setTabType] = useStateSettingString<TabType>(
        'tull-text-screen-custom-style-tab',
        'a',
    );

    return (
        <div className="card-body">
            <div className="d-flex">
                <TabRenderComp<TabType>
                    tabs={tabTypeList.map(([type, name]) => {
                        return [type, name];
                    })}
                    activeTab={tabType}
                    setActiveTab={setTabType}
                    className="flex-fill"
                />
            </div>
            <div className="custom-style-body p-2">
                {tabTypeList.map(([type, _, target]) => {
                    return genTabBody<TabType>(tabType, [type, target]);
                })}
            </div>
        </div>
    );
}
