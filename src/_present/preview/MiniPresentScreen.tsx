import './MiniPresentScreen.scss';

import './CustomHTMLPresentPreviewer';
import ShowHidePresent from './ShowHidePresent';
import MiniScreenClearControl from './MiniScreenClearControl';
import PresentManager from '../PresentManager';
import DisplayControl from './DisplayControl';
import { showAppContextMenu } from '../../others/AppContextMenu';
import { usePMEvents } from '../presentEventHelpers';
import PTEffectControl from './PTEffectControl';
import appProviderPresent from '../appProviderPresent';

function openContextMenu(e: any, presentManager: PresentManager) {
    const isOne = PresentManager.getAllInstances().length === 1;
    showAppContextMenu(e, [
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
                PresentManager.savePresentManagersSetting();
            },
        }],
        ...[{
            title: 'Add New Present',
            onClick() {
                const nextId = PresentManager.getAllInstances().length;
                PresentManager.getInstance(nextId);
                PresentManager.savePresentManagersSetting();
                PresentManager.fireInstanceEvent();
            },
        },
        ]]);
}

export default function MiniPresentScreen() {
    usePMEvents(['instance']);
    const presentManagers = PresentManager.getPresentManagersSetting();
    return (
        <>
            {presentManagers.map((presentManager, i) => {
                const selectedCN = presentManager.isSelected ? 'highlight-selected' : '';
                return (
                    <div key={i}
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
                        onDrop={(event) => {
                            event.preventDefault();
                            event.currentTarget.classList
                                .remove('receiving-child');
                            const receivedData = event.dataTransfer.getData('text');
                            try {
                                const data = JSON.parse(receivedData);
                                if (data.present && typeof data.present === 'object') {
                                    presentManager.receivePresentDrag(data.present);
                                }
                            } catch (error) {
                                appProviderPresent.appUtils.handleError(error);
                            }
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
            })}
        </>
    );
}
