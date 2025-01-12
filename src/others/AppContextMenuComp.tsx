import './AppContextMenuComp.scss';

import { ReactElement, useState } from 'react';

import KeyboardEventListener, {
    EventMapper,
    toShortcutKey,
} from '../event/KeyboardEventListener';
import { getWindowDim } from '../helper/helpers';
import WindowEventListener from '../event/WindowEventListener';
import { useAppEffect } from '../helper/debuggerHelpers';

export type ContextMenuEventType = MouseEvent;
export type ContextMenuItemType = {
    id?: string;
    menuTitle: string;
    title?: string;
    onClick?: (event: MouseEvent, data?: any) => void | Promise<void>;
    disabled?: boolean;
    otherChild?: ReactElement;
};

export function createMouseEvent(clientX: number, clientY: number) {
    return new MouseEvent('click', {
        clientX,
        clientY,
        bubbles: true,
        cancelable: true,
        view: window,
    });
}

const setPositionMenu = (menu: HTMLElement, event: MouseEvent) => {
    if (menu !== null) {
        Object.assign(menu.style, {
            display: 'block',
            left: '',
            right: '',
            top: '',
            bottom: '',
        });
        event.preventDefault();
        event.stopPropagation();
        const x = event.clientX;
        const y = event.clientY;
        const bc = menu.getBoundingClientRect();
        const wd = getWindowDim();
        let maxWidth;
        let maxHeight;
        if (x > wd.width / 2 && x + bc.width > wd.width) {
            menu.style.right = `${wd.width - x}px`;
            maxWidth = x;
        } else {
            menu.style.left = `${x}px`;
            maxWidth = wd.width - x;
        }
        if (y > wd.height / 2 && y + bc.height > wd.height) {
            menu.style.bottom = `${wd.height - y}px`;
            maxHeight = y;
        } else {
            menu.style.top = `${y}px`;
            maxHeight = wd.height - y;
        }
        menu.style.maxWidth = `${maxWidth}px`;
        menu.style.maxHeight = `${maxHeight}px`;
    }
};

type PropsType = {
    event: MouseEvent;
    items: ContextMenuItemType[];
};
let setDataDelegator: ((data: PropsType | null) => void) | null = null;

export function showAppContextMenu(
    event: MouseEvent,
    items: ContextMenuItemType[],
) {
    event.stopPropagation();
    if (!items.length) {
        return Promise.resolve();
    }
    return new Promise<void>((resolve) => {
        setDataDelegator?.({ event, items });
        const eventName = KeyboardEventListener.toEventMapperKey({
            key: 'Escape',
        });
        const escEvent = KeyboardEventListener.registerEventListener(
            [eventName],
            () => {
                setDataDelegator?.(null);
                KeyboardEventListener.unregisterEventListener(escEvent);
                resolve();
            },
        );
    });
}

export default function AppContextMenuComp() {
    const [data, setData] = useState<{
        event: MouseEvent;
        items: ContextMenuItemType[];
    } | null>(null);
    const setData1 = (newData: PropsType | null) => {
        WindowEventListener.fireEvent({
            widget: 'context-menu',
            state: newData === null ? 'close' : 'open',
        });
        setData(newData);
    };
    useAppEffect(() => {
        const listener = (event: KeyboardEvent) => {
            if (
                event.shiftKey ||
                event.ctrlKey ||
                event.altKey ||
                event.metaKey
            ) {
                return;
            }
            const key = event.key.toLowerCase();
            if (!key) {
                return;
            }
            const container = document.getElementById(
                'app-context-menu-container',
            );
            if (container === null) {
                return;
            }
            const elements = Array.from(
                container.querySelectorAll('.app-context-menu-item'),
            );
            for (const element of elements) {
                if (element.textContent?.toLowerCase().startsWith(key)) {
                    element.scrollIntoView();
                    break;
                }
            }
        };
        document.addEventListener('keydown', listener);
        setDataDelegator = (newData) => {
            setData1(newData);
        };
        return () => {
            document.removeEventListener('keydown', listener);
            setDataDelegator = null;
        };
    }, []);
    if (data === null) {
        return null;
    }
    return (
        <div
            id="app-context-menu-container"
            onClick={(event) => {
                event.stopPropagation();
                setDataDelegator?.(null);
            }}
        >
            <div
                ref={(self) => {
                    if (self !== null) {
                        setPositionMenu(self, data.event);
                    }
                }}
                className="app-context-menu"
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

function ContextMenuItemComp({
    item,
}: Readonly<{
    item: ContextMenuItemType;
}>) {
    return (
        <div
            className={
                'app-context-menu-item d-flex w-100 overflow-hidden' +
                `${item.disabled ? ' disabled' : ''}`
            }
            title={item.title ?? item.menuTitle}
            onClick={(event) => {
                if (item.disabled) {
                    return;
                }
                setTimeout(() => {
                    item.onClick?.(event as any);
                }, 0);
            }}
        >
            <div className="app-ellipsis flex-fill">{item.menuTitle}</div>
            {item.otherChild || null}
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
