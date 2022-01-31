import { useEffect } from "react";
import { isLinux, isMac, isWindows } from "../helper/electronHelper";
import EventHandler from "./EventHandler";
import { WindowEnum } from "./WindowEventListener";

export enum KeyEnum {
    ArrowUp = "ArrowUp",
    ArrowRight = "ArrowRight",
    ArrowDown = "ArrowDown",
    ArrowLeft = "ArrowLeft",
    Enter = "Enter",
    Tab = "Tab",
    Escape = "Escape",
    SpaceBar = " ",
}
export enum WindowsControlEnum {
    Ctrl = "Ctrl",
    Alt = "Alt",
    Shift = "Shift",
}
export enum LinuxControlEnum {
    Ctrl = "Ctrl",
    Alt = "Alt",
    Shift = "Shift",
}
export enum MacControlEnum {
    Ctrl = "Ctrl",
    Option = "Option",
    Shift = "Shift",
    Command = "Command",
}
export interface EventMapper {
    wControlKey?: WindowsControlEnum[];
    mControlKey?: MacControlEnum[];
    lControlKey?: LinuxControlEnum[];
    key: KeyEnum | string;
    layer?: WindowEnum;
}
export interface RegisteredEventMapper extends EventMapper {
    listener: ListenerType;
}
export type ListenerType = ((e: KeyboardEvent) => void) | (() => void);
export default class KeyboardEventListener extends EventHandler {
    layers: WindowEnum[] = [WindowEnum.Root];
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
        this._addPropEvent(k, event);
    }
    addControlKey(option: EventMapper, e: KeyboardEvent) {
        if (isWindows()) {
            option.wControlKey = [];
            e.ctrlKey && option.wControlKey.push(WindowsControlEnum.Ctrl);
            e.altKey && option.wControlKey.push(WindowsControlEnum.Alt);
            e.shiftKey && option.wControlKey.push(WindowsControlEnum.Shift);
        } else if (isMac()) {
            option.mControlKey = [];
            e.ctrlKey && option.mControlKey.push(MacControlEnum.Ctrl);
            e.altKey && option.mControlKey.push(MacControlEnum.Option);
            e.shiftKey && option.mControlKey.push(MacControlEnum.Shift);
        } else if (isLinux()) {
            option.lControlKey = [];
            e.ctrlKey && option.lControlKey.push(LinuxControlEnum.Ctrl);
            e.altKey && option.lControlKey.push(LinuxControlEnum.Alt);
            e.shiftKey && option.lControlKey.push(LinuxControlEnum.Shift);
        }
    }
    toControlKey(c: WindowsControlEnum[] | MacControlEnum[] | LinuxControlEnum[]) {
        const newC = c as string[];
        return newC.sort().join(' + ');
    }
    toShortcutKey(eventMapper: EventMapper) {
        let k = eventMapper.key;
        if (k.length === 1) {
            k = k.toUpperCase();
        }
        if (isWindows() && eventMapper.wControlKey && eventMapper.wControlKey.length) {
            k = this.toControlKey(eventMapper.wControlKey) + ' + ' + k;
        } else if (isMac() && eventMapper.mControlKey && eventMapper.mControlKey.length) {
            k = this.toControlKey(eventMapper.mControlKey) + ' + ' + k;
        } else if (isLinux() && eventMapper.lControlKey && eventMapper.lControlKey.length) {
            k = this.toControlKey(eventMapper.lControlKey) + ' + ' + k;
        }
        return k;
    }
    toEventMapperKey(eventMapper: EventMapper) {
        let k = this.toShortcutKey(eventMapper);
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
    addLayer(l: WindowEnum) {
        this.layers.push(l);
    }
    removeLayer(l: WindowEnum) {
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
