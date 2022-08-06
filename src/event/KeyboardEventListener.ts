import { useEffect } from 'react';
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
    layer?: AppWidgetType;
}
export interface RegisteredEventMapper extends EventMapper {
    listener: ListenerType;
}
export type ListenerType = ((e: KeyboardEvent) => void) | (() => void);
export default class KeyboardEventListener extends EventHandler<string> {
    layers: AppWidgetType[] = ['root'];
    get lastLayer() {
        return this.layers[this.layers.length - 1];
    }
    fireEvent(event: KeyboardEvent) {
        const option = {
            key: event.key,
            layer: this.layers[this.layers.length - 1],
        };
        this.addControlKey(option, event);
        const k = this.toEventMapperKey(option);
        this.addPropEvent(k, event);
    }
    addControlKey(option: EventMapper, e: KeyboardEvent) {
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
    toControlKey(controlType: WindowsControlType[] | MacControlType[] | LinuxControlType[]) {
        return controlType.sort().join(' + ');
    }
    toShortcutKey(eventMapper: EventMapper) {
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
    toEventMapperKey(eventMapper: EventMapper) {
        const k = this.toShortcutKey(eventMapper);
        return eventMapper.layer ? `${eventMapper.layer}:${k}` : k;
    }
    registerShortcutEventListener(eventMapper: EventMapper,
        listener: ListenerType): RegisteredEventMapper {
        eventMapper.layer = eventMapper.layer || this.lastLayer;
        const key = this.toEventMapperKey(eventMapper);
        this._addOnEventListener(key, listener);
        return {
            ...eventMapper,
            listener,
        };
    }
    unregisterShortcutEventListener(eventMapper: RegisteredEventMapper) {
        eventMapper.layer = eventMapper.layer || this.lastLayer;
        const key = this.toEventMapperKey(eventMapper);
        this._removeOnEventListener(key, eventMapper.listener);
        return eventMapper;
    }
    addLayer(l: AppWidgetType) {
        this.layers.push(l);
    }
    removeLayer(l: AppWidgetType) {
        this.layers = this.layers.filter((l1) => l1 !== l);
    }
}

export const keyboardEventListener = new KeyboardEventListener();

export function useKeyboardRegistering(eventMapper: EventMapper, listener: ListenerType) {
    useEffect(() => {
        const event = keyboardEventListener.registerShortcutEventListener(
            eventMapper, listener);
        return () => {
            keyboardEventListener.unregisterShortcutEventListener(event);
        };
    });
}


document.onkeydown = function (e) {
    keyboardEventListener.fireEvent(e);
};
