import './SlideItem.scss';

import { ContextMenuEventType } from '../others/AppContextMenu';
import SlideItem from './SlideItem';
import HTML2React from '../slide-editor/HTML2React';
import FileSource from '../helper/FileSource';
import SlideItemIFrame from './SlideItemIFrame';
import RenderIsEditing from './RenderIsEditing';

type SlideItemProps = {
    width: number,
    index: number;
    isActive: boolean;
    slideItem: SlideItem;
    fileSource: FileSource,
    onItemClick: () => void,
    onContextMenu: (e: ContextMenuEventType) => void,
    onCopy: () => void,
    onDragStart: (e: React.DragEvent<HTMLDivElement>) => void,
    onDragEnd: (e: React.DragEvent<HTMLDivElement>) => void,
};
export default function SlideItemRender({
    width, isActive, index,
    slideItem, fileSource,
    onItemClick,
    onContextMenu,
    onCopy,
    onDragStart,
    onDragEnd,
}: SlideItemProps) {
    const html2React = HTML2React.parseHTML(slideItem.html);
    return (
        <div className={`slide-item card ${isActive ? 'active' : ''} pointer`}
            draggable
            onDragStart={(e) => {
                const path = SlideItem.toSlideItemSelected(fileSource,
                    slideItem.id) || '';
                e.dataTransfer.setData('text/plain', path);
                onDragStart(e);
            }}
            onDragEnd={(e) => {
                onDragEnd(e);
            }}
            style={{
                width: `${width}px`,
            }}
            onClick={() => {
                onItemClick();
            }}
            onContextMenu={(e) => onContextMenu(e)}
            onCopy={onCopy}>
            <div className="card-header d-flex">
                <div>
                    {index + 1} {isActive && <span>
                        <i className="bi bi-collection" />
                    </span>}
                </div>
                <div className='flex-fill d-flex justify-content-end'>
                    <small className='pe-2'>
                        {html2React.width}x{html2React.height}
                    </small>
                    <RenderIsEditing index={index} slideItem={slideItem} />
                </div>
            </div>
            <div className="card-body overflow-hidden"
                style={{ width, padding: '0px' }} >
                <SlideItemIFrame
                    id={slideItem.id}
                    width={width}
                    html2React={html2React} />
            </div>
        </div>
    );
}
