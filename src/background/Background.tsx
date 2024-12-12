import './Background.scss';

import { lazy } from 'react';

import {
    useStateSettingBoolean,
    useStateSettingString,
} from '../helper/settingHelpers';
import TabRender, {
    genTabBody,
} from '../others/TabRender';
import {
    usePBGMEvents,
} from '../_screen/screenEventHelpers';
import ShowingScreenIcon from '../_screen/preview/ShowingScreenIcon';
import {
    BackgroundType, getBGSrcListOnScreenSetting,
} from '../_screen/screenHelpers';

const LazyBackgroundColors = lazy(() => {
    return import('./BackgroundColors');
});
const LazyBackgroundImages = lazy(() => {
    return import('./BackgroundImages');
});
const LazyBackgroundVideos = lazy(() => {
    return import('./BackgroundVideos');
});
const LazyBackgroundSounds = lazy(() => {
    return import('./BackgroundSounds');
});


const tabTypeList = [
    ['color', 'Colors', LazyBackgroundColors],
    ['image', 'Images', LazyBackgroundImages],
    ['video', 'Videos', LazyBackgroundVideos],
] as const;
type TabType = typeof tabTypeList[number][0] | 'sound';
export default function Background() {
    const [isSoundActive, setIsSoundActive] = useStateSettingBoolean(
        'background-sound', false,
    );
    const [tabType, setTabType] = useStateSettingString<TabType>(
        'background-tab', 'image',
    );
    usePBGMEvents(['update']);
    const bgSrcList = getBGSrcListOnScreenSetting();
    const toHLS = (type: BackgroundType) => {
        const isSelected = Object.values(bgSrcList).some((src) => {
            return src.type === type;
        });
        return isSelected ? 'nav-highlight-selected' : undefined;
    };
    return (
        <div className='background w-100 d-flex flex-column'>
            <div className='background-header d-flex'>
                <TabRender<TabType>
                    tabs={tabTypeList.map(([type, name]) => {
                        return [type, name, toHLS(type)];
                    })}
                    activeTab={tabType}
                    setActiveTab={setTabType}
                />
                <TabRender<'sound' | ''>
                    tabs={[[
                        'sound', '♫Sound♫', undefined,
                    ]]}
                    activeTab={isSoundActive ? 'sound' : ''}
                    setActiveTab={() => {
                        setIsSoundActive(!isSoundActive);
                    }}
                />
            </div>
            <div className='background-body w-100 flex-fill d-flex'>
                {tabTypeList.map(([type, _, target]) => {
                    return genTabBody<TabType>(tabType, [type, target]);
                })}
                {!isSoundActive ? null : genTabBody<TabType>(
                    'sound', ['sound', LazyBackgroundSounds],
                )}
            </div>
        </div>
    );
}

export function RenderScreenIds({ screenIds }: Readonly<{
    screenIds: number[],
}>) {
    return (
        <div style={{
            position: 'absolute',
            textShadow: '1px 1px 5px #000',
        }}>
            {screenIds.map((screenId) => {
                return (
                    <ShowingScreenIcon
                        key={screenId}
                        screenId={screenId}
                    />
                );
            })}
        </div>
    );
}
