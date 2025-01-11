import { useAppDocumentItemThumbnailSizeScale } from '../../event/SlideListEventListener';
import AppDocumentItemsComp from './AppDocumentItemsComp';
import AppDocument from '../../slide-list/AppDocument';
import { handleCtrlWheel } from '../../others/AppRangeComp';
import { defaultRangeSize } from './AppDocumentPreviewerFooterComp';
import SlideItemsMenuComp from './SlideItemsMenuComp';
import { DIV_CLASS_NAME } from './slideItemHelpers';
import { useSelectedVaryAppDocumentContext } from '../../slide-list/appDocumentHelpers';
import PDFSlide from '../../slide-list/PDFSlide';

export default function VaryAppDocumentItemsPreviewerComp() {
    const selectedAppDocument = useSelectedVaryAppDocumentContext();
    const [thumbSizeScale, setThumbnailSizeScale] =
        useAppDocumentItemThumbnailSizeScale();
    const handlePasting = async () => {
        if (!(selectedAppDocument instanceof AppDocument)) {
            return;
        }
        const copiedSlideItems = await AppDocument.getCopiedSlideItems();
        for (const copiedSlideItem of copiedSlideItems) {
            selectedAppDocument.addItem(copiedSlideItem);
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
            {!PDFSlide.checkIsThisType(selectedAppDocument) ? (
                <SlideItemsMenuComp />
            ) : null}
            <AppDocumentItemsComp />
        </div>
    );
}
