import Bible from './Bible';
import BibleItem from './BibleItem';
import ItemReadError from '../others/ItemReadError';
import {
    getIsPreviewingBible,
} from '../full-text-present/FullTextPreviewer';
import {
    previewingEventListener,
} from '../event/PreviewingEventListener';
import FileSource from '../helper/FileSource';
import { useFSEvents } from '../helper/dirSourceHelpers';
import { useCallback } from 'react';
import { handleDragStart } from '../helper/dragHelpers';
import ItemColorNote from '../others/ItemColorNote';
import {
    BibleSelectionMini,
} from '../bible-search/BibleSelection';
import {
    useBibleItemRenderTitle,
} from '../helper/bible-helpers/bibleRenderHelpers';

export default function BibleItemRender({
    index,
    bibleItem,
    warningMessage,
    onContextMenu,
    fileSource,
}: {
    index: number,
    bibleItem: BibleItem,
    bible?: Bible;
    warningMessage?: string,
    onContextMenu?: (event: React.MouseEvent<any>,
        bibleItem: BibleItem, index: number) => void,
    fileSource?: FileSource,
}) {
    useFSEvents(['select'], fileSource);
    const title = useBibleItemRenderTitle(bibleItem);
    const onContextMenuCallback = useCallback((
        event: React.MouseEvent<any>) => {
        onContextMenu?.(event, bibleItem, index);
    }, [onContextMenu, bibleItem, index]);
    const changeBible = (newBibleKey: string) => {
        bibleItem.bibleKey = newBibleKey;
        bibleItem.save();
    };
    if (bibleItem.isError) {
        return (
            <ItemReadError onContextMenu={onContextMenuCallback} />
        );
    }
    const { isSelected } = bibleItem;
    return (
        <li className={'list-group-item item pointer '
            + `${isSelected ? 'active' : ''}`}
            title={title}
            data-index={index + 1}
            draggable
            onDragStart={(event) => {
                handleDragStart(event, bibleItem);
            }}
            onContextMenu={onContextMenuCallback}
            onClick={(event) => {
                event.stopPropagation();
                if (isSelected && !getIsPreviewingBible()) {
                    previewingEventListener.selectBibleItem(bibleItem);
                    return;
                }
                bibleItem.isSelected = !isSelected;
            }}>
            <div className='d-flex'>
                <ItemColorNote item={bibleItem} />
                <div className='px-1'>
                    <BibleSelectionMini
                        value={bibleItem.bibleKey}
                        onChange={(_, newValue) => {
                            changeBible(newValue);
                        }}
                        isMinimal />
                </div>
                <span className='app-ellipsis'>
                    {title === null ? 'not found' : title}
                </span>
                {warningMessage && <span className='float-end'
                    title={warningMessage}>⚠️</span>}
            </div>
        </li >
    );
}
