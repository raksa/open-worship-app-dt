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
} from '../bible-reader/BibleItemViewController';
import ScreenFTManager from '../_screen/ScreenFTManager';
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
    useFSEvents(['select'], filePath);
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
    const openContextMenu = (event: React.MouseEvent<any>) => {
        openBibleItemContextMenu(
            event, bibleItem, index, showBibleSearchPopup,
        );
    };

    if (bibleItem.isError) {
        return (
            <ItemReadError
                onContextMenu={openContextMenu}
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
            onDoubleClick={(event) => {
                if (appProvider.isPagePresenter) {
                    ScreenFTManager.ftBibleItemSelect(event, [bibleItem]);
                } else {
                    viewController.appendBibleItem(bibleItem);
                }
            }}
            onContextMenu={openContextMenu}>
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
