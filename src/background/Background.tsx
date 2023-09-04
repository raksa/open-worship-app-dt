import './Background.scss';

import React from 'react';
import {
    useStateSettingString,
} from '../helper/settingHelper';
import TabRender, {
    genTabBody,
} from '../others/TabRender';
import PresentBGManager, {
    BackgroundType,
} from '../_present/PresentBGManager';
import {
    usePBGMEvents,
} from '../_present/presentEventHelpers';

const BackgroundColors = React.lazy(() => {
    return import('./BackgroundColors');
});
const BackgroundImages = React.lazy(() => {
    return import('./BackgroundImages');
});
const BackgroundVideos = React.lazy(() => {
    return import('./BackgroundVideos');
});


const tabTypeList = [
    ['color', 'Colors', BackgroundColors],
    ['image', 'Images', BackgroundImages],
    ['video', 'Videos', BackgroundVideos],
] as const;
type TabType = typeof tabTypeList[number][0];
export default function Background() {
    const [tabType, setTabType] = useStateSettingString<TabType>(
        'background-tab', 'image',
    );
    usePBGMEvents(['update']);
    const bgSrcList = PresentBGManager.getBGSrcList();
    const toHLS = (type: BackgroundType) => {
        const isSelected = Object.values(bgSrcList).some((src) => {
            return src.type === type;
        });
        return isSelected ? 'nav-highlight-selected' : undefined;
    };
    return (
        <div className='background w-100 d-flex flex-column'>
            <div className='background-header'>
                <TabRender<TabType>
                    tabs={tabTypeList.map(([type, name]) => {
                        return [type, name, toHLS(type)];
                    })}
                    activeTab={tabType}
                    setActiveTab={setTabType} />
            </div>
            <div className='background-body w-100 flex-fill'>
                {tabTypeList.map(([type, _, target]) => {
                    return genTabBody<TabType>(tabType, [type, target]);
                })}
            </div>
        </div>
    );
}

export function RenderPresentIds({ ids }: {
    ids: number[],
}) {
    return (
        <div style={{
            position: 'absolute',
            textShadow: '1px 1px 5px #000',
        }}>
            {ids.join(',')}
        </div>
    );
}
