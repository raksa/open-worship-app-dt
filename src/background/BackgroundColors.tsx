import { useState } from 'react';

import ColorPicker from '../others/color/ColorPicker';
import { AppColorType } from '../others/color/colorHelpers';
import ScreenBackgroundManager from '../_screen/ScreenBackgroundManager';
import {
    useScreenBackgroundManagerEvents,
} from '../_screen/screenEventHelpers';
import { useAppEffect } from '../helper/debuggerHelpers';
import ShowingScreenIcon from '../_screen/preview/ShowingScreenIcon';
import { BackgroundSrcType } from '../_screen/screenHelpers';

export default function BackgroundColors() {
    const [selectedBackgroundSrcList, setSelectedBackgroundSrcList] = (
        useState<[string, BackgroundSrcType][] | null>(null)
    );
    const handleNoColoring = async (
        _newColor: AppColorType, event: any,
    ) => {
        setSelectedBackgroundSrcList(null);
        ScreenBackgroundManager.backgroundSrcSelect(null, event, 'color');
    };
    const handleColorChanging = async (
        newColor: AppColorType, event: any) => {
        setSelectedBackgroundSrcList(null);
        ScreenBackgroundManager.backgroundSrcSelect(newColor, event, 'color');
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
            ScreenBackgroundManager.getBackgroundSrcListByType('color',));
    });
    if (selectedBackgroundSrcList === null) {
        return null;
    }
    if (selectedBackgroundSrcList.length === 0) {
        return (
            <ColorPicker color={null}
                defaultColor={'#000000'}
                onNoColor={handleNoColoring}
                onColorChange={handleColorChanging}
            />
        );
    }
    return (
        <div className={
            'd-flex align-content-start flex-wrap w-100 overflow-hidden'
        }>
            {selectedBackgroundSrcList.map(([key, backgroundSrc]) => {
                const screenId = parseInt(key, 10);
                return (
                    <div key={backgroundSrc.src}
                        className='p-1 m-1 app-border-white-round'>
                        <ShowingScreenIcon screenId={screenId} />
                        <ColorPicker
                            color={backgroundSrc.src as AppColorType}
                            defaultColor={backgroundSrc.src as AppColorType}
                            onNoColor={handleNoColoring}
                            onColorChange={handleColorChanging}
                        />
                    </div>
                );
            })}
        </div>
    );
}
