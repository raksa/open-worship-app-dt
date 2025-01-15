import { useMemo, useState } from 'react';

import {
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
import { useAppEffect, useAppStateAsync } from '../../helper/debuggerHelpers';
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
    const {
        isPending,
        value: varyAppDocumentItems,
        setValue: setVaryAppDocumentItems,
    } = useAppStateAsync<VaryAppDocumentItemType[]>(
        useMemo(() => selectedAppDocument.getItems(), [selectedAppDocument]),
    );

    const startLoading = async () => {
        const newVaryAppDocumentItems = await selectedAppDocument.getItems();
        setVaryAppDocumentItems(newVaryAppDocumentItems);
    };

    useFileSourceEvents(
        ['update'],
        startLoading,
        [],
        selectedAppDocument.filePath,
    );

    const arrows: KeyboardType[] = ['ArrowLeft', 'ArrowRight'];
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

    return { varyAppDocumentItems, isPending, startLoading };
}

export default function AppDocumentItemsComp() {
    const [thumbSizeScale] = useAppDocumentItemThumbnailSizeScale();
    const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
    const { varyAppDocumentItems, isPending, startLoading } =
        useAppDocumentItems();
    const appDocumentItemThumbnailSize =
        thumbSizeScale * DEFAULT_THUMBNAIL_SIZE_FACTOR;
    if (isPending) {
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
        <div className="d-flex flex-wrap justify-content-center">
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
