import { Fragment } from 'react';

import SlideItemRenderComp from './SlideItemRenderComp';
import SlideItemDragReceiver from './SlideItemDragReceiver';
import PdfAppDocumentItemRenderComp from './PdfSlideRenderContentComp';
import { handleAppDocumentItemSelecting } from './slideItemHelpers';
import {
    useSelectedEditingSlideItemSetterContext,
    useSelectedVaryAppDocumentContext,
    VaryAppDocumentItemType,
} from '../../slide-list/appDocumentHelpers';
import PDFSlide from '../../slide-list/PDFSlide';
import AppDocument from '../../slide-list/AppDocument';
import { showSimpleToast } from '../../toast/toastHelpers';

export default function VaryAppDocumentItemRenderWrapperComp({
    draggingIndex,
    thumbSize,
    varyAppDocumentItem,
    index,
    setDraggingIndex,
}: Readonly<{
    draggingIndex: number | null;
    thumbSize: number;
    varyAppDocumentItem: VaryAppDocumentItemType;
    index: number;
    setDraggingIndex: (index: number | null) => void;
}>) {
    const selectedAppDocument = useSelectedVaryAppDocumentContext();
    const setSelectedAppDocumentItem =
        useSelectedEditingSlideItemSetterContext();
    const handleDropping = (id: number, isLeft: boolean) => {
        if (!(selectedAppDocument instanceof AppDocument)) {
            return;
        }
        selectedAppDocument.moveItem(id, index, isLeft);
    };
    const handleClicking = (event: any) => {
        handleAppDocumentItemSelecting(
            setSelectedAppDocumentItem,
            varyAppDocumentItem,
            event,
        );
    };
    const handleContextMenuOpening = (event: any) => {
        selectedAppDocument.showItemContextMenu(
            event,
            varyAppDocumentItem as any,
        );
    };
    const handleCopying = async () => {
        const text = await varyAppDocumentItem.clipboardSerialize();
        if (text === null) {
            showSimpleToast(
                'Cannot copy this item.',
                'Unable to serialize this item for clipboard.',
            );
            return;
        }
        navigator.clipboard.writeText(text);
    };
    const handleDragStarting = () => {
        setDraggingIndex(index);
    };
    const handleDragEnding = () => {
        setDraggingIndex(null);
    };
    if (varyAppDocumentItem instanceof PDFSlide) {
        return (
            <PdfAppDocumentItemRenderComp
                key={varyAppDocumentItem.id}
                onClick={handleClicking}
                pdfSlide={varyAppDocumentItem}
                width={thumbSize}
                index={index}
                onContextMenu={handleContextMenuOpening}
                onDragStart={handleDragStarting}
                onDragEnd={handleDragEnding}
            />
        );
    }
    const shouldReceiveAtFirst =
        draggingIndex !== null && draggingIndex !== 0 && index === 0;
    const shouldReceiveAtLast =
        draggingIndex !== null &&
        draggingIndex !== index &&
        draggingIndex !== index + 1;
    return (
        <Fragment key={varyAppDocumentItem.id}>
            {shouldReceiveAtFirst && (
                <SlideItemDragReceiver
                    width={thumbSize}
                    isLeft
                    onDrop={handleDropping}
                />
            )}
            <SlideItemRenderComp
                index={index}
                slideItem={varyAppDocumentItem}
                width={thumbSize}
                onClick={handleClicking}
                onContextMenu={handleContextMenuOpening}
                onCopy={handleCopying}
                onDragStart={handleDragStarting}
                onDragEnd={handleDragEnding}
            />
            {shouldReceiveAtLast && (
                <SlideItemDragReceiver
                    width={thumbSize}
                    onDrop={handleDropping}
                />
            )}
        </Fragment>
    );
}
