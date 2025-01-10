import { useAppEffect } from '../helper/debuggerHelpers';
import Lyric from '../lyric-list/Lyric';
import Slide from '../slide-list/Slide';
import EventHandler, { ListenerType } from './EventHandler';

export type PreviewingType =
    | 'select-lyric'
    | 'update-lyric'
    | 'select-slide'
    | 'update-slide';

export default class PreviewingEventListener extends EventHandler<PreviewingType> {
    static readonly eventNamePrefix: string = 'previewing';
    selectLyric(lyric: Lyric | null) {
        this.addPropEvent('select-lyric', lyric);
    }
    updateLyric(lyric: Lyric) {
        this.addPropEvent('update-lyric', lyric);
    }
    showSlide(slide: Slide | null) {
        this.addPropEvent('select-slide', slide);
    }
    updateSlide(slide: Slide) {
        this.addPropEvent('update-slide', slide);
    }
}

export const previewingEventListener = new PreviewingEventListener();

export function useLyricSelecting(listener: ListenerType<Lyric | null>) {
    useAppEffect(() => {
        const event = previewingEventListener.registerEventListener(
            ['select-lyric'],
            listener,
        );
        return () => {
            previewingEventListener.unregisterEventListener(event);
        };
    }, [listener]);
}
export function useLyricUpdating(listener: ListenerType<Lyric>) {
    useAppEffect(() => {
        const event = previewingEventListener.registerEventListener(
            ['update-lyric'],
            listener,
        );
        return () => {
            previewingEventListener.unregisterEventListener(event);
        };
    }, [listener]);
}
export function useSlideSelecting(listener: ListenerType<Slide | null>) {
    useAppEffect(() => {
        const event = previewingEventListener.registerEventListener(
            ['select-slide'],
            listener,
        );
        return () => {
            previewingEventListener.unregisterEventListener(event);
        };
    }, [listener]);
}
export function useSlideUpdating(listener: ListenerType<Slide>) {
    useAppEffect(() => {
        const event = previewingEventListener.registerEventListener(
            ['update-slide'],
            listener,
        );
        return () => {
            previewingEventListener.unregisterEventListener(event);
        };
    }, [listener]);
}
