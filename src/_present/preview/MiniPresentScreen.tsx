import './MiniPresentScreen.scss';

import './CustomHTMLPresentPreviewer';
import ShowHidePresent from './ShowHidePresent';
import MiniScreenClearControl from './MiniScreenClearControl';
import PresentManager from '../PresentManager';
import DisplayControl from './DisplayControl';
import { showAppContextMenu } from '../../others/AppContextMenu';
import {
    initReceivePresentMessage,
    usePMEvents,
} from '../presentEventHelpers';
import PTEffectControl from './PTEffectControl';
import { toMaxId } from '../../helper/helpers';
import { handleDrop } from '../../helper/dragHelpers';

function openContextMenu(event: any, presentManager: PresentManager) {
    const isOne = PresentManager.getAllInstances().length === 1;
    const { presentFTManager } = presentManager;
    const isPresentingFT = !!presentFTManager.ftItemData;
    const isLineSync = presentFTManager.isLineSync;
    const extraMenuItems = isPresentingFT ? [{
        title: `${isLineSync ? 'Un' : ''}Set Line Sync`,
        onClick() {
            presentFTManager.isLineSync = !isLineSync;
        },
    }] : [];
    showAppContextMenu(event, [
        ...isOne ? [] : [{
            title: 'Solo',
            onClick() {
                PresentManager.getSelectedInstances()
                    .forEach((presentManager1) => {
                        presentManager1.isSelected = false;
                    });
                presentManager.isSelected = true;
            },
        }],
        ...[{
            title: presentManager.isSelected ? 'Unselect' : 'Select',
            onClick() {
                presentManager.isSelected = !presentManager.isSelected;
            },
        }],
        ...isOne ? [] : [{
            title: 'Delete',
            onClick() {
                presentManager.delete();
            },
        }],
        ...[{
            title: 'Add New Present',
            onClick() {
                const instances = PresentManager.getAllInstances();
                const ids = instances.map((presentManager1) => {
                    return presentManager1.presentId;
                });
                const maxId = toMaxId(ids);
                PresentManager.getInstance(maxId + 1);
                PresentManager.savePresentManagersSetting();
                PresentManager.fireInstanceEvent();
            },
        }, ...extraMenuItems]]);
}

initReceivePresentMessage();
export default function MiniPresentScreen() {
    usePMEvents(['instance']);
    const presentManagers = PresentManager.getPresentManagersSetting();
    return (
        <>
            {presentManagers.map((presentManager) => {
                return (
                    <RenderManager key={presentManager.key}
                        presentManager={presentManager} />
                );
            })}
        </>
    );
}

function RenderManager({ presentManager }: {
    presentManager: PresentManager;
}) {
    const selectedCN = presentManager.isSelected ? 'highlight-selected' : '';
    return (
        <div key={presentManager.key}
            className={`mini-present-screen card ${selectedCN}`}
            style={{
                overflow: 'hidden',
            }}
            onContextMenu={(event) => {
                openContextMenu(event, presentManager);
            }}
            onDragOver={(event) => {
                event.preventDefault();
                event.currentTarget.classList
                    .add('receiving-child');
            }}
            onDragLeave={(event) => {
                event.preventDefault();
                event.currentTarget.classList
                    .remove('receiving-child');
            }}
            onDrop={async (event) => {
                event.currentTarget.classList.remove('receiving-child');
                const droppedData = await handleDrop(event);
                if (droppedData === null) {
                    return;
                }
                presentManager.receivePresentDrag(droppedData);
            }}>
            <div className='card-header pb-2' style={{
                overflowX: 'auto',
                overflowY: 'hidden',
                height: '52px',
            }}>
                <div className={'d-flex justify-content-around align-content-start'}
                    style={{
                        minWidth: '500px',
                    }}>
                    <ShowHidePresent
                        presentManager={presentManager} />
                    <MiniScreenClearControl
                        presentManager={presentManager} />
                    <DisplayControl
                        presentManager={presentManager} />
                    <PTEffectControl
                        presentManager={presentManager} />
                </div>
            </div>
            <div>
                <mini-present-previewer
                    presentId={presentManager.presentId} />
            </div>
        </div>
    );
}