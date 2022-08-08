import './MiniPresentScreen.scss';

import './CustomHTMLPresentPreviewer';
import ShowHidePresent from './ShowHidePresent';
import ClearControl from './ClearControl';
import PresentManager from '../PresentManager';
import DisplayControl from './DisplayControl';
import { usePMEvents } from '../presentHelpers';
import { showAppContextMenu } from '../../others/AppContextMenu';

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
            },
        }],
        ...[{
            title: 'Add New Present',
            onClick() {
                const nextId = PresentManager.getAllInstances().length;
                PresentManager.getInstance(nextId);
                PresentManager.fireInstanceEvent();
            },
        },
        ]]);
}

export default function MiniPresentScreen() {
    usePMEvents(['instance']);
    const presentManagers = PresentManager.getAllInstances();
    if (presentManagers.length === 0) {
        const presentManager = PresentManager.getInstance(0);
        presentManager.isSelected = true;
    }
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
                        onContextMenu={(e) => {
                            openContextMenu(e, presentManager);
                        }}>
                        <div className='card-header' style={{
                            overflowX: 'auto',
                            overflowY: 'hidden',
                        }}>
                            <div className='d-flex justify-content-around'
                                style={{
                                    minWidth: '340px',
                                    maxWidth: '380px',
                                }}>
                                <ShowHidePresent
                                    presentManager={presentManager} />
                                <ClearControl
                                    presentManager={presentManager} />
                                <DisplayControl
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
