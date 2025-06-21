import { Fragment } from 'react';

import SlideRenderComp from './SlideRenderComp';
import SlideDragReceiverComp from './SlideDragReceiverComp';
import PdfAppDocumentItemRenderComp from './PdfSlideRenderComp';
import { handleAppDocumentItemSelecting } from './varyAppDocumentHelpers';
import {
    useSelectedEditingSlideSetterContext,
    useVaryAppDocumentContext,
    VaryAppDocumentItemType,
} from '../../app-document-list/appDocumentHelpers';
import PdfSlide from '../../app-document-list/PdfSlide';
import AppDocument from '../../app-document-list/AppDocument';
import { showSimpleToast } from '../../toast/toastHelpers';
import Slide from '../../app-document-list/Slide';
import { ContextMenuItemType } from '../../context-menu/appContextMenuHelpers';

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
    const selectedAppDocument = useVaryAppDocumentContext();
    const setSelectedAppDocumentItem = useSelectedEditingSlideSetterContext();
    const handleDropping = (id: number, isLeft: boolean) => {
        if (!AppDocument.checkIsThisType(selectedAppDocument)) {
            return;
        }
        selectedAppDocument.moveSlide(id, index, isLeft);
    };
    const handleClicking = (event: any) => {
        handleAppDocumentItemSelecting(
            event,
            index + 1,
            varyAppDocumentItem,
            (selectedVaryAppDocumentItem) => {
                if (selectedVaryAppDocumentItem instanceof Slide) {
                    setSelectedAppDocumentItem(selectedVaryAppDocumentItem);
                }
            },
        );
    };
    const handleContextMenuOpening = (
        event: any,
        extraMenuItems: ContextMenuItemType[],
    ) => {
        selectedAppDocument.showSlideContextMenu(
            event,
            varyAppDocumentItem as any,
            extraMenuItems,
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
    if (PdfSlide.checkIsThisType(varyAppDocumentItem)) {
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
    if (!selectedAppDocument.isEditable) {
        return (
            <SlideRenderComp
                index={index}
                slide={varyAppDocumentItem}
                width={thumbSize}
                onClick={handleClicking}
                onContextMenu={handleContextMenuOpening}
                onCopy={handleCopying}
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
                <SlideDragReceiverComp
                    width={thumbSize}
                    isLeft
                    onDrop={handleDropping}
                />
            )}
            <SlideRenderComp
                index={index}
                slide={varyAppDocumentItem}
                width={thumbSize}
                onClick={handleClicking}
                onContextMenu={handleContextMenuOpening}
                onCopy={handleCopying}
                onDragStart={handleDragStarting}
                onDragEnd={handleDragEnding}
            />
            {shouldReceiveAtLast && (
                <SlideDragReceiverComp
                    width={thumbSize}
                    onDrop={handleDropping}
                />
            )}
        </Fragment>
    );
}
