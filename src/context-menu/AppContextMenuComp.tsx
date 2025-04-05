import './AppContextMenuComp.scss';

import KeyboardEventListener, {
    EventMapper,
    toShortcutKey,
} from '../event/KeyboardEventListener';
import {
    ContextMenuItemType,
    OptionsType,
    setPositionMenu,
    contextControl,
    useAppContextMenuData,
    APP_CONTEXT_MENU_ITEM_CLASS,
    APP_CONTEXT_MENU_ID,
} from './appContextMenuHelpers';

export type AppContextMenuControlType = {
    promiseDone: Promise<void>;
    closeMenu: () => void;
};

export function showAppContextMenu(
    event: MouseEvent,
    items: ContextMenuItemType[],
    options?: OptionsType,
): AppContextMenuControlType {
    event.stopPropagation();
    if (!items.length) {
        return {
            promiseDone: Promise.resolve(),
            closeMenu: () => {},
        };
    }
    const closeMenu = () => {
        contextControl.setDataDelegator?.(null);
    };
    const promise = new Promise<void>((resolve) => {
        contextControl.setDataDelegator?.({ event, items, options });
        const eventName = KeyboardEventListener.toEventMapperKey({
            key: 'Escape',
        });
        const escEvent = KeyboardEventListener.registerEventListener(
            [eventName],
            () => {
                closeMenu();
                KeyboardEventListener.unregisterEventListener(escEvent);
                resolve();
            },
        );
    });
    return { promiseDone: promise, closeMenu };
}

function ContextMenuItemComp({
    item,
}: Readonly<{
    item: ContextMenuItemType;
}>) {
    return (
        <div
            className={
                `${APP_CONTEXT_MENU_ITEM_CLASS} d-flex w-100 overflow-hidden` +
                `${item.disabled ? ' disabled' : ''}`
            }
            title={item.title ?? item.menuTitle}
            onClick={(event) => {
                if (item.disabled) {
                    return;
                }
                setTimeout(() => {
                    item.onSelect?.(event as any);
                }, 0);
            }}
        >
            <div className="app-ellipsis flex-fill">{item.menuTitle}</div>
            {item.otherChild || null}
        </div>
    );
}

export default function AppContextMenuComp() {
    const data = useAppContextMenuData();
    if (data === null) {
        return null;
    }
    return (
        <div
            id={APP_CONTEXT_MENU_ID}
            onClick={(event) => {
                event.stopPropagation();
                contextControl.setDataDelegator?.(null);
            }}
        >
            <div
                tabIndex={0}
                ref={(div) => {
                    if (div === null) {
                        return;
                    }
                    setPositionMenu(div, data.event, data.options);
                }}
                className="app-context-menu app-focusable"
            >
                {data.items.map((item) => {
                    return (
                        <ContextMenuItemComp key={item.menuTitle} item={item} />
                    );
                })}
            </div>
        </div>
    );
}

export function genContextMenuItemShortcutKey(eventMapper: EventMapper) {
    return (
        <div className="align-self-end">
            <span className="text-muted badge text-bg-primary">
                {toShortcutKey(eventMapper)}
            </span>
        </div>
    );
}
