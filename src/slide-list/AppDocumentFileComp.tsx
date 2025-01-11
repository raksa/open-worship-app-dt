import { useState } from 'react';

import FileItemHandlerComp from '../others/FileItemHandlerComp';
import FileSource from '../helper/FileSource';
import AppDocument from './AppDocument';
import { getIsShowingVaryAppDocumentPreviewer } from '../slide-presenter/Presenter';
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
} from './appDocumentHelpers';
import PDFAppDocument from './PDFAppDocument';

export default function AppDocumentFileComp({
    index,
    filePath,
}: Readonly<{
    index: number;
    filePath: string;
}>) {
    const setSelectedSlide = useSelectedAppDocumentSetterContext();
    const [varyAppDocument, setVaryAppDocument] =
        useState<VaryAppDocumentDynamicType>(null);
    const handleReloading = () => {
        setVaryAppDocument(null);
    };
    const handleClicking = () => {
        if (!varyAppDocument) {
            return;
        }
        if (
            varyAppDocument.checkIsSame(selectedVaryAppDocument) &&
            !getIsShowingVaryAppDocumentPreviewer()
        ) {
            previewingEventListener.showVaryAppDocument(varyAppDocument);
            return;
        }
        setSelectedSlide(varyAppDocument);
    };
    const handleChildRendering = (slide: AppDocument | PDFAppDocument) => {
        return PDFAppDocument.checkIsThisType(slide) ? (
            <SlideFilePreviewPdf slide={slide} />
        ) : (
            <SlideFilePreviewNormal slide={slide} />
        );
    };
    const handleSlideDeleting = () => {
        EditingHistoryManager.getInstance(filePath).discard();
        if (PDFAppDocument.checkIsThisType(varyAppDocument)) {
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
    const isPdf = PDFAppDocument.checkIsThisType(varyAppDocument);
    const menuItems: ContextMenuItemType[] | undefined = isPdf
        ? [
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
          ]
        : [
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
    return (
        <FileItemHandlerComp
            index={index}
            data={varyAppDocument}
            reload={handleReloading}
            filePath={filePath}
            isPointer
            onClick={handleClicking}
            renderChild={handleChildRendering}
            contextMenuItems={menuItems}
            onTrashed={handleSlideDeleting}
        />
    );
}

function SlideFilePreviewNormal({ slide }: Readonly<{ slide: AppDocument }>) {
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

function SlideFilePreviewPdf({ slide }: Readonly<{ slide: PDFAppDocument }>) {
    const fileSource = FileSource.getInstance(slide.filePath);
    return (
        <div className="w-100 h-100 app-ellipsis">
            <i className="bi bi-filetype-pdf" />
            {fileSource.name}
        </div>
    );
}
