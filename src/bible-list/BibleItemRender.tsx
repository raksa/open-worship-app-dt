import { showAppContextMenu } from '../others/AppContextMenu';
import bibleHelper, {
    useGetBibleWithStatus,
} from '../bible-helper/bibleHelpers';
import BibleItemColorNote from './BibleItemColorNote';
import Bible from './Bible';
import BibleItem, { usePresentRenderTitle } from './BibleItem';

export default function BibleItemRender({
    index, bibleItem, warningMessage,
    onContextMenu, onUpdateBiblePresent,
}: {
    index: number,
    bibleItem: BibleItem,
    bible?: Bible;
    warningMessage?: string,
    onContextMenu?: (e: React.MouseEvent<HTMLLIElement, MouseEvent>) => void,
    onUpdateBiblePresent?: (newBiblePresent: BibleItem) => void,
}) {
    const title = usePresentRenderTitle(bibleItem);
    const bibleStatus = useGetBibleWithStatus(bibleItem.bible);
    const changeBible = onUpdateBiblePresent ? (newBible: string) => {
        bibleItem.bible = newBible;
        onUpdateBiblePresent(bibleItem);
    } : null;
    return (
        <li className={`list-group-item item ${bibleItem.isSelected ? 'active' : ''}`}
            data-index={index + 1}
            onContextMenu={onContextMenu || (() => false)}
            onClick={() => {
                bibleItem.isSelected = !bibleItem.isSelected;
            }}>
            <span className={changeBible ? 'bible' : ''} onClick={async (e) => {
                if (!changeBible) {
                    return;
                }
                e.stopPropagation();
                const bibleList = await bibleHelper.getBibleListWithStatus();
                const currentBible = bibleItem.bible;
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
            <BibleItemColorNote
                bibleItem={bibleItem}
                onUpdateBiblePresent={onUpdateBiblePresent} />
        </li >
    );
}
