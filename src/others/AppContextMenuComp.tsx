import './AppContextMenuComp.scss';

import { ReactElement, useState } from 'react';

import KeyboardEventListener, {
    EventMapper,
    toShortcutKey,
    useKeyboardRegistering,
} from '../event/KeyboardEventListener';
import { getWindowDim } from '../helper/helpers';
import WindowEventListener from '../event/WindowEventListener';
import { useAppEffect } from '../helper/debuggerHelpers';
import { OptionalPromise } from './otherHelpers';

export type ContextMenuEventType = MouseEvent;
export type ContextMenuItemType = {
    id?: string;
    menuTitle: string;
    title?: string;
    onClick?: (event: MouseEvent, data?: any) => OptionalPromise<void>;
    disabled?: boolean;
    otherChild?: ReactElement;
};
type OptionsType = {
    maxHeigh?: number;
    coord?: { x: number; y: number };
    style?: React.CSSProperties;
    noKeystroke?: boolean;
};

type PropsType = {
    event: MouseEvent;
    items: ContextMenuItemType[];
    options?: OptionsType;
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

const setPositionMenu = (
    menu: HTMLElement,
    event: MouseEvent,
    options?: OptionsType,
) => {
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
        const x = options?.coord?.x ?? event.clientX;
        const y = options?.coord?.y ?? event.clientY;
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
        menu.style.maxWidth = `${Math.min(maxWidth, 210)}px`;
        menu.style.maxHeight = `${maxHeight}px`;
        if (options?.maxHeigh) {
            menu.style.maxHeight = `${options.maxHeigh}px`;
        }
        menu.scrollTop = 0;
        if (options?.style) {
            Object.assign(menu.style, options.style);
        }
    }
};

let setDataDelegator: ((data: PropsType | null) => void) | null = null;

export function showAppContextMenu(
    event: MouseEvent,
    items: ContextMenuItemType[],
    options?: OptionsType,
) {
    event.stopPropagation();
    if (!items.length) {
        return {
            promiseDone: Promise.resolve(),
            closeMenu: () => {},
        };
    }
    const closeMenu = () => {
        setDataDelegator?.(null);
    };
    const promise = new Promise<void>((resolve) => {
        setDataDelegator?.({ event, items, options });
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

const APP_CONTEXT_MENU_ID = 'app-context-menu-container';
const APP_CONTEXT_MENU_CLASS = 'app-context-menu';
const APP_CONTEXT_MENU_ITEM_CLASS = 'app-context-menu-item';
const highlightClass = 'app-border-whiter-round';

function getMenuContainer() {
    const tableDiv = document.querySelector(
        `#${APP_CONTEXT_MENU_ID} .${APP_CONTEXT_MENU_CLASS}`,
    );
    return tableDiv;
}

function getDomItems() {
    const allChildren = Array.from<HTMLDivElement>(
        document.querySelectorAll(
            `#${APP_CONTEXT_MENU_ID} .${APP_CONTEXT_MENU_ITEM_CLASS}`,
        ),
    );
    const index =
        allChildren.findIndex((item) => {
            return item.classList.contains(highlightClass);
        }) ?? -1;
    return { index, allChildren, selectedItem: allChildren[index] ?? null };
}
function appKeyUpDown(isUp: boolean) {
    const domData = getDomItems();
    const { allChildren } = domData;
    let { index } = domData;
    index += (isUp ? -1 : 1) + allChildren.length;
    index %= allChildren.length;
    allChildren.forEach((item) => {
        item.classList.remove(highlightClass);
    });
    allChildren[index].classList.add(highlightClass);
    setTimeout(() => {
        allChildren[index].scrollIntoView({
            block: 'nearest',
        });
        const tableDiv = getMenuContainer();
        (tableDiv as any)?.focus();
    }, 100);
}
function checkKeyUpDown(event: any) {
    const stopEvent = () => {
        event.preventDefault();
        event.stopPropagation();
    };
    if (['Enter'].includes(event.key)) {
        const menuContainer = getMenuContainer();
        if (menuContainer !== document.activeElement) {
            return;
        }
        const { selectedItem } = getDomItems();
        if (selectedItem !== null) {
            stopEvent();
            selectedItem.click();
        }
        return;
    }
    stopEvent();
    const isUp = event.key === 'ArrowUp';
    appKeyUpDown(isUp);
}

export const escapeChars = [
    'enter',
    'escape',
    'arrowup',
    'arrowdown',
    'arrowleft',
    'arrowright',
    'backspace',
    'tab',
    'insert',
    'delete',
    'home',
    'end',
    'pageup',
    'pagedown',
    'f1',
    'f2',
    'f3',
    'f4',
    'f5',
    'f6',
    'f7',
    'f8',
    'f9',
    'f10',
    'f11',
    'f12',
    'printscreen',
    'scrolllock',
    'pausebreak',
    'numlock',
    'capslock',
    'contextmenu',
];
function listener(event: KeyboardEvent) {
    if (event.shiftKey || event.ctrlKey || event.altKey || event.metaKey) {
        return;
    }
    const key = event.key.toLowerCase();
    if (!key || escapeChars.includes(key)) {
        return;
    }
    const { allChildren } = getDomItems();
    for (const element of allChildren) {
        if (element.textContent?.toLowerCase().startsWith(key)) {
            element.scrollIntoView();
            break;
        }
    }
}

function useAppContextMenuData() {
    const [data, setData] = useState<PropsType | null>(null);
    const setData1 = (newData: PropsType | null) => {
        WindowEventListener.fireEvent({
            widget: 'context-menu',
            state: newData === null ? 'close' : 'open',
        });
        setData(newData);
    };
    useAppEffect(() => {
        setDataDelegator = (newData) => {
            setData1(newData);
        };
        if (data === null) {
            return;
        }
        const shouldKeystroke = !data.options?.noKeystroke;
        if (shouldKeystroke) {
            document.addEventListener('keydown', listener);
        }
        return () => {
            if (shouldKeystroke) {
                document.removeEventListener('keydown', listener);
            }
            setDataDelegator = null;
        };
    }, [data]);
    useKeyboardRegistering(
        [
            { key: 'ArrowUp' },
            { key: 'ArrowDown' },
            { key: 'Tab' },
            { key: 'Enter' },
        ],
        (event) => {
            if (data === null) {
                return;
            }
            checkKeyUpDown(event);
        },
        [data],
    );
    return data;
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
                setDataDelegator?.(null);
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
