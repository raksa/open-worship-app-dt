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
    useScreenBackgroundManagerEvents,
} from '../_screen/screenEventHelpers';
import ShowingScreenIcon from '../_screen/preview/ShowingScreenIcon';
import {
    BackgroundType, getBackgroundSrcListOnScreenSetting,
} from '../_screen/screenHelpers';
import ResizeActor from '../resize-actor/ResizeActor';
import { tran } from '../lang';

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
    useScreenBackgroundManagerEvents(['update']);
    const backgroundSrcList = getBackgroundSrcListOnScreenSetting();
    const toHLS = (type: BackgroundType) => {
        const isSelected = Object.values(backgroundSrcList).some((src) => {
            return src.type === type;
        });
        return isSelected ? 'nav-highlight-selected' : undefined;
    };
    const normalBackgroundChild = tabTypeList.map(([type, _, target]) => {
        return genTabBody<TabType>(tabType, [type, target]);
    });
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
                <ul className={
                    'nav nav-tabs flex-fill d-flex justify-content-end'
                }>
                    <li className={'nav-item '}>
                        <button className={
                            'btn btn-link nav-link' +
                            ` ${isSoundActive ? 'active' : ''}`
                        }
                            onClick={() => {
                                setIsSoundActive(!isSoundActive);
                            }}>
                            ♫{tran('Sound')}♫
                        </button>
                    </li>
                </ul>
            </div>
            <div className='background-body w-100 flex-fill d-flex'>
                {isSoundActive ? (
                    <ResizeActor
                        flexSizeName={'flex-size-background'}
                        isHorizontal
                        isDisableQuickResize={true}
                        flexSizeDefault={{
                            'h1': ['1'],
                            'h2': ['1'],
                        }}
                        dataInput={[{
                            children: {
                                render: () => {
                                    return normalBackgroundChild;
                                },
                            },
                            key: 'h1',
                            widgetName: 'Background Sound',
                        }, {
                            children: LazyBackgroundSounds,
                            key: 'h2',
                            widgetName: 'Background Sound',
                        }]}
                    />
                ) : normalBackgroundChild}
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
