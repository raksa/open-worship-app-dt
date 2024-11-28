import { useCallback } from 'react';

import Bible from './Bible';
import BibleItem from './BibleItem';
import ItemReadError from '../others/ItemReadError';
import { useFSEvents } from '../helper/dirSourceHelpers';
import { handleDragStart } from './dragHelpers';
import ItemColorNote from '../others/ItemColorNote';
import {
    BibleSelectionMini,
} from '../bible-search/BibleSelection';
import {
    useBibleItemViewControllerContext,
} from '../read-bible/BibleItemViewController';
import ScreenFTManager from '../_screen/ScreenFTManager';
import {
    checkIsWindowPresenterMode, useWindowMode,
} from '../router/routeHelpers';
import {
    openBibleItemContextMenu, useBibleItemRenderTitle,
} from './bibleItemHelpers';
import { useOpenBibleSearch } from '../bible-search/BibleSearchHeader';

export default function BibleItemRender({
    index, bibleItem, warningMessage, filePath,
}: Readonly<{
    index: number,
    bibleItem: BibleItem,
    warningMessage?: string,
    filePath?: string,
}>) {
    const bibleItemViewController = useBibleItemViewControllerContext();
    const openBibleSearch = useOpenBibleSearch(bibleItem);
    const windowMode = useWindowMode();
    useFSEvents(['select'], filePath);
    const title = useBibleItemRenderTitle(bibleItem);
    const onContextMenuCallback = useCallback(
        (event: React.MouseEvent<any>) => {
            openBibleItemContextMenu(
                event, bibleItem, index, windowMode, openBibleSearch,
            );
        },
        [bibleItem, index],
    );
    const changeBible = async (newBibleKey: string) => {
        const bible = bibleItem.filePath ?
            await Bible.readFileToData(bibleItem.filePath) : null;
        if (!bible) {
            return;
        }
        bibleItem.bibleKey = newBibleKey;
        bibleItem.save(bible);
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
                if (checkIsWindowPresenterMode()) {
                    ScreenFTManager.ftBibleItemSelect(event, [bibleItem]);
                } else {
                    bibleItemViewController.appendBibleItem(bibleItem);
                }
            }}
            onContextMenu={onContextMenuCallback}>
            <div className='d-flex'>
                <ItemColorNote item={bibleItem} />
                <div className='px-1'>
                    <BibleSelectionMini
                        bibleKey={bibleItem.bibleKey}
                        onBibleKeyChange={(_, newValue) => {
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
