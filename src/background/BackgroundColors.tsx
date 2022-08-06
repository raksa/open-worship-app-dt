import ColorPicker, { AppColorType } from '../others/ColorPicker';
import { useBGSrcList } from '../_present/presentHelpers';
import PresentManager from '../_present/PresentManager';
import { BackgroundSrcType } from '../_present/PresentBGManager';

export default function BackgroundColors() {
    const bgSrcList = useBGSrcList(['update']);
    const keyBGSrcList = Object.entries(bgSrcList).filter(([_, bgSrc]) => {
        return bgSrc.type === 'color';
    });
    if (keyBGSrcList.length) {
        return (
            <>
                {keyBGSrcList.map(([key, bgSrc], i) => {
                    const onColorChange = (newColor: AppColorType | null) => {
                        const newBGSrc = newColor !== null ? ({
                            type: 'color',
                            src: newColor as string,
                        } as BackgroundSrcType) : null;
                        PresentManager.setBGSrcByKey(key, newBGSrc);
                    };
                    return (
                        <ColorPicker key={i}
                            color={bgSrc.src as AppColorType}
                            onColorChange={onColorChange} />
                    );
                })}
            </>
        );
    }
    return (
        <ColorPicker color={null}
            onColorChange={(newColor) => {
                if (newColor !== null) {
                    PresentManager.setBGSrc({
                        type: 'color',
                        src: newColor,
                    });
                }
            }} />
    );
}
