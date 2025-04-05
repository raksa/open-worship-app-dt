import './MiniScreen.scss';

import ScreenPreviewerItemComp from './ScreenPreviewerItemComp';
import MiniScreenFooter, {
    DEFAULT_PREVIEW_SIZE,
    defaultRangeSize,
} from './MiniScreenFooter';
import {
    useStateSettingBoolean,
    useStateSettingNumber,
} from '../../helper/settingHelpers';
import { showAppContextMenu } from '../../context-menu/AppContextMenuComp';
import ScreenPreviewerTools from './ScreenPreviewerTools';
import { handleCtrlWheel } from '../../others/AppRangeComp';
import {
    genNewScreenManagerBase,
    getAllScreenManagers,
    getScreenManagersFromSetting,
} from '../managers/screenManagerHelpers';
import ScreenManager from '../managers/ScreenManager';
import {
    ScreenManagerBaseContext,
    useScreenManagerEvents,
} from '../managers/screenManagerHooks';

function openContextMenu(event: any) {
    showAppContextMenu(event, [
        {
            menuTitle: 'Add New Screen',
            onSelect() {
                genNewScreenManagerBase();
            },
        },
        {
            menuTitle: 'Refresh Preview',
            onSelect() {
                getAllScreenManagers().forEach((screenManager) => {
                    screenManager.fireResizeEvent();
                });
            },
        },
    ]);
}

ScreenManager.initReceiveScreenMessage();
export default function MiniScreen() {
    const [isShowingTools, setIsShowingTools] = useStateSettingBoolean(
        'mini-screen-previewer-tool',
        false,
    );
    const [previewScale, setPreviewScale] = useStateSettingNumber(
        'mini-screen-previewer',
        defaultRangeSize.size,
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
        <div className="card w-100 h-100">
            <div
                className={'card-body d-flex flex-column'}
                style={{
                    overflow: 'auto',
                }}
                onContextMenu={(event) => {
                    openContextMenu(event);
                }}
                onWheel={(event) => {
                    handleCtrlWheel({
                        event,
                        value: previewScale,
                        setValue: setPreviewScale1,
                        defaultSize: defaultRangeSize,
                    });
                }}
            >
                {isShowingTools && <ScreenPreviewerTools />}
                <div className="w-100">
                    {screenManagers.map((screenManager) => {
                        return (
                            <ScreenManagerBaseContext
                                key={screenManager.key}
                                value={screenManager}
                            >
                                <ScreenPreviewerItemComp width={previewWidth} />
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
