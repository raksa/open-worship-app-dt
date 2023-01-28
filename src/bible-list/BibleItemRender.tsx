import { showAppContextMenu } from '../others/AppContextMenu';
import {
    getBibleInfoWithStatusList,
    useGetBibleWithStatus,
} from '../server/bible-helpers/bibleHelpers';
import ItemColorNote from '../others/ItemColorNote';
import Bible from './Bible';
import BibleItem, { useBibleItemRenderTitle } from './BibleItem';
import ItemReadError from '../others/ItemReadError';
import { getIsPreviewingBible } from '../full-text-present/FullTextPreviewer';
import { previewingEventListener } from '../event/PreviewingEventListener';
import FileSource from '../helper/FileSource';
import { useFSEvents } from '../helper/dirSourceHelpers';
import { useCallback } from 'react';
import { handleDragStart } from '../helper/DragInf';

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
    const bibleStatus = useGetBibleWithStatus(bibleItem.bibleKey);
    const onContextMenuCallback = useCallback((
        event: React.MouseEvent<any>) => {
        onContextMenu?.(event, bibleItem, index);
    }, [onContextMenu, bibleItem, index]);
    const changeBible = (newBibleKey: string) => {
        bibleItem.bibleKey = newBibleKey;
        bibleItem.save();
    };
    const startChangingBible = async (event: React.MouseEvent<any>) => {
        if (!changeBible) {
            return;
        }
        event.stopPropagation();
        const bibleList = await getBibleInfoWithStatusList();
        const currentBible = bibleItem.bibleKey;
        const bibleListFiltered = bibleList.filter(([bibleKey]) => {
            return currentBible !== bibleKey;
        });
        const menuOptions = bibleListFiltered
            .map(([bibleKey, isAvailable]) => {
                return {
                    title: bibleKey,
                    disabled: !isAvailable,
                    onClick: () => {
                        changeBible(bibleKey);
                    },
                };
            });
        showAppContextMenu(event as any, menuOptions);
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
            <span className={'bible'}
                onClick={startChangingBible}>
                <i className='bi bi-bookmark' />
                {bibleStatus === null ? null : bibleStatus[2]}
            </span> | {title === null ? 'not found' : title}
            {warningMessage && <span className='float-end'
                title={warningMessage}>⚠️</span>}
            <ItemColorNote item={bibleItem} />
        </li >
    );
}
