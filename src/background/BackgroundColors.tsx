import ColorPicker, { AppColorType } from '../others/ColorPicker';
import { usePBGMEvents } from '../_present/presentHelpers';
import PresentManager from '../_present/PresentManager';
import PresentBGManager, {
    BackgroundSrcType,
} from '../_present/PresentBGManager';

export default function BackgroundColors() {
    usePBGMEvents(['update']);
    const keyBGSrcList = PresentBGManager.getBGSrcListByType('color');
    if (keyBGSrcList.length) {
        return (
            <>
                {keyBGSrcList.map(([key, bgSrc], i) => {
                    const onColorChange = (newColor: AppColorType | null) => {
                        const newBGSrc = newColor !== null ? ({
                            type: 'color',
                            src: newColor as string,
                        } as BackgroundSrcType) : null;
                        const presentManager = PresentManager.getInstanceByKey(key);
                        presentManager.presentBGManager.bgSrc = newBGSrc;
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
                    PresentManager.getSelectedInstances()
                        .forEach((presentManager) => {
                            presentManager.presentBGManager.bgSrc = {
                                type: 'color',
                                src: newColor,
                            };
                        });
                }
            }} />
    );
}
