import './MiniPresentScreen.scss';

import './CustomHTMLPresentPreviewer';
import ShowHidePresent from './ShowHidePresent';
import ClearControl from './ClearControl';
import PresentManager from '../PresentManager';
import DisplayControl from './DisplayControl';
import { usePMEvents } from '../presentHelpers';
import { showAppContextMenu } from '../../others/AppContextMenu';

export default function MiniPresentScreen() {
    usePMEvents(['select']);
    const presentIds = [0];
    const presentManagers = presentIds.map((id) => {
        return PresentManager.getInstance(id);
    });
    console.log('select');

    return (
        <>
            {presentManagers.map((presentManager, i) => {
                const selectedCN = presentManager.isSelected ? 'highlight-selected' : '';
                return (
                    <div key={i}
                        onContextMenu={(e) => {
                            showAppContextMenu(e, [
                                {
                                    title: 'Solo',
                                    onClick() {
                                        PresentManager.getSelectedInstances().forEach((presentManager1) => {
                                            presentManager1.isSelected = false;
                                        });
                                        presentManager.isSelected = true;
                                    },
                                }, {
                                    title: presentManager.isSelected ? 'Unselect' : 'Select',
                                    onClick() {
                                        presentManager.isSelected = !presentManager.isSelected;
                                    },
                                },
                            ]);
                        }}
                        className={selectedCN}>
                        <div className='mini-present-screen card w-100 h-100'>
                            <div className='card-header' style={{
                                overflowX: 'auto',
                                overflowY: 'hidden',
                            }}>
                                <div className='d-flex justify-content-around'
                                    style={{
                                        minWidth: '280px',
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
                            <mini-present-previewer
                                presentId={presentManager.presentId} />
                        </div>
                    </div>
                );
            })}
        </>
    );
}
