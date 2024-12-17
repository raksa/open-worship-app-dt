import { useScreenManagerContext } from '../ScreenManager';
import {
    ContextMenuItemType, showAppContextMenu,
} from '../../others/AppContextMenu';
import { useScreenManagerEvents } from '../screenEventHelpers';
import { getAllDisplays } from '../screenHelpers';

export default function DisplayControl() {

    const screenManager = useScreenManagerContext();
    useScreenManagerEvents(['display-id'], screenManager);
    const displayId = screenManager.displayId;

    return (
        <div className={
            'display-control d-flex justify-content-center ' +
            'align-items-center'
        }
            title={
                `Screen:${screenManager.name}, id:${screenManager.screenId}` +
                `, display id:${displayId}`
            }>
            <button className='btn btn-sm btn-outline-secondary'
                onClick={(event) => {
                    const {
                        primaryDisplay, displays,
                    } = getAllDisplays();
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
                    showAppContextMenu(event as any, contextMenuItems);
                }}>
                <i className='bi bi-display' />
                {screenManager.name}({screenManager.screenId}):{displayId}
            </button>
        </div >
    );
}
