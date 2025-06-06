import { useState } from 'react';

import {
    allArrows,
    KeyboardType,
    useKeyboardRegistering,
} from '../../event/KeyboardEventListener';
import { useAppDocumentItemThumbnailSizeScale } from '../../event/VaryAppDocumentEventListener';
import SlideGhostComp from './SlideGhostComp';
import {
    handleArrowing,
    showVaryAppDocumentItemInViewport,
} from './varyAppDocumentHelpers';
import VaryAppDocumentItemRenderWrapperComp from './VaryAppDocumentItemRenderWrapperComp';
import {
    useAppEffect,
    useAppEffectAsync,
    useAppStateAsync,
} from '../../helper/debuggerHelpers';
import { useFileSourceEvents } from '../../helper/dirSourceHelpers';
import LoadingComp from '../../others/LoadingComp';
import {
    DEFAULT_THUMBNAIL_SIZE_FACTOR,
    useSelectedVaryAppDocumentContext,
    VaryAppDocumentItemType,
} from '../../app-document-list/appDocumentHelpers';

const varyAppDocumentItemsToView: { [key: string]: VaryAppDocumentItemType } =
    {};

function useAppDocumentItems() {
    const selectedAppDocument = useSelectedVaryAppDocumentContext();
    const [varyAppDocumentItems, setVaryAppDocumentItems] = useAppStateAsync<
        VaryAppDocumentItemType[]
    >(() => {
        return selectedAppDocument.getItems();
    }, [selectedAppDocument]);

    useAppEffectAsync(
        async (context) => {
            if (varyAppDocumentItems === undefined) {
                const newVaryAppDocumentItems =
                    await selectedAppDocument.getItems();
                context.setVaryAppDocumentItems(newVaryAppDocumentItems);
            }
        },
        [varyAppDocumentItems],
        { setVaryAppDocumentItems },
    );
    const startLoading = () => {
        setVaryAppDocumentItems(undefined);
    };

    useFileSourceEvents(
        ['update'],
        startLoading,
        [],
        selectedAppDocument.filePath,
    );

    const arrows: KeyboardType[] = [...allArrows, 'PageUp', 'PageDown', ' '];
    useKeyboardRegistering(
        arrows.map((key) => {
            return { key };
        }),
        (event) => {
            handleArrowing(event, varyAppDocumentItems ?? []);
        },
        [varyAppDocumentItems],
    );

    useAppEffect(() => {
        const varyAppDocumentItems = Object.values(varyAppDocumentItemsToView);
        if (varyAppDocumentItems.length === 0) {
            return;
        }
        varyAppDocumentItems.forEach((varyAppDocumentItem) => {
            showVaryAppDocumentItemInViewport(varyAppDocumentItem.id);
        });
        Object.keys(varyAppDocumentItemsToView).forEach((key) => {
            delete varyAppDocumentItemsToView[key];
        });
    }, [varyAppDocumentItems]);

    return { varyAppDocumentItems, startLoading };
}

export default function AppDocumentItemsComp() {
    const [thumbSizeScale] = useAppDocumentItemThumbnailSizeScale();
    const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
    const { varyAppDocumentItems, startLoading } = useAppDocumentItems();
    const appDocumentItemThumbnailSize =
        thumbSizeScale * DEFAULT_THUMBNAIL_SIZE_FACTOR;
    if (varyAppDocumentItems === undefined) {
        return <LoadingComp />;
    }
    if (varyAppDocumentItems === null) {
        return (
            <div className="d-flex justify-content-center">
                <p className="alert alert-warning">Fail to load slides</p>
                <button onClick={startLoading} className="btn btn-primary">
                    Reload
                </button>
            </div>
        );
    }
    return (
        <div className="d-flex flex-wrap p-1">
            {varyAppDocumentItems.map((varyAppDocumentItem, i) => {
                return (
                    <VaryAppDocumentItemRenderWrapperComp
                        key={varyAppDocumentItem.id}
                        draggingIndex={draggingIndex}
                        thumbSize={appDocumentItemThumbnailSize}
                        varyAppDocumentItem={varyAppDocumentItem}
                        index={i}
                        setDraggingIndex={setDraggingIndex}
                    />
                );
            })}
            {Array.from({ length: 2 }, (_, i) => {
                return (
                    <SlideGhostComp
                        key={`${i}`}
                        width={appDocumentItemThumbnailSize}
                    />
                );
            })}
        </div>
    );
}
