import Bible from './Bible';
import BibleItem from './BibleItem';
import ItemReadError from '../others/ItemReadError';
import { useFileSourceRefreshEvents } from '../helper/dirSourceHelpers';
import { handleDragStart } from '../helper/dragHelpers';
import ItemColorNote from '../others/ItemColorNote';
import {
    BibleSelectionMini,
} from '../bible-search/BibleSelection';
import {
    SearchBibleItemViewController, useBibleItemViewControllerContext,
} from '../bible-reader/BibleItemViewController';
import ScreenFullTextManager from '../_screen/ScreenFullTextManager';
import {
    openBibleItemContextMenu, useBibleItemRenderTitle,
} from './bibleItemHelpers';
import {
    useShowBibleSearchContext,
} from '../others/commonButtons';
import appProvider from '../server/appProvider';

export default function BibleItemRender({
    index, bibleItem, warningMessage, filePath,
}: Readonly<{
    index: number,
    bibleItem: BibleItem,
    warningMessage?: string,
    filePath?: string,
}>) {
    const showBibleSearchPopup = useShowBibleSearchContext();
    const viewController = useBibleItemViewControllerContext();
    useFileSourceRefreshEvents(['select'], filePath);
    const title = useBibleItemRenderTitle(bibleItem);
    const changeBible = async (newBibleKey: string) => {
        const bible = bibleItem.filePath ?
            await Bible.readFileToData(bibleItem.filePath) : null;
        if (!bible) {
            return;
        }
        bibleItem.bibleKey = newBibleKey;
        bibleItem.save(bible);
    };
    const handleContextMenuOpening = (event: React.MouseEvent<any>) => {
        openBibleItemContextMenu(
            event, bibleItem, index, showBibleSearchPopup,
        );
    };
    const handleDoubleClicking = (event: any) => {
        if (appProvider.isPagePresenter) {
            ScreenFullTextManager.handleBibleItemSelecting(event, [bibleItem]);
        } else if (appProvider.isPageReader) {
            const searchViewController = (
                SearchBibleItemViewController.getInstance()
            );
            if (event.shiftKey) {
                searchViewController.addBibleItemRight(
                    searchViewController.selectedBibleItem, bibleItem,
                );
            } else {
                searchViewController.setSearchingContentFromBibleItem(
                    bibleItem,
                );
            }
        } else {
            viewController.appendBibleItem(bibleItem);
        }
    };

    if (bibleItem.isError) {
        return (
            <ItemReadError
                onContextMenu={handleContextMenuOpening}
            />
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
            onDoubleClick={handleDoubleClicking}
            onContextMenu={handleContextMenuOpening}>
            <div className='d-flex'>
                <ItemColorNote item={bibleItem} />
                <div className='px-1'>
                    <BibleSelectionMini
                        bibleKey={bibleItem.bibleKey}
                        onBibleKeyChange={(_, newValue) => {
                            changeBible(newValue);
                        }}
                        isMinimal
                    />
                </div>
                <span className='app-ellipsis'>
                    {title || 'not found'}
                </span>
                {warningMessage && (
                    <span className='float-end' title={warningMessage}>⚠️</span>
                )}
            </div>
        </li >
    );
}
