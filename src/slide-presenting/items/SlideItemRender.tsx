import './SlideItemRender.scss';

import { ContextMenuEventType } from '../../others/AppContextMenu';
import SlideItem from '../../slide-list/SlideItem';
import SlideItemRendererHtml from './SlideItemRendererHtml';
import PresentSlideManager from '../../_present/PresentSlideManager';

export default function SlideItemRender({
    slideItem, width, index,
    onContextMenu, onCopy,
    onDragStart, onDragEnd,
}: {
    slideItem: SlideItem;
    width: number,
    index: number;
    onContextMenu: (e: ContextMenuEventType) => void,
    onCopy: () => void,
    onDragStart: (e: React.DragEvent<HTMLDivElement>) => void,
    onDragEnd: (e: React.DragEvent<HTMLDivElement>) => void,
}) {
    return (
        <div className={`slide-item card ${slideItem.isSelected ? 'active' : ''} pointer`}
            draggable
            onDragStart={(event) => {
                const path = slideItem.toSelectedItemSetting();
                if (path !== null) {
                    event.dataTransfer.setData('text/plain', path);
                    onDragStart(event);
                }
            }}
            onDragEnd={(event) => {
                onDragEnd(event);
            }}
            style={{
                width: `${width}px`,
            }}
            onClick={(event) => {
                slideItem.isSelected = !slideItem.isSelected;
                PresentSlideManager.slideSelect(slideItem.toJson(), event);
            }}
            onContextMenu={(event) => {
                onContextMenu(event);
            }}
            onCopy={onCopy}>
            <div className='card-header d-flex'>
                <div>
                    {index + 1} {slideItem.isSelected && <span>
                        <i className='bi bi-collection' />
                    </span>}
                </div>
                <div className='flex-fill d-flex justify-content-end'>
                    <small className='pe-2'>
                        {slideItem.width}x{slideItem.height}
                    </small>
                    {slideItem.isChanged && <span
                        style={{ color: 'red' }}>*</span>}
                </div>
            </div>
            <div className='card-body overflow-hidden'
                style={{ padding: '0px' }} >
                <SlideItemRendererHtml slideItem={slideItem} />
            </div>
        </div>
    );
}
