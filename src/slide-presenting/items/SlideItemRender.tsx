import './SlideItemRender.scss';

import { ContextMenuEventType } from '../../others/AppContextMenu';
import { SlideItemContext } from '../../slide-list/SlideItem';
import RenderIsEditing from '../RenderIsEditing';
import { useContext } from 'react';
import { SlideItemIFrame } from './SlideItemRenderers';

export default function SlideItemRender({
    width, index,
    onContextMenu,
    onCopy,
    onDragStart,
    onDragEnd,
}: {
    width: number,
    index: number;
    onContextMenu: (e: ContextMenuEventType) => void,
    onCopy: () => void,
    onDragStart: (e: React.DragEvent<HTMLDivElement>) => void,
    onDragEnd: (e: React.DragEvent<HTMLDivElement>) => void,
}) {
    const slideItem = useContext(SlideItemContext);
    if (slideItem === null) {
        return null;
    }
    return (
        <div className={`slide-item card ${slideItem.isSelected ? 'active' : ''} pointer`}
            draggable
            onDragStart={(e) => {
                const path = slideItem.toSelectedItemSetting();
                if (path !== null) {
                    e.dataTransfer.setData('text/plain', path);
                    onDragStart(e);
                }
            }}
            onDragEnd={(e) => {
                onDragEnd(e);
            }}
            style={{
                width: `${width}px`,
            }}
            onClick={() => {
                slideItem.isSelected = !slideItem.isSelected;
            }}
            onContextMenu={(e) => onContextMenu(e)}
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
                    <RenderIsEditing index={index}
                        slideItem={slideItem} />
                </div>
            </div>
            <div className='card-body overflow-hidden'
                style={{ padding: '0px' }} >
                <SlideItemIFrame slideItem={slideItem} />
            </div>
        </div>
    );
}
