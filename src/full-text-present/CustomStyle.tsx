import './CustomStyle.scss';

import { useStateSettingString } from '../helper/settingHelper';
import React from 'react';
import TabRender, { genTabBody } from '../others/TabRender';

const Appearance = React.lazy(() => {
    return import('./Appearance');
});
const TextShadow = React.lazy(() => {
    return import('./TextShadow');
});

export default function CustomStyle() {
    return (
        <div className='custom-style card pointer border-white-round mt-1'>
            <Body />
        </div>
    );
}

const tabTypeList = [
    ['a', 'Appearance', Appearance],
    ['s', 'Shadow', TextShadow],
] as const;
type TabType = typeof tabTypeList[number][0];
function Body() {
    const [tabType, setTabType] = useStateSettingString<TabType>(
        'tull-text-present-custom-style-tab', 'a');
    return (
        <div className='card-body'>
            <div className='d-flex'>
                <TabRender<TabType>
                    tabs={tabTypeList.map(([type, name]) => {
                        return [type, name];
                    })}
                    activeTab={tabType}
                    setActiveTab={setTabType}
                    className='flex-fill' />
            </div>
            <div className='custom-style-body p-2'>
                {tabTypeList.map(([type, _, target]) => {
                    return genTabBody<TabType>(tabType, [type, target]);
                })}
            </div>
        </div>
    );
}
