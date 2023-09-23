import './MiniPresentScreen.scss';

import './CustomHTMLPresentPreviewer';
import PresentManager from '../PresentManager';
import {
    initReceivePresentMessage,
    usePMEvents,
} from '../presentEventHelpers';
import PresentPreviewerItem from './PresentPreviewerItem';
import MiniPresentScreenFooter, {
    DEFAULT_PREVIEW_SIZE,
} from './MiniPresentScreenFooter';
import { useStateSettingNumber } from '../../helper/settingHelper';
import { toMaxId } from '../../helper/helpers';
import { showAppContextMenu } from '../../others/AppContextMenu';
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
            <div className={'card-body'}
                onContextMenu={(event) => {
                    openContextMenu(event);
                }}
                style={{
                    overflow: 'auto',
                }}>
                {presentManagers.map((presentManager) => {
                    return (
                        <PresentPreviewerItem key={presentManager.key}
                            presentManager={presentManager}
                            width={previewWith} />
                    );
                })}
            </div>
            <MiniPresentScreenFooter
                previewSize={previewWith}
                setPreviewSize={setPreviewWidth}
            />
        </div>
    );
}
