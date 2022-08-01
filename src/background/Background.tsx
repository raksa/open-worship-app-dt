import './Background.scss';

import React from 'react';
import { useStateSettingString } from '../helper/settingHelper';
import TabRender, {
    genTabBody,
} from '../others/TabRender';

const Colors = React.lazy(() => import('./Colors'));
const Images = React.lazy(() => import('./Images'));
const Videos = React.lazy(() => import('./Videos'));

// c: color, i: image, v: video
type TabType = 'c' | 'i' | 'v';
export default function Background() {
    const [tabType, setTabType] = useStateSettingString<TabType>('background-tab', 'i');
    return (
        <div className='background w-100 d-flex flex-column'>
            <div className='background-header'>
                <TabRender<TabType> tabs={[
                    ['c', 'Colors'],
                    ['i', 'Images'],
                    ['v', 'Videos'],
                ]}
                    activeTab={tabType}
                    setActiveTab={setTabType} />
            </div>
            <div className='background-body w-100 flex-fill'>
                {genTabBody(tabType, ['c', Colors])}
                {genTabBody(tabType, ['i', Images])}
                {genTabBody(tabType, ['v', Videos])}
            </div>
        </div>
    );
}
