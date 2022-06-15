import './AppContextMenu.scss';

import { keyboardEventListener, KeyEnum } from '../event/KeyboardEventListener';
import { getWindowDim } from '../helper/helpers';
import { ReactElement, useEffect, useState } from 'react';

export type ContextMenuEventType = React.MouseEvent<HTMLDivElement, MouseEvent>;
export type ContextMenuItemType = {
    title: string,
    onClick?: (e: ContextMenuEventType, data?: any) => void,
    disabled?: boolean,
    otherChild?: ReactElement,
};
const setPositionMenu = (menu: HTMLElement, event: React.MouseEvent<HTMLElement, MouseEvent>) => {
    if (menu !== null) {
        menu.style.display = 'block';
        menu.style.left = '';
        menu.style.right = '';
        menu.style.top = '';
        menu.style.bottom = '';
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
    event: React.MouseEvent<HTMLElement, MouseEvent>,
    items: ContextMenuItemType[],
};
let setDataDelegator: ((data: PropsType | null) => void) | null = null;

export function showAppContextMenu(
    event: React.MouseEvent<HTMLElement, MouseEvent>,
    items: ContextMenuItemType[]) {
    event.stopPropagation();
    setDataDelegator && setDataDelegator({ event, items });
    const listener = (e: MouseEvent) => {
        e.stopPropagation();
        setDataDelegator && setDataDelegator(null);
        document.body.removeEventListener('click', listener);
    };
    document.body.addEventListener('click', listener);
    const escEvent = keyboardEventListener.registerShortcutEventListener({
        key: KeyEnum.Escape,
    }, () => {
        setDataDelegator && setDataDelegator(null);
        keyboardEventListener.unregisterShortcutEventListener(escEvent);
    });
}

export default function AppContextMenu() {
    const [data, setData] = useState<{
        event: React.MouseEvent<HTMLElement, MouseEvent>,
        items: ContextMenuItemType[]
    } | null>(null);
    useEffect(() => {
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
        <div ref={(self) => {
            if (self !== null) {
                setPositionMenu(self, data.event);
            }
        }} className="app-context-menu">
            {data.items.map((item, i) => {
                return (
                    <div key={`${i}`} className={`app-context-menu-item ${item.disabled ? 'disabled' : ''}`}
                        onClick={(e) => {
                            if (item.disabled) {
                                return;
                            }
                            item.onClick && item.onClick(e);
                        }}>
                        {item.title}
                        {item.otherChild || null}
                    </div>
                );
            })}
        </div>
    );
}
