import './CustomHTMLPresentPreviewer';

import ShowHidePresent from './ShowHidePresent';
import MiniScreenClearControl from './MiniScreenClearControl';
import PresentManager from '../PresentManager';
import DisplayControl from './DisplayControl';
import { showAppContextMenu } from '../../others/AppContextMenu';
import PTEffectControl from './PTEffectControl';
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
        ...extraMenuItems,
    ]);
}

export default function PresentPreviewerItem({ presentManager, width }: {
    presentManager: PresentManager, width: number,
}) {
    const selectedCN = presentManager.isSelected ? 'highlight-selected' : '';
    return (
        <div key={presentManager.key}
            className={`mini-present-screen card m-1 ${selectedCN}`}
            style={{
                overflow: 'hidden',
                width: `${width}px`,
                display: 'inline-block',
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
            <div className='card-header w-100 pb-2' style={{
                overflowX: 'auto',
                overflowY: 'hidden',
                height: '35px',
            }}>
                <div className={'d-flex'}>
                    <div className='d-flex justify-content-start'>
                        <ShowHidePresent
                            presentManager={presentManager} />
                        <MiniScreenClearControl
                            presentManager={presentManager} />
                    </div>
                    <div className='flex-fill d-flex justify-content-end'>
                        <DisplayControl
                            presentManager={presentManager} />
                        <PTEffectControl
                            presentManager={presentManager} />
                    </div>
                </div>
            </div>
            <div className='w-100'>
                <mini-present-previewer
                    presentId={presentManager.presentId} />
            </div>
        </div>
    );
}
