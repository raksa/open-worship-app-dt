import { usePresentManager } from '../PresentManager';
import { showAppContextMenu } from '../../others/AppContextMenu';
import { usePMEvents } from '../presentEventHelpers';
import { getAllDisplays } from '../presentHelpers';

export default function DisplayControl() {
    const presentManager = usePresentManager();
    usePMEvents(['display-id'], presentManager);
    const displayId = presentManager.displayId;
    return (
        <div className={
            'display-control d-flex justify-content-center '
            + 'align-items-center'
        }
            title={'Present:' + presentManager.name + ', id:' +
                presentManager.presentId +
                ', display id:' + displayId}>
            <button className='btn btn-sm btn-outline-secondary'
                onClick={(event) => {
                    const {
                        primaryDisplay,
                        displays,
                    } = getAllDisplays();
                    showAppContextMenu(event as any, displays.map((display) => {
                        const bounds = display.bounds;
                        const isPrimary = display.id === primaryDisplay.id;
                        const isSelected = display.id === displayId;
                        const title = (isSelected ? '*' : '') +
                            `${display.id}: ${bounds.width}x${bounds.height}` +
                            (isPrimary ? ' (primary)' : '');
                        return {
                            title,
                            onClick: () => {
                                presentManager.displayId = display.id;
                            },
                        };
                    }));
                }}>
                <i className='bi bi-display' />
                {presentManager.name}({presentManager.presentId}):{displayId}
            </button>
        </div >
    );
}
