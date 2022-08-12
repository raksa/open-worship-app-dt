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
export type ListenerType = ((e: KeyboardEvent) => void) | (() => void);
export default class KeyboardEventListener extends EventHandler<string> {
    static eventNamePrefix: string = 'keyboard';
    static _layers: AppWidgetType[] = ['root'];
    static getLastLayer() {
        return getLastItem(this._layers);
    }
    static addLayer(l: AppWidgetType) {
        this._layers.push(l);
    }
    static removeLayer(l: AppWidgetType) {
        this._layers = this._layers.filter((l1) => l1 !== l);
    }
    static fireEvent(event: KeyboardEvent) {
        const option = {
            key: event.key,
        };
        this.addControlKey(option, event);
        const eventName = KeyboardEventListener.toEventMapperKey(option);
        this.addPropEvent(eventName, event);
    }
    static addControlKey(option: EventMapper, e: KeyboardEvent) {
        if (appProvider.systemUtils.isWindows) {
            option.wControlKey = [];
            e.ctrlKey && option.wControlKey.push('Ctrl');
            e.altKey && option.wControlKey.push('Alt');
            e.shiftKey && option.wControlKey.push('Shift');
        } else if (appProvider.systemUtils.isMac) {
            option.mControlKey = [];
            e.ctrlKey && option.mControlKey.push('Ctrl');
            e.altKey && option.mControlKey.push('Option');
            e.shiftKey && option.mControlKey.push('Shift');
        } else if (appProvider.systemUtils.isLinux) {
            option.lControlKey = [];
            e.ctrlKey && option.lControlKey.push('Ctrl');
            e.altKey && option.lControlKey.push('Alt');
            e.shiftKey && option.lControlKey.push('Shift');
        }
    }
    static toControlKey(controlType: WindowsControlType[] | MacControlType[] | LinuxControlType[]) {
        return controlType.sort().join(' + ');
    }
    static toShortcutKey(eventMapper: EventMapper) {
        let k = eventMapper.key;
        if (!k) {
            return '';
        }
        if (k.length === 1) {
            k = k.toUpperCase();
        }
        if (appProvider.systemUtils.isWindows &&
            eventMapper.wControlKey &&
            eventMapper.wControlKey.length) {
            k = `${this.toControlKey(eventMapper.wControlKey)} + ${k}`;
        } else if (appProvider.systemUtils.isMac &&
            eventMapper.mControlKey &&
            eventMapper.mControlKey.length) {
            k = `${this.toControlKey(eventMapper.mControlKey)} + ${k}`;
        } else if (appProvider.systemUtils.isLinux &&
            eventMapper.lControlKey &&
            eventMapper.lControlKey.length) {
            k = `${this.toControlKey(eventMapper.lControlKey)} + ${k}`;
        }
        return k;
    }
    static toEventMapperKey(eventMapper: EventMapper) {
        const k = this.toShortcutKey(eventMapper);
        return `${this.getLastLayer()}:${k}`;
    }
}

export function useKeyboardRegistering(eventMapper: EventMapper, listener: ListenerType) {
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
