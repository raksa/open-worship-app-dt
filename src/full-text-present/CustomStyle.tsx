import './CustomStyle.scss';

import { useStateSettingString } from '../helper/settingHelper';
import React from 'react';
import TabRender, { genTabBody } from '../others/TabRender';

const Appearance = React.lazy(() => import('./Appearance'));
const TextShadow = React.lazy(() => import('./TextShadow'));

export default function CustomStyle() {
    return (
        <div className='custom-style card pointer border-white-round mt-1'>
            <div className='card-header'>
                Custom Style
            </div>
            <Body />
        </div>
    );
}

// a: appearance, s: shadow
type TabType = 'a' | 's';
function Body() {
    const [tabType, setTabType] = useStateSettingString<TabType>(
        'tull-text-present-custom-style-tab', 'a');
    return (
        <div className='card-body'>
            <div className='d-flex'>
                <TabRender<TabType> tabs={[
                    ['a', 'Appearance'],
                    ['s', 'Shadow'],
                ]}
                    activeTab={tabType}
                    setActiveTab={setTabType}
                    className='flex-fill' />
            </div>
            <div className='custom-style-body p-2'>
                {genTabBody(tabType, ['a', Appearance])}
                {genTabBody(tabType, ['s', TextShadow])}
            </div>
        </div>
    );
}
