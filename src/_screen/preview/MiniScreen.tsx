import './MiniScreen.scss';

import ScreenManager, { ScreenManagerContext } from '../ScreenManager';
import {
    initReceiveScreenMessage, usePMEvents,
} from '../screenEventHelpers';
import ScreenPreviewerItem from './ScreenPreviewerItem';
import MiniScreenFooter, { defaultRangeSize } from './MiniScreenFooter';
import {
    useStateSettingBoolean, useStateSettingNumber,
} from '../../helper/settingHelpers';
import { toMaxId } from '../../helper/helpers';
import { showAppContextMenu } from '../../others/AppContextMenu';
import ScreenPreviewerTools from './ScreenPreviewerTools';
import { handleCtrlWheel } from '../../others/AppRange';

function openContextMenu(event: any) {
    showAppContextMenu(event, [
        {
            menuTitle: 'Add New Screen',
            onClick() {
                const instances = ScreenManager.getAllInstances();
                const ids = instances.map((screenManager) => {
                    return screenManager.screenId;
                });
                const maxId = toMaxId(ids);
                ScreenManager.createInstance(maxId + 1);
                ScreenManager.fireInstanceEvent();
            },
        },
    ]);
}

const DEFAULT_PREVIEW_SIZE = 50;
initReceiveScreenMessage();
export default function MiniScreen() {
    const [isShowingTools, setIsShowingTools] = useStateSettingBoolean(
        'mini-screen-previewer-tool', true,
    );
    const [previewScale, setPreviewScale] = useStateSettingNumber(
        'mini-screen-previewer', DEFAULT_PREVIEW_SIZE,
    );
    const setPreviewScale1 = (size: number) => {
        setPreviewScale(size);
        ScreenManager.getAllInstances().forEach((screenManager) => {
            screenManager.fireResizeEvent();
        });
    };
    usePMEvents(['instance']);
    const screenManagers = ScreenManager.getScreenManagersSetting();
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
                    {screenManagers.map((screenManager) => {
                        return (
                            <ScreenManagerContext
                                key={screenManager.key}
                                value={screenManager}>
                                <ScreenPreviewerItem
                                    width={previewWidth}
                                />
                            </ScreenManagerContext>
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
