import './Background.scss';

import React from 'react';
import { useStateSettingString } from '../helper/settingHelper';
import TabRender, {
    genTabBody,
} from '../others/TabRender';
import { usePBGMEvents } from '../_present/presentHelpers';
import PresentBGManager, {
    BackgroundType,
} from '../_present/PresentBGManager';

const BackgroundColors = React.lazy(() => import('./BackgroundColors'));
const BackgroundImages = React.lazy(() => import('./BackgroundImages'));
const BackgroundVideos = React.lazy(() => import('./BackgroundVideos'));

// c: color, i: image, v: video
type TabType = 'c' | 'i' | 'v';
export default function Background() {
    const [tabType, setTabType] = useStateSettingString<TabType>('background-tab', 'i');
    usePBGMEvents(['update']);
    const bgSrcList = PresentBGManager.getBGSrcList();
    const toHLS = (type: BackgroundType) => {
        const b = Object.values(bgSrcList).some(src => {
            return src.type === type;
        });
        return b ? 'highlight-selected' : undefined;
    };
    return (
        <div className='background w-100 d-flex flex-column'>
            <div className='background-header'>
                <TabRender<TabType> tabs={[
                    ['c', 'Colors', toHLS('color')],
                    ['i', 'Images', toHLS('image')],
                    ['v', 'Videos', toHLS('video')],
                ]}
                    activeTab={tabType}
                    setActiveTab={setTabType} />
            </div>
            <div className='background-body w-100 flex-fill'>
                {genTabBody(tabType, ['c', BackgroundColors])}
                {genTabBody(tabType, ['i', BackgroundImages])}
                {genTabBody(tabType, ['v', BackgroundVideos])}
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
