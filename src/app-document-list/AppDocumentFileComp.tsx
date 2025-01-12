import { use, useState } from 'react';

import FileItemHandlerComp from '../others/FileItemHandlerComp';
import FileSource from '../helper/FileSource';
import AppDocument from './AppDocument';
import { getIsShowingVaryAppDocumentPreviewer } from '../app-document-presenter/Presenter';
import { previewingEventListener } from '../event/PreviewingEventListener';
import { useFileSourceEvents } from '../helper/dirSourceHelpers';
import { useAppEffect } from '../helper/debuggerHelpers';
import { ContextMenuItemType } from '../others/AppContextMenuComp';
import { editorTab, goToPath } from '../router/routeHelpers';
import { previewPdf } from '../server/appHelpers';
import { removePdfImagesPreview } from '../helper/pdfHelpers';
import EditingHistoryManager, {
    useEditingHistoryStatus,
} from '../others/EditingHistoryManager';
import {
    VaryAppDocumentDynamicType,
    varyAppDocumentFromFilePath,
    useSelectedAppDocumentSetterContext,
    SelectedVaryAppDocumentContext,
    VaryAppDocumentType,
} from './appDocumentHelpers';
import PdfAppDocument from './PdfAppDocument';
import AppDocumentSourceAbs from '../helper/DocumentSourceAbs';

function genContextMenuItems(
    varyAppDocument: VaryAppDocumentDynamicType,
    setSelectedSlide: (value: VaryAppDocumentType | null) => void,
): ContextMenuItemType[] {
    if (PdfAppDocument.checkIsThisType(varyAppDocument)) {
        return [
            {
                menuTitle: 'Preview PDF',
                onClick: () => {
                    previewPdf(varyAppDocument.fileSource.src);
                },
            },
            {
                menuTitle: 'Refresh PDF Images',
                onClick: async () => {
                    await removePdfImagesPreview(varyAppDocument.filePath);
                    varyAppDocument.fileSource.fireUpdateEvent();
                },
            },
        ];
    }
    return [
        {
            menuTitle: 'Edit',
            onClick: () => {
                if (varyAppDocument) {
                    setSelectedSlide(varyAppDocument);
                    goToPath(editorTab.routePath);
                }
            },
        },
    ];
}

function SlideFilePreviewNormalComp({
    slide,
}: Readonly<{ slide: AppDocument }>) {
    const fileSource = FileSource.getInstance(slide.filePath);
    const { canSave } = useEditingHistoryStatus(slide.filePath);
    return (
        <div className="w-100 h-100 app-ellipsis">
            <i className="bi bi-file-earmark-slides" />
            {fileSource.name}
            {canSave && <span style={{ color: 'red' }}>*</span>}
        </div>
    );
}

function SlideFilePreviewPdfComp({
    pdfSlide,
}: Readonly<{ pdfSlide: PdfAppDocument }>) {
    const fileSource = FileSource.getInstance(pdfSlide.filePath);
    return (
        <div className="w-100 h-100 app-ellipsis">
            <i className="bi bi-filetype-pdf" />
            {fileSource.name}
        </div>
    );
}

export default function AppDocumentFileComp({
    index,
    filePath,
}: Readonly<{
    index: number;
    filePath: string;
}>) {
    const selectedContext = use(SelectedVaryAppDocumentContext);
    const isSelected =
        selectedContext !== null &&
        selectedContext.selectedVaryAppDocument?.filePath === filePath;
    const setSelectedAppDocument = useSelectedAppDocumentSetterContext();
    const [varyAppDocument, setVaryAppDocument] =
        useState<VaryAppDocumentDynamicType>(null);
    const handleReloading = () => {
        setVaryAppDocument(null);
    };
    const handleClicking = () => {
        if (!varyAppDocument) {
            return;
        }
        if (selectedContext && !getIsShowingVaryAppDocumentPreviewer()) {
            previewingEventListener.showVaryAppDocument(varyAppDocument);
            return;
        }
        setSelectedAppDocument(varyAppDocument);
    };
    const handleChildRendering = (varyAppDocument: AppDocumentSourceAbs) => {
        if (AppDocument.checkIsThisType(varyAppDocument)) {
            return <SlideFilePreviewNormalComp slide={varyAppDocument} />;
        }
        if (PdfAppDocument.checkIsThisType(varyAppDocument)) {
            return <SlideFilePreviewPdfComp pdfSlide={varyAppDocument} />;
        }
        return null;
    };
    const handleSlideDeleting = () => {
        EditingHistoryManager.getInstance(filePath).discard();
        if (PdfAppDocument.checkIsThisType(varyAppDocument)) {
            removePdfImagesPreview(filePath);
        }
    };
    useAppEffect(() => {
        if (varyAppDocument !== null) {
            return;
        }
        const newVaryAppDocument = varyAppDocumentFromFilePath(filePath);
        setVaryAppDocument(newVaryAppDocument);
    }, [varyAppDocument]);
    useFileSourceEvents(
        ['update', 'history-update', 'edit'],
        () => {
            setVaryAppDocument(null);
        },
        [varyAppDocument],
        filePath,
    );

    return (
        <FileItemHandlerComp
            index={index}
            data={varyAppDocument}
            reload={handleReloading}
            filePath={filePath}
            isPointer
            onClick={handleClicking}
            renderChild={handleChildRendering}
            contextMenuItems={genContextMenuItems(
                varyAppDocument,
                setSelectedAppDocument,
            )}
            onTrashed={handleSlideDeleting}
            isSelected={isSelected}
        />
    );
}
