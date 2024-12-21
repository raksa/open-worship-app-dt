import './SlideItemRenderComp.scss';

import SlideItem from '../../slide-list/SlideItem';
import { useScreenSlideManagerEvents } from '../../_screen/screenEventHelpers';
import {
    RendInfo, toClassNameHighlight,
} from './SlideItemRenderComp';
import ReactDOMServer from 'react-dom/server';
import { getHTMLChild } from '../../helper/helpers';
import { handleDragStart } from '../../helper/dragHelpers';
import { useSlideItemPdfImage } from '../../helper/pdfHelpers';

export function SlideItemPdfRenderContent({
    pdfImageSrc, isFullWidth = false,
}: Readonly<{
    pdfImageSrc: string,
    isFullWidth?: boolean,
}>) {
    return (
        <img alt='pdf-image' style={isFullWidth ? {
            width: '100%',
        } : {
            width: '100%',
            height: '100%',
            objectFit: 'contain',
        }}
            src={pdfImageSrc}
        />
    );
}

export function genPdfSlideItem(pdfImageSrc: string, isFullWidth = false) {
    const htmlString = ReactDOMServer.renderToStaticMarkup(
        <SlideItemPdfRenderContent pdfImageSrc={pdfImageSrc}
            isFullWidth={isFullWidth}
        />,
    );
    const div = document.createElement('div');
    div.innerHTML = htmlString;
    return getHTMLChild<HTMLDivElement>(div, 'img');
}

export default function SlideItemPdfRender({
    slideItem, width, index, onClick, onContextMenu, onDragStart,
    onDragEnd,
}: Readonly<{
    slideItem: SlideItem;
    width: number,
    index: number;
    onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
    onContextMenu: (event: any) => void,
    onDragStart: (event: React.DragEvent<HTMLDivElement>) => void,
    onDragEnd: (event: React.DragEvent<HTMLDivElement>) => void,
}>) {
    const imageData = useSlideItemPdfImage(slideItem);
    useScreenSlideManagerEvents(['update']);
    const {
        activeCN, presenterCN,
    } = toClassNameHighlight(slideItem);
    return (
        <div className={`slide-item card pointer ${activeCN} ${presenterCN}`}
            style={{
                width: `${width}px`,
            }}
            draggable
            onDragStart={(event) => {
                handleDragStart(event, slideItem);
                onDragStart(event);
            }}
            onDragEnd={(event) => {
                onDragEnd(event);
            }}
            onClick={onClick}
            onContextMenu={onContextMenu}>
            <div className='card-header d-flex'>
                <i className='bi bi-filetype-pdf' />
                <RendInfo index={index}
                    slideItem={slideItem}
                />
            </div>
            {imageData === null ? (
                <div>Loading...</div>
            ) : (
                <div className='card-body overflow-hidden'
                    style={{ padding: '0px' }} >
                    <SlideItemPdfRenderContent
                        pdfImageSrc={imageData}
                    />
                </div>
            )}
        </div>
    );
}
