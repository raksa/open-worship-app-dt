import BibleItem from '../bible-list/BibleItem';
import {
    setIsPreviewingBible, setIsPreviewingLyric,
} from '../full-text-present/FullTextPreviewer';
import { useAppEffect } from '../helper/debuggerHelpers';
import Lyric from '../lyric-list/Lyric';
import Slide from '../slide-list/Slide';
import EventHandler, { ListenerType } from './EventHandler';

export type PreviewingType =
    'select-bible-item'
    | 'select-lyric'
    | 'update-lyric'
    | 'select-slide'
    | 'update-slide';

export default class PreviewingEventListener extends EventHandler<PreviewingType> {
    static eventNamePrefix: string = 'previewing';
    selectBibleItem(bibleItem: BibleItem | null) {
        if (bibleItem !== null) {
            setIsPreviewingBible();
        }
        this.addPropEvent('select-bible-item', bibleItem);
    }
    selectLyric(lyric: Lyric | null) {
        if (lyric !== null) {
            setIsPreviewingLyric();
        }
        this.addPropEvent('select-lyric', lyric);
    }
    updateLyric(lyric: Lyric) {
        this.addPropEvent('update-lyric', lyric);
    }
    presentSlide(slide: Slide | null) {
        this.addPropEvent('select-slide', slide);
    }
    updateSlide(slide: Slide) {
        this.addPropEvent('update-slide', slide);
    }
}

export const previewingEventListener = new PreviewingEventListener();

export function useBibleItemSelecting(
    listener: ListenerType<BibleItem | null>) {
    useAppEffect(() => {
        const event = previewingEventListener.registerEventListener(
            ['select-bible-item'], listener);
        return () => {
            previewingEventListener.unregisterEventListener(event);
        };
    });
}
export function useLyricSelecting(listener: ListenerType<Lyric | null>) {
    useAppEffect(() => {
        const event = previewingEventListener.registerEventListener(
            ['select-lyric'], listener);
        return () => {
            previewingEventListener.unregisterEventListener(event);
        };
    });
}
export function useLyricUpdating(listener: ListenerType<Lyric>) {
    useAppEffect(() => {
        const event = previewingEventListener.registerEventListener(
            ['update-lyric'], listener);
        return () => {
            previewingEventListener.unregisterEventListener(event);
        };
    });
}
export function useSlideSelecting(listener: ListenerType<Slide | null>) {
    useAppEffect(() => {
        const event = previewingEventListener.registerEventListener(
            ['select-slide'], listener);
        return () => {
            previewingEventListener.unregisterEventListener(event);
        };
    });
}
export function useSlideUpdating(listener: ListenerType<Slide>) {
    useAppEffect(() => {
        const event = previewingEventListener.registerEventListener(
            ['update-slide'], listener);
        return () => {
            previewingEventListener.unregisterEventListener(event);
        };
    });
}
export function useFullTextOpening(listener: ListenerType<void>) {
    useAppEffect(() => {
        const eventLyric = previewingEventListener.registerEventListener(
            ['select-lyric'], listener);
        const eventBible = previewingEventListener.registerEventListener(
            ['select-bible-item'], listener);
        return () => {
            previewingEventListener.unregisterEventListener(eventLyric);
            previewingEventListener.unregisterEventListener(eventBible);
        };
    });
}
