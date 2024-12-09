import './SlideItemRender.scss';

import { ContextMenuEventType } from '../../others/AppContextMenu';
import SlideItem, {
    useSelectedSlideItemContext,
} from '../../slide-list/SlideItem';
import SlideItemRendererHtml from './SlideItemRendererHtml';
import ScreenSlideManager from '../../_screen/ScreenSlideManager';
import { usePSlideMEvents } from '../../_screen/screenEventHelpers';
import { handleDragStart } from '../../bible-list/dragHelpers';
import ShowingScreenIcon from '../../_screen/preview/ShowingScreenIcon';
import appProvider from '../../server/appProvider';

export function RendInfo({ index, slideItem }: Readonly<{
    index: number,
    slideItem: SlideItem,
}>) {
    const { selectedList } = toCNHighlight(slideItem);
    return (
        <>
            <div>
                <span className='badge rounded-pill text-bg-info'
                    title={`Index: ${index + 1}`}>
                    {index + 1}
                </span>
                {selectedList.map(([key]) => {
                    const screenId = parseInt(key, 10);
                    return (
                        <ShowingScreenIcon key={key} screenId={screenId} />
                    );
                })}
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

export function toCNHighlight(
    slideItem: SlideItem, selectedSlideItem?: SlideItem,
) {
    const activeCN = (
        (
            appProvider.isPageEditor && selectedSlideItem !== undefined &&
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
    const { selectedSlideItem } = useSelectedSlideItemContext();
    usePSlideMEvents(['update']);
    const {
        activeCN, presenterCN,
    } = toCNHighlight(slideItem, selectedSlideItem);
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
