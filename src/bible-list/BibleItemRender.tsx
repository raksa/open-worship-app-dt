import { useCallback } from 'react';
import Bible from './Bible';
import BibleItem from './BibleItem';
import ItemReadError from '../others/ItemReadError';
import { useFSEvents } from '../helper/dirSourceHelpers';
import { handleDragStart } from '../helper/dragHelpers';
import ItemColorNote from '../others/ItemColorNote';
import {
    BibleSelectionMini,
} from '../bible-search/BibleSelection';
import {
    useBibleItemRenderTitle,
} from '../helper/bible-helpers/bibleRenderHelpers';
import BibleItemViewController from '../read-bible/BibleItemViewController';
import PresentFTManager from '../_present/PresentFTManager';
import { checkIsWindowPresentingMode } from '../router/routeHelpers';

export default function BibleItemRender({
    index, bibleItem, warningMessage, onContextMenu, filePath,
}: {
    index: number,
    bibleItem: BibleItem,
    bible?: Bible;
    warningMessage?: string,
    onContextMenu?: (
        event: React.MouseEvent<any>, bibleItem: BibleItem, index: number,
    ) => void,
    filePath?: string,
}) {
    useFSEvents(['select'], filePath);
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
    return (
        <li className='list-group-item item pointer'
            title={title}
            data-index={index + 1}
            draggable
            onDragStart={(event) => {
                handleDragStart(event, bibleItem);
            }}
            onDoubleClick={(event) => {
                BibleItemViewController.getInstance().bibleItems = [bibleItem];
                if (checkIsWindowPresentingMode()) {
                    PresentFTManager.ftBibleItemSelect(event, [bibleItem]);
                }
            }}
            onContextMenu={onContextMenuCallback}>
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
                    {title || 'not found'}
                </span>
                {warningMessage && <span className='float-end'
                    title={warningMessage}>⚠️</span>}
            </div>
        </li >
    );
}
