import { useCallback, useState } from 'react';

import ColorPicker from '../others/color/ColorPicker';
import { AppColorType } from '../others/color/colorHelpers';
import ScreenBGManager, {
    BackgroundSrcType,
} from '../_screen/ScreenBGManager';
import { usePBGMEvents } from '../_screen/screenEventHelpers';
import { RenderScreenIds } from './Background';
import { useAppEffect } from '../helper/debuggerHelpers';

export default function BackgroundColors() {
    const [selectedBGSrcList, setSelectedBGSrcList] = useState<
        [string, BackgroundSrcType][] | null>(null);
    const onNoColorCallback = useCallback(async (
        _newColor: AppColorType, event: any) => {
        setSelectedBGSrcList(null);
        ScreenBGManager.bgSrcSelect(null, event, 'color');
    }, []);
    const onColorChangeCallback = useCallback(async (
        newColor: AppColorType, event: any) => {
        setSelectedBGSrcList(null);
        ScreenBGManager.bgSrcSelect(newColor, event, 'color');
    }, []);
    useAppEffect(() => {
        if (selectedBGSrcList === null) {
            setSelectedBGSrcList(ScreenBGManager.getBGSrcListByType('color'));
        }
    }, [selectedBGSrcList]);
    usePBGMEvents(['update'], undefined, () => {
        setSelectedBGSrcList(ScreenBGManager.getBGSrcListByType('color'));
    });
    if (selectedBGSrcList === null) {
        return null;
    }
    if (selectedBGSrcList.length) {
        return (
            <>
                <div title={'Show in presents:'
                    + selectedBGSrcList.map(([key]) => key).join(',')}>
                    <RenderScreenIds
                        ids={selectedBGSrcList.map(([key]) => +key)}
                    />
                </div>
                {selectedBGSrcList.map(([_, bgSrc]) => {
                    return (
                        <ColorPicker key={bgSrc.src}
                            color={bgSrc.src as AppColorType}
                            defaultColor={bgSrc.src as AppColorType}
                            onNoColor={onNoColorCallback}
                            onColorChange={onColorChangeCallback} />
                    );
                })}
            </>
        );
    }
    return (
        <ColorPicker color={null}
            defaultColor={'#000000'}
            onNoColor={onNoColorCallback}
            onColorChange={onColorChangeCallback} />
    );
}
