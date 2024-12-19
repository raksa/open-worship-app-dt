import { useScreenManagerContext } from '../ScreenManager';
import {
    ContextMenuItemType, showAppContextMenu,
} from '../../others/AppContextMenu';
import { useScreenManagerEvents } from '../screenEventHelpers';
import { getAllDisplays } from '../screenHelpers';

export default function DisplayControl() {

    const screenManager = useScreenManagerContext();
    useScreenManagerEvents(['display-id'], screenManager);
    const handleDisplayChoosing = (event: any) => {
        const { primaryDisplay, displays } = getAllDisplays();
        const contextMenuItems = (
            displays.map((display) => {
                const label = (display as any).label ?? 'Unknown';
                const bounds = display.bounds;
                const isPrimary = display.id === primaryDisplay.id;
                const isSelected = display.id === displayId;
                const menuTitle = (
                    (isSelected ? '*' : '') +
                    `${label}(${display.id}): ` +
                    `${bounds.width}x${bounds.height}` +
                    (isPrimary ? ' (primary)' : '')
                );
                return {
                    menuTitle,
                    onClick: () => {
                        screenManager.displayId = display.id;
                    },
                } as ContextMenuItemType;
            })
        );
        showAppContextMenu(event, contextMenuItems);
    };
    const { displayId } = screenManager;
    const { displays } = getAllDisplays();
    const currentDisplay = displays.find((display) => {
        return display.id === displayId;
    });
    const currentDisplayLabel = (
        currentDisplay ? (currentDisplay as any).label : 'Unknown'
    );
    return (
        <div className={
            'display-control d-flex justify-content-center ' +
            'align-items-center'
        }
            title={
                `Display:${currentDisplayLabel}, ` +
                `screen id:${screenManager.screenId}` +
                `, display id:${displayId}`
            }>
            <button className='btn btn-sm btn-outline-secondary app-ellipsis'
                onClick={handleDisplayChoosing}
                style={{ maxWidth: '80px' }}>
                <i className='bi bi-display' />
                {currentDisplayLabel}({screenManager.screenId}):{displayId}
            </button>
        </div >
    );
}
