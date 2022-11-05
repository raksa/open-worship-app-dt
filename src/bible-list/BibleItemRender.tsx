import { showAppContextMenu } from '../others/AppContextMenu';
import {
    getBibleListWithStatus,
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
import PresentFTManager from '../_present/PresentFTManager';

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
    onContextMenu?: (_: React.MouseEvent<any>) => void,
    fileSource?: FileSource,
}) {
    useFSEvents(['select'], fileSource);
    const title = useBibleItemRenderTitle(bibleItem);
    const bibleStatus = useGetBibleWithStatus(bibleItem.bibleName);
    const changeBible = (newBibleName: string) => {
        console.log('changeBible', newBibleName);

        bibleItem.bibleName = newBibleName;
        bibleItem.save();
    };
    const startChangingBible = async (event: React.MouseEvent<any>) => {
        if (!changeBible) {
            return;
        }
        event.stopPropagation();
        const bibleList = await getBibleListWithStatus();
        const currentBible = bibleItem.bibleName;
        const bibleListFiltered = bibleList.filter(([bibleName]) => {
            return currentBible !== bibleName;
        });
        const menuOptions = bibleListFiltered.map(([bibleName, isAvailable]) => {
            return {
                title: bibleName,
                disabled: !isAvailable,
                onClick: () => {
                    changeBible(bibleName);
                },
            };
        });
        showAppContextMenu(event as any, menuOptions);
    };
    if (bibleItem.isError) {
        return (
            <ItemReadError onContextMenu={onContextMenu || (() => false)} />
        );
    }
    const { isSelected } = bibleItem;
    return (
        <li className={`list-group-item item pointer ${isSelected ? 'active' : ''}`}
            data-index={index + 1}
            draggable
            onDragStart={(event) => {
                const bibleItemJson = bibleItem.toJson();
                PresentFTManager.startPresentDrag(bibleItemJson);
                const filePath = bibleItem.fileSource?.filePath;
                (bibleItemJson as any).filePath = filePath;
                event.dataTransfer.setData('text/plain',
                    JSON.stringify(bibleItemJson));
            }}
            onContextMenu={onContextMenu || (() => false)}
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
