import Bible from './Bible';
import BibleItem from './BibleItem';
import ItemReadErrorComp from '../others/ItemReadErrorComp';
import { useFileSourceRefreshEvents } from '../helper/dirSourceHelpers';
import { handleDragStart } from '../helper/dragHelpers';
import ItemColorNoteComp from '../others/ItemColorNoteComp';
import { BibleSelectionMiniComp } from '../bible-lookup/BibleSelectionComp';
import {
    LookupBibleItemViewController,
    useBibleItemViewControllerContext,
} from '../bible-reader/BibleItemViewController';
import ScreenFullTextManager from '../_screen/managers/ScreenFullTextManager';
import {
    openBibleItemContextMenu,
    useBibleItemRenderTitle,
} from './bibleItemHelpers';
import { useShowBibleLookupContext } from '../others/commonButtons';
import appProvider from '../server/appProvider';

export default function BibleItemRenderComp({
    index,
    bibleItem,
    warningMessage,
    filePath,
}: Readonly<{
    index: number;
    bibleItem: BibleItem;
    warningMessage?: string;
    filePath?: string;
}>) {
    const showBibleLookupPopup = useShowBibleLookupContext();
    const viewController = useBibleItemViewControllerContext();
    useFileSourceRefreshEvents(['select'], filePath);
    const title = useBibleItemRenderTitle(bibleItem);
    const changeBible = async (newBibleKey: string) => {
        const bible = bibleItem.filePath
            ? await Bible.fromFilePath(bibleItem.filePath)
            : null;
        if (!bible) {
            return;
        }
        bibleItem.bibleKey = newBibleKey;
        bibleItem.save(bible);
    };
    const handleContextMenuOpening = (event: React.MouseEvent<any>) => {
        openBibleItemContextMenu(event, bibleItem, index, showBibleLookupPopup);
    };
    const handleDoubleClicking = (event: any) => {
        if (appProvider.isPagePresenter) {
            ScreenFullTextManager.handleBibleItemSelecting(event, [bibleItem]);
        } else if (appProvider.isPageReader) {
            const lookupViewController =
                LookupBibleItemViewController.getInstance();
            if (event.shiftKey) {
                lookupViewController.addBibleItemRight(
                    lookupViewController.selectedBibleItem,
                    bibleItem,
                );
            } else {
                lookupViewController.setLookupContentFromBibleItem(bibleItem);
            }
        } else {
            viewController.appendBibleItem(bibleItem);
        }
    };

    if (bibleItem.isError) {
        return <ItemReadErrorComp onContextMenu={handleContextMenuOpening} />;
    }

    return (
        <li
            className="list-group-item item pointer"
            title={title}
            data-index={index + 1}
            draggable
            onDragStart={(event) => {
                handleDragStart(event, bibleItem);
            }}
            onDoubleClick={handleDoubleClicking}
            onContextMenu={handleContextMenuOpening}
        >
            <div className="d-flex">
                <ItemColorNoteComp item={bibleItem} />
                <div className="px-1">
                    <BibleSelectionMiniComp
                        bibleKey={bibleItem.bibleKey}
                        onBibleKeyChange={(_, newValue) => {
                            changeBible(newValue);
                        }}
                        isMinimal
                    />
                </div>
                <span className="app-ellipsis">{title || 'not found'}</span>
                {warningMessage && (
                    <span className="float-end" title={warningMessage}>
                        ⚠️
                    </span>
                )}
            </div>
        </li>
    );
}
