import './AppContextMenu.scss';

import { ReactElement, useState } from 'react';
import KeyboardEventListener from '../event/KeyboardEventListener';
import { getWindowDim } from '../helper/helpers';
import WindowEventListener from '../event/WindowEventListener';
import { useAppEffect } from '../helper/debuggerHelpers';

export type ContextMenuEventType = MouseEvent;
export type ContextMenuItemType = {
    title: string,
    onClick?: (event: MouseEvent, data?: any) => void,
    disabled?: boolean,
    otherChild?: ReactElement,
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

const setPositionMenu = (menu: HTMLElement,
    event: MouseEvent) => {
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
        if ((x + bc.width) > wd.width) {
            menu.style.right = `${wd.width - x}px`;
            maxWidth = x;
        } else {
            menu.style.left = `${x}px`;
            maxWidth = wd.width - x;
        }
        if ((y + bc.height) > wd.height) {
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
    event: MouseEvent,
    items: ContextMenuItemType[],
};
let setDataDelegator: ((data: PropsType | null) => void) | null = null;

export function showAppContextMenu(
    event: MouseEvent,
    items: ContextMenuItemType[]) {
    event.stopPropagation();
    return new Promise<void>((resolve) => {
        setDataDelegator?.({ event, items });
        const eventName = KeyboardEventListener.toEventMapperKey({
            key: 'Escape',
        });
        const escEvent = KeyboardEventListener.registerEventListener(
            [eventName], () => {
                setDataDelegator?.(null);
                KeyboardEventListener.unregisterEventListener(escEvent);
                resolve();
            });
    });
}

export default function AppContextMenu() {
    const [data, _setData] = useState<{
        event: MouseEvent,
        items: ContextMenuItemType[]
    } | null>(null);
    const setData = (newData: PropsType | null) => {
        WindowEventListener.fireEvent({
            widget: 'context-menu',
            state: newData === null ? 'close' : 'open',
        });
        _setData(newData);
    };
    useAppEffect(() => {
        setDataDelegator = (newData) => {
            setData(newData);
        };
        return () => {
            setDataDelegator = null;
        };
    });
    if (data === null) {
        return null;
    }
    return (
        <div id="context-menu-container"
            onClick={(event) => {
                event.stopPropagation();
                setDataDelegator?.(null);
            }}>
            <div ref={(self) => {
                if (self !== null) {
                    setPositionMenu(self, data.event);
                }
            }} className='app-context-menu'>
                {data.items.map((item) => {
                    return (
                        <ContextMenuItem key={item.title}
                            item={item} />
                    );
                })}
            </div>
        </div>
    );
}

function ContextMenuItem({ item }: {
    item: ContextMenuItemType,
}) {
    return (
        <div className={'app-context-menu-item'
            + ` ${item.disabled ? 'disabled' : ''}`}
            onClick={(event) => {
                if (item.disabled) {
                    return;
                }
                setTimeout(() => {
                    item.onClick?.(event as any);
                }, 0);
            }}>
            {item.title}
            {item.otherChild || null}
        </div>
    );
}
