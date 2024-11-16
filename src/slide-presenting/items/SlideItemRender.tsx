import './SlideItemRender.scss';

import { ContextMenuEventType } from '../../others/AppContextMenu';
import SlideItem from '../../slide-list/SlideItem';
import SlideItemRendererHtml from './SlideItemRendererHtml';
import PresentSlideManager from '../../_present/PresentSlideManager';
import { usePSlideMEvents } from '../../_present/presentEventHelpers';
import { handleDragStart } from '../../bible-list/dragHelpers';
import { checkIsWindowEditingMode } from '../../router/routeHelpers';

export function RendInfo({ index, slideItem }: Readonly<{
    index: number,
    slideItem: SlideItem,
}>) {
    const { selectedList } = toCNHighlight(slideItem);
    const screenIds = selectedList.map(([id]) => id);
    return (
        <>
            <div>
                <span className='badge rounded-pill text-bg-info'
                    title={`Index: ${index + 1}`}>
                    {index + 1}
                </span>
                {selectedList.length > 0 ? (
                    <span title={
                        `Showing on screens: ${screenIds.join(', ')}`
                    }>
                        <i className='bi bi-collection' />
                    </span>
                ) : null}
            </div>
            <div className='flex-fill d-flex justify-content-end'>
                <span title={
                    `width:${slideItem.width}, height:${slideItem.height}`
                }>
                    <small className='pe-2'>
                        {slideItem.width}x{slideItem.height}
                    </small>
                </span>
                {slideItem.isChanged && (
                    <span style={{ color: 'red' }}>*</span>
                )}
            </div>
        </>
    );
}

export function toCNHighlight(slideItem: SlideItem) {
    const isEditing = checkIsWindowEditingMode();
    const activeCN = isEditing && slideItem.isSelected ? 'active' : '';
    const selectedList = PresentSlideManager.getDataList(
        slideItem.filePath, slideItem.id,
    );
    const presentingCN = (
        (isEditing || selectedList.length == 0) ? '' : 'highlight-selected'
    );
    return {
        selectedList, activeCN, presentingCN,
    };
}

export default function SlideItemRender({
    slideItem, width, index, onClick, onContextMenu, onCopy, onDragStart,
    onDragEnd,
}: Readonly<{
    slideItem: SlideItem;
    width: number,
    index: number;
    onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
    onContextMenu: (event: ContextMenuEventType) => void,
    onCopy: () => void,
    onDragStart: (event: React.DragEvent<HTMLDivElement>) => void,
    onDragEnd: (event: React.DragEvent<HTMLDivElement>) => void,
}>) {
    usePSlideMEvents(['update']);
    const {
        activeCN,
        presentingCN,
    } = toCNHighlight(slideItem);
    return (
        <div className={`slide-item card pointer ${activeCN} ${presentingCN}`}
            data-slide-item-id={slideItem.id}
            draggable
            onDragStart={(event) => {
                handleDragStart(event, slideItem);
                onDragStart(event);
            }}
            onDragEnd={(event) => {
                onDragEnd(event);
            }}
            style={{
                width: `${width}px`,
            }}
            onClick={onClick}
            onContextMenu={(event) => {
                onContextMenu(event as any);
            }}
            onCopy={onCopy}>
            <div className='card-header d-flex'>
                <RendInfo index={index}
                    slideItem={slideItem}
                />
            </div>
            <div className='card-body overflow-hidden'
                style={{ padding: '0px' }} >
                <SlideItemRendererHtml slideItem={slideItem} />
            </div>
        </div>
    );
}
