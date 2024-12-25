import './SlideItemRenderComp.scss';

import { ContextMenuEventType } from '../../others/AppContextMenu';
import SlideItem, {
    SelectedEditingSlideItemContext,
} from '../../slide-list/SlideItem';
import SlideItemRendererHtml from './SlideItemRendererHtml';
import ScreenSlideManager from '../../_screen/managers/ScreenSlideManager';
import {
    useScreenSlideManagerEvents,
} from '../../_screen/managers/screenEventHelpers';
import { handleDragStart } from '../../helper/dragHelpers';
import ShowingScreenIcon from '../../_screen/preview/ShowingScreenIcon';
import appProvider from '../../server/appProvider';
import { use } from 'react';

export function RendInfo({ index, slideItem }: Readonly<{
    index: number,
    slideItem: SlideItem,
}>) {
    const { selectedList } = toClassNameHighlight(slideItem);
    return (
        <div className='d-flex w-100'>
            <div className='flex-fill d-flex'>
                <div>
                    <span className='badge rounded-pill text-bg-info'
                        title={`Index: ${index + 1}`}>
                        {index + 1}
                    </span>
                </div>
            </div>
            <div className='flex-fill d-flex justify-content-end'>
                {selectedList.length > 0 ? (
                    <div className='d-flex app-border-white-round px-1'>
                        {selectedList.map(([key]) => {
                            const screenId = parseInt(key);
                            return (
                                <ShowingScreenIcon key={key}
                                    screenId={screenId}
                                />
                            );
                        })}
                    </div>
                ) : null}
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
        </div>
    );
}

export function toClassNameHighlight(
    slideItem: SlideItem, selectedSlideItem?: SlideItem | null,
) {
    const activeCN = (
        (
            appProvider.isPageEditor && selectedSlideItem &&
            slideItem.checkIsSame(selectedSlideItem)
        ) ? 'active' : ''
    );
    const selectedList = ScreenSlideManager.getDataList(
        slideItem.filePath, slideItem.id,
    );
    const presenterCN = (
        (appProvider.isPageEditor || selectedList.length == 0) ?
            '' : 'highlight-selected'
    );
    return {
        selectedList, activeCN, presenterCN,
    };
}

export default function SlideItemRenderComp({
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
    const selectedSlideItem = (
        use(SelectedEditingSlideItemContext)?.selectedSlideItem || null
    );
    useScreenSlideManagerEvents(['update']);
    const {
        activeCN, presenterCN,
    } = toClassNameHighlight(slideItem, selectedSlideItem);
    return (
        <div className={`slide-item card pointer ${activeCN} ${presenterCN}`}
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
            <div className='card-header d-flex' style={{ height: '35px' }}>
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
