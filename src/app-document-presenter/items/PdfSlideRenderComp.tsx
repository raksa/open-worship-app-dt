import { useScreenVaryAppDocumentManagerEvents } from '../../_screen/managers/screenEventHelpers';
import ReactDOMServer from 'react-dom/server';
import { getHTMLChild } from '../../helper/helpers';
import { handleDragStart } from '../../helper/dragHelpers';
import PdfSlide from '../../app-document-list/PdfSlide';
import SlideItemRenderComp, { useScale } from './SlideItemRenderComp';
import { ContextMenuItemType } from '../../context-menu/appContextMenuHelpers';

function PdfSlideRenderContentComp({
    pdfImageSrc,
    isFullWidth = false,
}: Readonly<{
    pdfImageSrc: string;
    isFullWidth?: boolean;
}>) {
    return (
        <img
            alt="pdf-image"
            style={
                isFullWidth
                    ? {
                          width: '100%',
                      }
                    : {
                          width: '100%',
                          height: '100%',
                          objectFit: 'contain',
                      }
            }
            src={pdfImageSrc}
        />
    );
}

export function genPdfSlide(pdfImageSrc: string, isFullWidth = false) {
    const htmlString = ReactDOMServer.renderToStaticMarkup(
        <PdfSlideRenderContentComp
            pdfImageSrc={pdfImageSrc}
            isFullWidth={isFullWidth}
        />,
    );
    const div = document.createElement('div');
    div.innerHTML = htmlString;
    return getHTMLChild<HTMLDivElement>(div, 'img');
}

export default function PdfSlideRenderComp({
    pdfSlide,
    width,
    index,
    onClick,
    onContextMenu,
    onDragStart,
    onDragEnd,
}: Readonly<{
    pdfSlide: PdfSlide;
    width: number;
    index: number;
    onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
    onContextMenu: (event: any, extraMenuItems: ContextMenuItemType[]) => void;
    onDragStart: (event: React.DragEvent<HTMLDivElement>) => void;
    onDragEnd: (event: React.DragEvent<HTMLDivElement>) => void;
}>) {
    const { scale, parentWidth, setParentDiv } = useScale(pdfSlide, width);
    useScreenVaryAppDocumentManagerEvents(['update']);
    const pdfPreviewSrc = pdfSlide.pdfPreviewSrc;
    const dragStartHandling = (event: any) => {
        handleDragStart(event, pdfSlide);
        onDragStart(event);
    };
    const dragEndHandling = (event: any) => {
        onDragEnd(event);
    };
    return (
        <SlideItemRenderComp
            item={pdfSlide}
            width={width}
            index={index}
            onDragStart={dragStartHandling}
            onDragEnd={dragEndHandling}
            onContextMenu={onContextMenu}
            onClick={onClick}
        >
            <div
                ref={setParentDiv}
                style={{
                    width: `${parentWidth}px`,
                    height: `${pdfSlide.height * scale}px`,
                }}
            >
                {pdfPreviewSrc === null ? (
                    <div className="alert alert-danger">
                        Unable to preview right now
                    </div>
                ) : (
                    <PdfSlideRenderContentComp pdfImageSrc={pdfPreviewSrc} />
                )}
            </div>
        </SlideItemRenderComp>
    );
}
