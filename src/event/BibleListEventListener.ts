import { useEffect } from "react";
import { BiblePresentType } from "../full-text-present/fullTextPresentHelper";
import EventHandler from "./EventHandler";

export enum BibleListEnum {
    ADD = 'add',
    PRESENT = 'present',
};
type ListenerType<T> = (data: T) => void | (() => void);
export type RegisteredEventType<T> = {
    type: BibleListEnum,
    listener: ListenerType<T>,
};

export default class BibleListEventListener extends EventHandler {
    add(data: { biblePresent: BiblePresentType, index?: number }) {
        this._addPropEvent(BibleListEnum.ADD, data);
    }
    present(biblePresent: BiblePresentType) {
        this._addPropEvent(BibleListEnum.PRESENT, biblePresent);
    }
    registerBibleListEventListener(type: BibleListEnum, listener: ListenerType<any>):
        RegisteredEventType<any> {
        this._addOnEventListener(type, listener);
        return {
            type,
            listener,
        };
    }
    unregisterBibleListEventListener({ type, listener }: RegisteredEventType<any>) {
        this._removeOnEventListener(type, listener);
    }
}

export const bibleListEventListener = new BibleListEventListener();

export function useBibleAdding(listener: ListenerType<{
    biblePresent: BiblePresentType, index?: number
}>) {
    useEffect(() => {
        const event = bibleListEventListener.registerBibleListEventListener(
            BibleListEnum.ADD, listener);
        return () => {
            bibleListEventListener.unregisterBibleListEventListener(event);
        };
    });
}
export function useBiblePresenting(listener: ListenerType<BiblePresentType>) {
    useEffect(() => {
        const event = bibleListEventListener.registerBibleListEventListener(
            BibleListEnum.PRESENT, listener);
        return () => {
            bibleListEventListener.unregisterBibleListEventListener(event);
        };
    });
}
