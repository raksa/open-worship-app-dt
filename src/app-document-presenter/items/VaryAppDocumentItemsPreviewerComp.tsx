import { useAppDocumentItemThumbnailSizeScale } from '../../event/VaryAppDocumentEventListener';
import AppDocumentItemsComp from './AppDocumentItemsComp';
import AppDocument from '../../app-document-list/AppDocument';
import { handleCtrlWheel } from '../../others/AppRangeComp';
import { defaultRangeSize } from './AppDocumentPreviewerFooterComp';
import SlidesMenuComp from './SlidesMenuComp';
import { DIV_CLASS_NAME } from './varyAppDocumentHelpers';
import { useSelectedVaryAppDocumentContext } from '../../app-document-list/appDocumentHelpers';
import PdfSlide from '../../app-document-list/PdfSlide';
import ScrollingHandlerComp from '../../scrolling/ScrollingHandlerComp';

export default function VaryAppDocumentItemsPreviewerComp() {
    const varyAppDocument = useSelectedVaryAppDocumentContext();
    const [thumbSizeScale, setThumbnailSizeScale] =
        useAppDocumentItemThumbnailSizeScale();
    const handlePasting = async () => {
        if (!AppDocument.checkIsThisType(varyAppDocument)) {
            return;
        }
        const copiedSlides = await AppDocument.getCopiedSlides();
        for (const copiedSlide of copiedSlides) {
            varyAppDocument.addSlide(copiedSlide);
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
                varyAppDocument.showContextMenu(event);
            }}
            onPaste={handlePasting}
        >
            {!PdfSlide.checkIsThisType(varyAppDocument) ? (
                <SlidesMenuComp />
            ) : null}
            <AppDocumentItemsComp />
            <ScrollingHandlerComp style={{ bottom: '40px' }} />
        </div>
    );
}
