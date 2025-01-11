import { useAppEffect } from '../helper/debuggerHelpers';
import Lyric from '../lyric-list/Lyric';
import AppDocument from '../slide-list/AppDocument';
import EventHandler, { ListenerType } from './EventHandler';
import { VaryAppDocumentType } from '../slide-list/appDocumentHelpers';

export type PreviewingType =
    | 'select-lyric'
    | 'update-lyric'
    | 'select-app-document'
    | 'update-app-document';

class PreviewingEventListener extends EventHandler<PreviewingType> {
    static readonly eventNamePrefix: string = 'previewing';
    selectLyric(lyric: Lyric | null) {
        this.addPropEvent('select-lyric', lyric);
    }
    updateLyric(lyric: Lyric) {
        this.addPropEvent('update-lyric', lyric);
    }
    showVaryAppDocument(varyAppDocument: VaryAppDocumentType | null) {
        this.addPropEvent('select-app-document', varyAppDocument);
    }
    updateVaryAppDocument(varyAppDocument: VaryAppDocumentType) {
        this.addPropEvent('update-app-document', varyAppDocument);
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

export function useVaryAppDocumentSelecting(
    listener: ListenerType<AppDocument | null>,
) {
    useAppEffect(() => {
        const event = previewingEventListener.registerEventListener(
            ['select-app-document'],
            listener,
        );
        return () => {
            previewingEventListener.unregisterEventListener(event);
        };
    }, [listener]);
}

export function useVaryAppDocumentUpdating(
    listener: ListenerType<AppDocument>,
) {
    useAppEffect(() => {
        const event = previewingEventListener.registerEventListener(
            ['update-app-document'],
            listener,
        );
        return () => {
            previewingEventListener.unregisterEventListener(event);
        };
    }, [listener]);
}

export default PreviewingEventListener;
