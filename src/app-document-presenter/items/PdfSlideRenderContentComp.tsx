import './VaryAppDocumentItem.scss';

import { useScreenVaryAppDocumentManagerEvents } from '../../_screen/managers/screenEventHelpers';
import { RenderInfoComp, toClassNameHighlight } from './SlideRenderComp';
import ReactDOMServer from 'react-dom/server';
import { getHTMLChild } from '../../helper/helpers';
import { handleDragStart } from '../../helper/dragHelpers';
import PdfSlide from '../../app-document-list/PdfSlide';

export function PdfSlideRenderContentComp({
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
    onContextMenu: (event: any) => void;
    onDragStart: (event: React.DragEvent<HTMLDivElement>) => void;
    onDragEnd: (event: React.DragEvent<HTMLDivElement>) => void;
}>) {
    useScreenVaryAppDocumentManagerEvents(['update']);
    const { activeCN, presenterCN } = toClassNameHighlight(pdfSlide);
    const pdfPreviewSrc = pdfSlide.pdfPreviewSrc;
    return (
        <div
            className={`data-vary-app-document-item card pointer ${activeCN} ${presenterCN}`}
            style={{ width: `${width}px` }}
            data-vary-app-document-item-id={pdfSlide.id}
            draggable
            onDragStart={(event) => {
                handleDragStart(event, pdfSlide);
                onDragStart(event);
            }}
            onDragEnd={(event) => {
                onDragEnd(event);
            }}
            onClick={onClick}
            onContextMenu={onContextMenu}
        >
            <div className="card-header d-flex" style={{ height: '35px' }}>
                <i className="bi bi-filetype-pdf" />
                <RenderInfoComp
                    viewIndex={index + 1}
                    varyAppDocumentItem={pdfSlide}
                />
            </div>
            {pdfPreviewSrc === null ? (
                <div className="alert alert-danger">
                    Unable to preview right now
                </div>
            ) : (
                <div
                    className="card-body overflow-hidden"
                    style={{ padding: '0px' }}
                >
                    <PdfSlideRenderContentComp pdfImageSrc={pdfPreviewSrc} />
                </div>
            )}
        </div>
    );
}
