import './MiniScreen.scss';

import ScreenPreviewerItemComp from './ScreenPreviewerItemComp';
import MiniScreenFooter, { defaultRangeSize } from './MiniScreenFooter';
import {
    useStateSettingBoolean, useStateSettingNumber,
} from '../../helper/settingHelpers';
import { showAppContextMenu } from '../../others/AppContextMenuComp';
import ScreenPreviewerTools from './ScreenPreviewerTools';
import { handleCtrlWheel } from '../../others/AppRangeComp';
import {
    genNewScreenManagerBase, getAllScreenManagers, getScreenManagersFromSetting,
} from '../managers/screenManagerHelpers';
import ScreenManager from '../managers/ScreenManager';
import {
    ScreenManagerBaseContext, useScreenManagerEvents,
} from '../managers/screenManagerHooks';

function openContextMenu(event: any) {
    showAppContextMenu(event, [
        {
            menuTitle: 'Add New Screen',
            onClick() {
                genNewScreenManagerBase();
            },
        },
    ]);
}

const DEFAULT_PREVIEW_SIZE = 50;
ScreenManager.initReceiveScreenMessage();
export default function MiniScreen() {
    const [isShowingTools, setIsShowingTools] = useStateSettingBoolean(
        'mini-screen-previewer-tool', true,
    );
    const [previewScale, setPreviewScale] = useStateSettingNumber(
        'mini-screen-previewer', DEFAULT_PREVIEW_SIZE,
    );
    const setPreviewScale1 = (size: number) => {
        setPreviewScale(size);
        getAllScreenManagers().forEach((screenManager) => {
            screenManager.fireResizeEvent();
        });
    };
    useScreenManagerEvents(['instance']);
    const screenManagers = getScreenManagersFromSetting();
    const previewWidth = DEFAULT_PREVIEW_SIZE * previewScale;
    return (
        <div className='card w-100 h-100'>
            <div className={'card-body d-flex flex-column'}
                style={{
                    overflow: 'auto',
                }}
                onContextMenu={(event) => {
                    openContextMenu(event);
                }}
                onWheel={(event) => {
                    handleCtrlWheel({
                        event, value: previewScale,
                        setValue: setPreviewScale1,
                        defaultSize: defaultRangeSize,
                    });
                }}>
                {isShowingTools && (
                    <ScreenPreviewerTools />
                )}
                <div className='w-100'>
                    {screenManagers.map((screenManagerBase) => {
                        return (
                            <ScreenManagerBaseContext
                                key={screenManagerBase.key}
                                value={screenManagerBase}>
                                <ScreenPreviewerItemComp
                                    width={previewWidth}
                                />
                            </ScreenManagerBaseContext>
                        );
                    })}
                </div>
            </div>
            <MiniScreenFooter
                previewSizeScale={previewScale}
                setPreviewSizeScale={setPreviewScale1}
                isShowingTools={isShowingTools}
                setIsShowingTools={setIsShowingTools}
            />
        </div>
    );
}
