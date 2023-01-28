import { useEffect } from 'react';
import { getLastItem } from '../helper/helpers';
import appProvider from '../server/appProvider';
import EventHandler from './EventHandler';
import { AppWidgetType } from './WindowEventListener';

export type KeyboardType = 'ArrowUp' | 'ArrowRight' | 'ArrowDown'
    | 'ArrowLeft' | 'Enter' | 'Tab' | 'Escape' | ' ';
export const allArrows: KeyboardType[] = [
    'ArrowLeft', 'ArrowRight',
    'ArrowUp', 'ArrowDown',
];
export type WindowsControlType = 'Ctrl' | 'Alt' | 'Shift';
export type LinuxControlType = 'Ctrl' | 'Alt' | 'Shift';
export type MacControlType = 'Ctrl' | 'Option' | 'Shift' | 'Command';

export interface EventMapper {
    wControlKey?: WindowsControlType[];
    mControlKey?: MacControlType[];
    lControlKey?: LinuxControlType[];
    key: KeyboardType | string;
}
export interface RegisteredEventMapper extends EventMapper {
    listener: ListenerType;
}
export type ListenerType = ((event: KeyboardEvent) => void) | (() => void);

export function toShortcutKey(eventMapper: EventMapper) {
    return KeyboardEventListener.toShortcutKey(eventMapper);
}

export default class KeyboardEventListener extends EventHandler<string> {
    static eventNamePrefix: string = 'keyboard';
    static _layers: AppWidgetType[] = ['root'];
    static getLastLayer() {
        return getLastItem(this._layers);
    }
    static addLayer(layer: AppWidgetType) {
        this._layers.push(layer);
    }
    static removeLayer(layer: AppWidgetType) {
        this._layers = this._layers.filter((l1) => l1 !== layer);
    }
    static fireEvent(event: KeyboardEvent) {
        const option = {
            key: event.key,
        };
        this.addControlKey(option, event);
        const eventName = KeyboardEventListener.toEventMapperKey(option);
        this.addPropEvent(eventName, event);
    }
    static addControlKey(option: EventMapper, event: KeyboardEvent) {
        if (appProvider.systemUtils.isWindows) {
            option.wControlKey = [];
            event.ctrlKey && option.wControlKey.push('Ctrl');
            event.altKey && option.wControlKey.push('Alt');
            event.shiftKey && option.wControlKey.push('Shift');
        } else if (appProvider.systemUtils.isMac) {
            option.mControlKey = [];
            event.ctrlKey && option.mControlKey.push('Ctrl');
            event.altKey && option.mControlKey.push('Option');
            event.shiftKey && option.mControlKey.push('Shift');
        } else if (appProvider.systemUtils.isLinux) {
            option.lControlKey = [];
            event.ctrlKey && option.lControlKey.push('Ctrl');
            event.altKey && option.lControlKey.push('Alt');
            event.shiftKey && option.lControlKey.push('Shift');
        }
    }
    static toControlKey(controlType: WindowsControlType[] |
        MacControlType[] | LinuxControlType[]) {
        return controlType.sort().join(' + ');
    }
    static toShortcutKey(eventMapper: EventMapper) {
        let key = eventMapper.key;
        if (!key) {
            return '';
        }
        if (key.length === 1) {
            key = key.toUpperCase();
        }
        if (appProvider.systemUtils.isWindows &&
            eventMapper.wControlKey &&
            eventMapper.wControlKey.length) {
            key = `${this.toControlKey(eventMapper.wControlKey)} + ${key}`;
        } else if (appProvider.systemUtils.isMac &&
            eventMapper.mControlKey &&
            eventMapper.mControlKey.length) {
            key = `${this.toControlKey(eventMapper.mControlKey)} + ${key}`;
        } else if (appProvider.systemUtils.isLinux &&
            eventMapper.lControlKey &&
            eventMapper.lControlKey.length) {
            key = `${this.toControlKey(eventMapper.lControlKey)} + ${key}`;
        }
        return key;
    }
    static toEventMapperKey(eventMapper: EventMapper) {
        const key = toShortcutKey(eventMapper);
        return `${this.getLastLayer()}:${key}`;
    }
}

export function useKeyboardRegistering(
    eventMapper: EventMapper, listener: ListenerType) {
    useEffect(() => {
        const eventName = KeyboardEventListener.toEventMapperKey(eventMapper);
        const registeredEvent = KeyboardEventListener.registerEventListener(
            [eventName], listener);
        return () => {
            KeyboardEventListener.unregisterEventListener(registeredEvent);
        };
    });
}


document.onkeydown = function (event) {
    KeyboardEventListener.fireEvent(event);
};
