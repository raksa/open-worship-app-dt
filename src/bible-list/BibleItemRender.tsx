import { showAppContextMenu } from '../others/AppContextMenu';
import bibleHelper, {
    useGetBibleWithStatus,
} from '../bible-helper/bibleHelpers';
import BibleItemColorNote from './BibleItemColorNote';
import Bible from './Bible';
import BibleItem, { useBibleItemRenderTitle } from './BibleItem';
import ItemReadError from '../others/ItemReadError';

export default function BibleItemRender({
    index, bibleItem, warningMessage,
    onContextMenu,
}: {
    index: number,
    bibleItem: BibleItem,
    bible?: Bible;
    warningMessage?: string,
    onContextMenu?: (e: React.MouseEvent<HTMLLIElement, MouseEvent>) => void,
}) {
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
                const newBibleItem = bibleItem.toJson();
                newBibleItem.filePath = bibleItem.fileSource?.filePath;
                event.dataTransfer.setData('text/plain', JSON.stringify(newBibleItem));
            }}
            onContextMenu={onContextMenu || (() => false)}
            onClick={(e) => {
                e.stopPropagation();
                bibleItem.isSelected = !bibleItem.isSelected;
            }}>
            <span className={'bible'}
                onClick={async (e) => {
                    if (!changeBible) {
                        return;
                    }
                    e.stopPropagation();
                    const bibleList = await bibleHelper.getBibleListWithStatus();
                    const currentBible = bibleItem.bibleName;
                    const bibleListFiltered = bibleList.filter(([bibleName]) => {
                        return currentBible !== bibleName;
                    });
                    showAppContextMenu(e, bibleListFiltered.map(([bibleName, isAvailable]) => {
                        return {
                            title: bibleName, disabled: !isAvailable, onClick: () => {
                                changeBible(bibleName);
                            },
                        };
                    }));
                }}>
                <i className="bi bi-bookmark" />
                {bibleStatus === null ? null : bibleStatus[2]}
            </span> | {title == null ? 'not found' : title}
            {warningMessage && <span className='float-end'
                title={warningMessage}>⚠️</span>}
            <BibleItemColorNote item={bibleItem} />
        </li >
    );
}
