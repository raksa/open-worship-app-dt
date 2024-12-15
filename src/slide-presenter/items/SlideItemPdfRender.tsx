import './SlideItemRender.scss';

import SlideItem from '../../slide-list/SlideItem';
import { useScreenSlideManagerEvents } from '../../_screen/screenEventHelpers';
import {
    RendInfo, toClassNameHighlight,
} from './SlideItemRender';
import ReactDOMServer from 'react-dom/server';
import { getDivHTMLChild } from '../../helper/helpers';

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
    return getDivHTMLChild(div);
}

export default function SlideItemPdfRender({
    slideItem, width, index, onClick,
}: Readonly<{
    slideItem: SlideItem;
    width: number,
    index: number;
    onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
}>) {
    useScreenSlideManagerEvents(['update']);
    const {
        activeCN, presenterCN,
    } = toClassNameHighlight(slideItem);
    return (
        <div className={`slide-item card pointer ${activeCN} ${presenterCN}`}
            style={{
                width: `${width}px`,
            }}
            onClick={onClick}>
            <div className='card-header d-flex'>
                <i className='bi bi-filetype-pdf' />
                <RendInfo index={index}
                    slideItem={slideItem}
                />
            </div>
            <div className='card-body overflow-hidden'
                style={{ padding: '0px' }} >
                <SlideItemPdfRenderContent
                    pdfImageSrc={slideItem.pdfImageSrc}
                />
            </div>
        </div>
    );
}
