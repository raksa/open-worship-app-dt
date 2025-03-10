import { DependencyList } from 'react';
import { useAppEffect } from '../helper/debuggerHelpers';
import { getLastItem } from '../helper/helpers';
import appProvider from '../server/appProvider';
import EventHandler from './EventHandler';
import { AppWidgetType } from './WindowEventListener';

export type KeyboardType =
    | 'ArrowUp'
    | 'ArrowRight'
    | 'ArrowDown'
    | 'ArrowLeft'
    | 'Enter'
    | 'Tab'
    | 'Escape'
    | ' ';
export const allArrows: KeyboardType[] = [
    'ArrowLeft',
    'ArrowRight',
    'ArrowUp',
    'ArrowDown',
];
export type WindowsControlType = 'Ctrl' | 'Alt' | 'Shift';
export type LinuxControlType = 'Ctrl' | 'Alt' | 'Shift';
export type MacControlType = 'Ctrl' | 'Option' | 'Shift' | 'Meta';
export type AllControlType = 'Ctrl' | 'Shift';

export interface EventMapper {
    wControlKey?: WindowsControlType[];
    mControlKey?: MacControlType[];
    lControlKey?: LinuxControlType[];
    allControlKey?: AllControlType[];
    key: string;
}
export interface RegisteredEventMapper extends EventMapper {
    listener: ListenerType;
}
export type ListenerType = ((event: KeyboardEvent) => void) | (() => void);

export function toShortcutKey(eventMapper: EventMapper) {
    return KeyboardEventListener.toShortcutKey(eventMapper);
}

export default class KeyboardEventListener extends EventHandler<string> {
    static readonly eventNamePrefix: string = 'keyboard';
    static readonly _layers: AppWidgetType[] = ['root'];
    static getLastLayer() {
        return getLastItem(this._layers);
    }
    static addLayer(layer: AppWidgetType) {
        this._layers.push(layer);
    }
    static removeLayer(layer: AppWidgetType) {
        this._layers.splice(this._layers.indexOf(layer), 1);
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
            event.metaKey && option.mControlKey.push('Meta');
        } else if (appProvider.systemUtils.isLinux) {
            option.lControlKey = [];
            event.ctrlKey && option.lControlKey.push('Ctrl');
            event.altKey && option.lControlKey.push('Alt');
            event.shiftKey && option.lControlKey.push('Shift');
        }
    }
    static toShortcutKey(eventMapper: EventMapper) {
        let key = eventMapper.key;
        if (!key) {
            return '';
        }
        if (key.length === 1) {
            key = key.toUpperCase();
        }
        const { wControlKey, mControlKey, lControlKey, allControlKey } =
            eventMapper;
        const allControls: string[] = allControlKey ?? [];
        if (appProvider.systemUtils.isWindows) {
            allControls.push(...(wControlKey ?? []));
        } else if (appProvider.systemUtils.isMac) {
            allControls.push(...(mControlKey ?? []));
        } else if (appProvider.systemUtils.isLinux) {
            allControls.push(...(lControlKey ?? []));
        }
        if (allControls.length > 0) {
            const sorted = [...allControls].sort((a, b) => {
                return a.localeCompare(b);
            });
            key = `${sorted.join(' + ')} + ${key}`;
        }
        return key;
    }
    static toEventMapperKey(eventMapper: EventMapper) {
        const key = toShortcutKey(eventMapper);
        return `${this.getLastLayer()}>${key}`;
    }
}

export function useKeyboardRegistering(
    eventMappers: EventMapper[],
    listener: ListenerType,
    deps: DependencyList,
) {
    useAppEffect(() => {
        const eventNames = eventMappers.map((eventMapper) => {
            return KeyboardEventListener.toEventMapperKey(eventMapper);
        });
        const registeredEvents = KeyboardEventListener.registerEventListener(
            eventNames,
            listener,
        );
        return () => {
            KeyboardEventListener.unregisterEventListener(registeredEvents);
        };
    }, [listener, ...deps]);
}

document.onkeydown = function (event) {
    if (['Meta', 'Alt', 'Control', 'Shift'].includes(event.key)) {
        return;
    }
    KeyboardEventListener.fireEvent(event);
};
