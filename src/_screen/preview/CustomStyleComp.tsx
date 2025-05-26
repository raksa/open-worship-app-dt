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

const tabTypeList = [
    ['a', 'Appearance', LazyAppearanceComp],
    ['s', 'Shadow', LazyTextShadowComp],
] as const;
type TabType = (typeof tabTypeList)[number][0];
export default function CustomStyleComp({
    onClose,
}: Readonly<{
    onClose: () => void;
}>) {
    const [tabType, setTabType] = useStateSettingString<TabType>(
        'tull-text-screen-custom-style-tab',
        'a',
    );
    return (
        <div className="custom-style card app-border-white-round mt-1">
            <div className="card-header">
                <TabRenderComp<TabType>
                    tabs={tabTypeList.map(([type, name]) => {
                        return [type, name];
                    })}
                    activeTab={tabType}
                    setActiveTab={setTabType}
                />
                <div
                    className="app-caught-hover-pointer"
                    style={{ position: 'absolute', top: '0', right: '0' }}
                    onClick={onClose}
                >
                    <i className="bi bi-x-lg" style={{ color: 'red' }} />
                </div>
            </div>
            <div className="card-body">
                <div className="custom-style-body p-2">
                    {tabTypeList.map(([type, _, target]) => {
                        return genTabBody<TabType>(tabType, [type, target]);
                    })}
                </div>
            </div>
        </div>
    );
}
