import './MiniPresentScreen.scss';

import './CustomHTMLPresentPreviewer';
import PresentManager, { PresentManagerContext } from '../PresentManager';
import {
    initReceivePresentMessage,
    usePMEvents,
} from '../presentEventHelpers';
import PresentPreviewerItem from './PresentPreviewerItem';
import MiniPresentScreenFooter, {
    DEFAULT_PREVIEW_SIZE,
} from './MiniPresentScreenFooter';
import {
    useStateSettingBoolean, useStateSettingNumber,
} from '../../helper/settingHelper';
import { toMaxId } from '../../helper/helpers';
import { showAppContextMenu } from '../../others/AppContextMenu';
import PresentPreviewerTools from './PresentPreviewerTools';
(window as any).PresentManager = PresentManager;

function openContextMenu(event: any) {
    showAppContextMenu(event, [
        {
            title: 'Add New Present',
            onClick() {
                const instances = PresentManager.getAllInstances();
                const ids = instances.map((presentManager) => {
                    return presentManager.presentId;
                });
                const maxId = toMaxId(ids);
                PresentManager.createInstance(maxId + 1);
                PresentManager.fireInstanceEvent();
            },
        },
    ]);
}

initReceivePresentMessage();
export default function MiniPresentScreen() {
    const [isShowingTools, setIsShowingTools] = useStateSettingBoolean(
        'mini-present-previewer-tool', true,
    );
    const [previewWith, _setPreviewWidth] = useStateSettingNumber(
        'mini-present-previewer', DEFAULT_PREVIEW_SIZE,
    );
    const setPreviewWidth = (size: number) => {
        _setPreviewWidth(size);
        PresentManager.getAllInstances().forEach((presentManager) => {
            presentManager.fireResizeEvent();
        });
    };
    usePMEvents(['instance']);
    const presentManagers = PresentManager.getPresentManagersSetting();
    return (
        <div className='card w-100 h-100'>
            <div className={'card-body d-flex flex-column'}
                onContextMenu={(event) => {
                    openContextMenu(event);
                }}
                style={{
                    overflow: 'auto',
                }}>
                {isShowingTools && <PresentPreviewerTools />}
                <div className='w-100'>
                    {presentManagers.map((presentManager) => {
                        return (
                            <PresentManagerContext.Provider
                                key={presentManager.key}
                                value={presentManager}>
                                <PresentPreviewerItem
                                    width={previewWith}
                                />
                            </PresentManagerContext.Provider>
                        );
                    })}
                </div>
            </div>
            <MiniPresentScreenFooter
                previewSize={previewWith}
                setPreviewSize={setPreviewWidth}
                isShowingTools={isShowingTools}
                setIsShowingTools={setIsShowingTools}
            />
        </div>
    );
}
