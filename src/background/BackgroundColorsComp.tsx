import { useState } from 'react';

import ColorPicker from '../others/color/ColorPicker';
import { AppColorType } from '../others/color/colorHelpers';
import ScreenBackgroundManager from '../_screen/managers/ScreenBackgroundManager';
import { useScreenBackgroundManagerEvents } from '../_screen/managers/screenEventHelpers';
import { useAppEffect } from '../helper/debuggerHelpers';
import ShowingScreenIcon from '../_screen/preview/ShowingScreenIcon';
import { BackgroundSrcType } from '../_screen/screenHelpers';

export default function BackgroundColorsComp() {
    const [selectedBackgroundSrcList, setSelectedBackgroundSrcList] = useState<
        [string, BackgroundSrcType][] | null
    >(null);
    const handleNoColoring = async (_newColor: AppColorType, event: any) => {
        setSelectedBackgroundSrcList(null);
        ScreenBackgroundManager.handleBackgroundSelecting(event, 'color', null);
    };
    const handleColorChanging = async (newColor: AppColorType, event: any) => {
        setSelectedBackgroundSrcList(null);
        ScreenBackgroundManager.handleBackgroundSelecting(
            event,
            'color',
            newColor,
        );
    };
    useAppEffect(() => {
        if (selectedBackgroundSrcList === null) {
            setSelectedBackgroundSrcList(
                ScreenBackgroundManager.getBackgroundSrcListByType('color'),
            );
        }
    }, [selectedBackgroundSrcList]);
    useScreenBackgroundManagerEvents(['update'], undefined, () => {
        setSelectedBackgroundSrcList(
            ScreenBackgroundManager.getBackgroundSrcListByType('color'),
        );
    });
    if (selectedBackgroundSrcList === null) {
        return null;
    }
    return (
        <div
            className={'d-flex align-content-start flex-wrap w-100'}
            style={{
                overflowY: 'auto',
            }}
        >
            {selectedBackgroundSrcList.length === 0 ? (
                <ColorPicker
                    color={null}
                    defaultColor={'#000000'}
                    onNoColor={handleNoColoring}
                    onColorChange={handleColorChanging}
                />
            ) : (
                selectedBackgroundSrcList.map(([key, backgroundSrc], i) => {
                    const screenId = parseInt(key);
                    return (
                        <div
                            key={backgroundSrc.src + i}
                            className="p-1 m-1 app-border-white-round"
                        >
                            <ShowingScreenIcon screenId={screenId} />
                            <ColorPicker
                                color={backgroundSrc.src as AppColorType}
                                defaultColor={backgroundSrc.src as AppColorType}
                                onNoColor={handleNoColoring}
                                onColorChange={handleColorChanging}
                            />
                        </div>
                    );
                })
            )}
        </div>
    );
}
