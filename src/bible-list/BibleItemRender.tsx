import { showAppContextMenu } from '../others/AppContextMenu';
import bibleHelper, {
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
    index, bibleItem, warningMessage,
    onContextMenu, fileSource,
}: {
    index: number,
    bibleItem: BibleItem,
    bible?: Bible;
    warningMessage?: string,
    onContextMenu?: (event: React.MouseEvent<HTMLLIElement, MouseEvent>) => void,
    fileSource?: FileSource,
}) {
    useFSEvents(['select'], fileSource);
    const title = useBibleItemRenderTitle(bibleItem);
    const bibleStatus = useGetBibleWithStatus(bibleItem.bibleName);
    const changeBible = (newBibleName: string) => {
        bibleItem.bibleName = newBibleName;
        bibleItem.save();
    };
    if (bibleItem.isError) {
        return (
            <ItemReadError onContextMenu={onContextMenu || (() => false)} />
        );
    }
    return (
        <li className={`list-group-item item pointer ${bibleItem.isSelected ? 'active' : ''}`}
            data-index={index + 1}
            draggable
            onDragStart={(event) => {
                const bibleItemJson = bibleItem.toJson();
                PresentFTManager.startPresentDrag(bibleItemJson);
                (bibleItemJson as any).filePath = bibleItem.fileSource?.filePath;
                event.dataTransfer.setData('text/plain', JSON.stringify(bibleItemJson));
            }}
            onContextMenu={onContextMenu || (() => false)}
            onClick={(event) => {
                event.stopPropagation();
                if (bibleItem.isSelected && !getIsPreviewingBible()) {
                    previewingEventListener.selectBibleItem(bibleItem);
                    return;
                }
                bibleItem.isSelected = !bibleItem.isSelected;
            }}>
            <span className={'bible'}
                onClick={async (event) => {
                    if (!changeBible) {
                        return;
                    }
                    event.stopPropagation();
                    const bibleList = await bibleHelper.getBibleListWithStatus();
                    const currentBible = bibleItem.bibleName;
                    const bibleListFiltered = bibleList.filter(([bibleName]) => {
                        return currentBible !== bibleName;
                    });
                    showAppContextMenu(event, bibleListFiltered.map(([bibleName, isAvailable]) => {
                        return {
                            title: bibleName, disabled: !isAvailable, onClick: () => {
                                changeBible(bibleName);
                            },
                        };
                    }));
                }}>
                <i className='bi bi-bookmark' />
                {bibleStatus === null ? null : bibleStatus[2]}
            </span> | {title === null ? 'not found' : title}
            {warningMessage && <span className='float-end'
                title={warningMessage}>⚠️</span>}
            <ItemColorNote item={bibleItem} />
        </li >
    );
}
