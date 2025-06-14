import './BackgroundComp.scss';

import { lazy, useState } from 'react';

import {
    useStateSettingBoolean,
    useStateSettingString,
} from '../helper/settingHelpers';
import TabRenderComp, { genTabBody } from '../others/TabRenderComp';
import { useScreenBackgroundManagerEvents } from '../_screen/managers/screenEventHelpers';
import ShowingScreenIcon from '../_screen/preview/ShowingScreenIcon';
import {
    BackgroundSrcListType,
    BackgroundType,
    getBackgroundSrcListOnScreenSetting,
} from '../_screen/screenHelpers';
import ResizeActorComp from '../resize-actor/ResizeActorComp';
import { tran } from '../lang';
import { useAppEffect } from '../helper/debuggerHelpers';
import { audioEvent } from './audioBackgroundHelpers';

const LazyBackgroundColorsComp = lazy(() => {
    return import('./BackgroundColorsComp');
});
const LazyBackgroundImagesComp = lazy(() => {
    return import('./BackgroundImagesComp');
});
const LazyBackgroundVideosComp = lazy(() => {
    return import('./BackgroundVideosComp');
});
const LazyBackgroundSoundsComp = lazy(() => {
    return import('./BackgroundSoundsComp');
});

function RenderSoundTabComp({
    isSoundActive,
    setIsSoundActive,
}: Readonly<{
    isSoundActive: boolean;
    setIsSoundActive: (isSoundActive: boolean) => void;
}>) {
    const [isPlaying, setIsPlaying] = useState(false);
    useAppEffect(() => {
        audioEvent.onChange = setIsPlaying;
        return () => {
            audioEvent.onChange = () => {};
        };
    }, []);
    return (
        <ul className={'nav nav-tabs flex-fill d-flex justify-content-end'}>
            <li className={'nav-item '}>
                <button
                    className={
                        'btn btn-link nav-link' +
                        ` ${isSoundActive ? 'active' : ''}` +
                        ` ${isPlaying ? ' app-on-screen' : ''}`
                    }
                    onClick={() => {
                        setIsSoundActive(!isSoundActive);
                    }}
                >
                    ♫{tran('Sound')}♫
                </button>
            </li>
        </ul>
    );
}

const genIsSelected = (
    backgroundSrcList: BackgroundSrcListType,
    type: BackgroundType,
) => {
    const isSelected = Object.values(backgroundSrcList).some((src) => {
        return src.type === type;
    });
    return isSelected;
};

const tabTypeList = [
    ['color', 'Colors', LazyBackgroundColorsComp],
    ['image', 'Images', LazyBackgroundImagesComp],
    ['video', 'Videos', LazyBackgroundVideosComp],
] as const;
type TabKeyType = (typeof tabTypeList)[number][0] | 'sound';
export default function BackgroundComp() {
    const [isSoundActive, setIsSoundActive] = useStateSettingBoolean(
        'background-sound',
        false,
    );
    const [tabKey, setTabKey] = useStateSettingString<TabKeyType>(
        'background-tab',
        'image',
    );
    useScreenBackgroundManagerEvents(['update']);
    const backgroundSrcList = getBackgroundSrcListOnScreenSetting();

    const normalBackgroundChild = tabTypeList.map(([type, _, target]) => {
        return genTabBody<TabKeyType>(tabKey, [type, target]);
    });
    return (
        <div className="background w-100 d-flex flex-column">
            <div className="background-header d-flex">
                <TabRenderComp<TabKeyType>
                    tabs={tabTypeList.map(([key, name]) => {
                        return {
                            key,
                            title: name,
                            checkIsOnScreen: (targeKey) => {
                                return genIsSelected(
                                    backgroundSrcList,
                                    targeKey,
                                );
                            },
                        };
                    })}
                    activeTab={tabKey}
                    setActiveTab={setTabKey}
                />
                <RenderSoundTabComp
                    isSoundActive={isSoundActive}
                    setIsSoundActive={setIsSoundActive}
                />
            </div>
            <div className="background-body w-100 flex-fill d-flex">
                {isSoundActive ? (
                    <ResizeActorComp
                        flexSizeName={'flex-size-background'}
                        isHorizontal
                        isDisableQuickResize={true}
                        flexSizeDefault={{
                            h1: ['1'],
                            h2: ['1'],
                        }}
                        dataInput={[
                            {
                                children: {
                                    render: () => {
                                        return normalBackgroundChild;
                                    },
                                },
                                key: 'h1',
                                widgetName: 'Background Sound',
                            },
                            {
                                children: LazyBackgroundSoundsComp,
                                key: 'h2',
                                widgetName: 'Background Sound',
                            },
                        ]}
                    />
                ) : (
                    normalBackgroundChild
                )}
            </div>
        </div>
    );
}

export function RenderScreenIds({
    screenIds,
}: Readonly<{
    screenIds: number[];
}>) {
    return (
        <div
            style={{
                position: 'absolute',
                textShadow: '1px 1px 5px #000',
            }}
        >
            {screenIds.map((screenId) => {
                return <ShowingScreenIcon key={screenId} screenId={screenId} />;
            })}
        </div>
    );
}
