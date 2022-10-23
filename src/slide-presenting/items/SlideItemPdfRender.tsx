import './SlideItemRender.scss';

import SlideItem from '../../slide-list/SlideItem';
import { usePSlideMEvents } from '../../_present/presentEventHelpers';
import { RendInfo, RendShowingScreen, toCNHighlight } from './SlideItemRender';

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
                <img width={width}
                    src={slideItem.pdfImageSrc} />
            </div>
        </div>
    );
}
