import './SlideItemRender.scss';

import { ContextMenuEventType } from '../../others/AppContextMenu';
import SlideItem from '../../slide-list/SlideItem';
import SlideItemRendererHtml from './SlideItemRendererHtml';
import PresentSlideManager, {
    SlideItemDataType,
} from '../../_present/PresentSlideManager';
import { isWindowEditingMode } from '../../App';
import { usePSlideMEvents } from '../../_present/presentEventHelpers';

export default function SlideItemRender({
    slideItem, width, index,
    onClick,
    onContextMenu, onCopy,
    onDragStart, onDragEnd,
}: {
    slideItem: SlideItem;
    width: number,
    index: number;
    onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
    onContextMenu: (event: ContextMenuEventType) => void,
    onCopy: () => void,
    onDragStart: (event: React.DragEvent<HTMLDivElement>) => void,
    onDragEnd: (event: React.DragEvent<HTMLDivElement>) => void,
}) {
    usePSlideMEvents(['update']);
    const isEditing = isWindowEditingMode();
    const activeCN = isEditing && slideItem.isSelected ? 'active' : '';
    let selectedList: [string, SlideItemDataType][] = [];
    let presentingCN = '';
    if (!isEditing) {
        selectedList = PresentSlideManager.getDataList(
            slideItem.fileSource.filePath, slideItem.id);
        presentingCN = selectedList.length > 0 ? 'highlight-selected' : '';
    }
    return (
        <div className={`slide-item card pointer ${activeCN} ${presentingCN}`}
            draggable
            onDragStart={(event) => {
                PresentSlideManager.startPresentDrag(event, {
                    slideFilePath: slideItem.fileSource.filePath,
                    slideItemJson: slideItem.toJson(),
                });
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
                {!!(!isEditing && selectedList.length) && <span>
                    ({selectedList.map(([key]) => key).join(', ')})
                </span>}
            </div>
            <div className='card-body overflow-hidden'
                style={{ padding: '0px' }} >
                <SlideItemRendererHtml slideItem={slideItem} />
            </div>
        </div>
    );
}
