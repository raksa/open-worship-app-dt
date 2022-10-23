import './SlideItemRender.scss';

import SlideItem from '../../slide-list/SlideItem';
import { usePSlideMEvents } from '../../_present/presentEventHelpers';
import { RendInfo, RendShowingScreen, toCNHighlight } from './SlideItemRender';
import ReactDOMServer from 'react-dom/server';

export function SlideItemPdfRenderContent({ width, pdfImageSrc }: {
    width: number,
    pdfImageSrc: string,
}) {
    return (
        <img width={width}
            src={pdfImageSrc} />
    );
}

export function genPdfSlideItem(width: number, pdfImageSrc: string) {
    const str = ReactDOMServer.renderToStaticMarkup(
        <SlideItemPdfRenderContent width={width}
            pdfImageSrc={pdfImageSrc} />);
    const div = document.createElement('div');
    div.innerHTML = str;
    return div.firstChild as HTMLDivElement;
}

export default function SlideItemPdfRender({
    slideItem,
    width,
    index,
    onClick,
}: {
    slideItem: SlideItem;
    width: number,
    index: number;
    onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
}) {
    usePSlideMEvents(['update']);
    const {
        activeCN,
        presentingCN,
    } = toCNHighlight(slideItem);
    return (
        <div className={`slide-item card pointer ${activeCN} ${presentingCN}`}
            style={{
                width: `${width}px`,
            }}
            onClick={onClick}>
            <div className='card-header d-flex'>
                <i className='bi bi-filetype-pdf' />
                <RendInfo index={index}
                    slideItem={slideItem} />
                <RendShowingScreen slideItem={slideItem} />
            </div>
            <div className='card-body overflow-hidden'
                style={{ padding: '0px' }} >
                <SlideItemPdfRenderContent width={width}
                    pdfImageSrc={slideItem.pdfImageSrc} />
            </div>
        </div>
    );
}
