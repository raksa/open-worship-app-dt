import './MiniScreen.scss';

import ScreenManager, { ScreenManagerContext } from '../ScreenManager';
import {
    initReceiveScreenMessage, usePMEvents,
} from '../screenEventHelpers';
import ScreenPreviewerItem from './ScreenPreviewerItem';
import MiniScreenFooter, {
    DEFAULT_PREVIEW_SIZE,
} from './MiniScreenFooter';
import {
    useStateSettingBoolean, useStateSettingNumber,
} from '../../helper/settingHelper';
import { toMaxId } from '../../helper/helpers';
import { showAppContextMenu } from '../../others/AppContextMenu';
import ScreenPreviewerTools from './ScreenPreviewerTools';

function openContextMenu(event: any) {
    showAppContextMenu(event, [
        {
            title: 'Add New Screen',
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

initReceiveScreenMessage();
export default function MiniScreen() {
    const [isShowingTools, setIsShowingTools] = useStateSettingBoolean(
        'mini-screen-previewer-tool', true,
    );
    const [previewWith, _setPreviewWidth] = useStateSettingNumber(
        'mini-screen-previewer', DEFAULT_PREVIEW_SIZE,
    );
    const setPreviewWidth = (size: number) => {
        _setPreviewWidth(size);
        ScreenManager.getAllInstances().forEach((screenManager) => {
            screenManager.fireResizeEvent();
        });
    };
    usePMEvents(['instance']);
    const screenManagers = ScreenManager.getScreenManagersSetting();
    return (
        <div className='card w-100 h-100'>
            <div className={'card-body d-flex flex-column'}
                onContextMenu={(event) => {
                    openContextMenu(event);
                }}
                style={{
                    overflow: 'auto',
                }}>
                {isShowingTools && (
                    <ScreenPreviewerTools />
                )}
                <div className='w-100'>
                    {screenManagers.map((screenManager) => {
                        return (
                            <ScreenManagerContext.Provider
                                key={screenManager.key}
                                value={screenManager}>
                                <ScreenPreviewerItem
                                    width={previewWith}
                                />
                            </ScreenManagerContext.Provider>
                        );
                    })}
                </div>
            </div>
            <MiniScreenFooter
                previewSize={previewWith}
                setPreviewSize={setPreviewWidth}
                isShowingTools={isShowingTools}
                setIsShowingTools={setIsShowingTools}
            />
        </div>
    );
}
