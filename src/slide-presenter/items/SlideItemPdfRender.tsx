import './SlideItemRenderComp.scss';

import SlideItem from '../../slide-list/SlideItem';
import { useScreenSlideManagerEvents } from '../../_screen/managers/screenEventHelpers';
import { RenderInfoComp, toClassNameHighlight } from './SlideItemRenderComp';
import ReactDOMServer from 'react-dom/server';
import { getHTMLChild } from '../../helper/helpers';
import { handleDragStart } from '../../helper/dragHelpers';

export function SlideItemPdfRenderContent({
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

export function genPdfSlideItem(pdfImageSrc: string, isFullWidth = false) {
    const htmlString = ReactDOMServer.renderToStaticMarkup(
        <SlideItemPdfRenderContent
            pdfImageSrc={pdfImageSrc}
            isFullWidth={isFullWidth}
        />,
    );
    const div = document.createElement('div');
    div.innerHTML = htmlString;
    return getHTMLChild<HTMLDivElement>(div, 'img');
}

export default function SlideItemPdfRender({
    slideItem,
    width,
    index,
    onClick,
    onContextMenu,
    onDragStart,
    onDragEnd,
}: Readonly<{
    slideItem: SlideItem;
    width: number;
    index: number;
    onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
    onContextMenu: (event: any) => void;
    onDragStart: (event: React.DragEvent<HTMLDivElement>) => void;
    onDragEnd: (event: React.DragEvent<HTMLDivElement>) => void;
}>) {
    useScreenSlideManagerEvents(['update']);
    const { activeCN, presenterCN } = toClassNameHighlight(slideItem);
    const pdfPreviewSrc = slideItem.pdfPreviewSrc;
    return (
        <div
            className={`slide-item card pointer ${activeCN} ${presenterCN}`}
            style={{ width: `${width}px` }}
            data-slide-item-id={slideItem.id}
            draggable
            onDragStart={(event) => {
                handleDragStart(event, slideItem);
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
                <RenderInfoComp viewIndex={index + 1} slideItem={slideItem} />
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
                    <SlideItemPdfRenderContent pdfImageSrc={pdfPreviewSrc} />
                </div>
            )}
        </div>
    );
}
