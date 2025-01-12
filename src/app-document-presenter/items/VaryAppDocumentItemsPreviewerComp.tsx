import { useAppDocumentItemThumbnailSizeScale } from '../../event/SlideListEventListener';
import AppDocumentItemsComp from './AppDocumentItemsComp';
import AppDocument from '../../app-document-list/AppDocument';
import { handleCtrlWheel } from '../../others/AppRangeComp';
import { defaultRangeSize } from './AppDocumentPreviewerFooterComp';
import SlidesMenuComp from './SlidesMenuComp';
import { DIV_CLASS_NAME } from './slideHelpers';
import { useSelectedVaryAppDocumentContext } from '../../app-document-list/appDocumentHelpers';
import PdfSlide from '../../app-document-list/PdfSlide';

export default function VaryAppDocumentItemsPreviewerComp() {
    const selectedAppDocument = useSelectedVaryAppDocumentContext();
    const [thumbSizeScale, setThumbnailSizeScale] =
        useAppDocumentItemThumbnailSizeScale();
    const handlePasting = async () => {
        if (!AppDocument.checkIsThisType(selectedAppDocument)) {
            return;
        }
        const copiedSlides = await AppDocument.getCopiedSlides();
        for (const copiedSlide of copiedSlides) {
            selectedAppDocument.addSlide(copiedSlide);
        }
    };
    return (
        <div
            className={`${DIV_CLASS_NAME} app-focusable w-100 h-100 pb-5`}
            tabIndex={0}
            style={{ overflow: 'auto' }}
            onWheel={(event) => {
                handleCtrlWheel({
                    event,
                    value: thumbSizeScale,
                    setValue: setThumbnailSizeScale,
                    defaultSize: defaultRangeSize,
                });
            }}
            onContextMenu={(event) => {
                selectedAppDocument.showContextMenu(event);
            }}
            onPaste={handlePasting}
        >
            {!PdfSlide.checkIsThisType(selectedAppDocument) ? (
                <SlidesMenuComp />
            ) : null}
            <AppDocumentItemsComp />
        </div>
    );
}
