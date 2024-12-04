import './BibleView.scss';

import BibleItem from '../bible-list/BibleItem';
import {
    showAppContextMenu,
} from '../others/AppContextMenu';
import {
    useBibleItemViewControllerContext,
} from './BibleItemViewController';
import {
    applyDragged, genDraggingClass, removeDraggingClass,
} from './readBibleHelper';
import {
    BibleViewText, RenderHeader,
} from './BibleViewExtra';
import {
    genDefaultBibleItemContextMenu,
} from '../bible-list/bibleItemHelpers';
import { BibleItemContext } from './BibleItemContext';
import { useWindowMode } from '../router/routeHelpers';

export default function BibleView({ bibleItem }: Readonly<{
    bibleItem: BibleItem,
}>) {
    const windowMode = useWindowMode();
    const viewController = useBibleItemViewControllerContext();
    return (
        <BibleItemContext.Provider value={bibleItem}>
            <div className='bible-view card flex-fill w-100 h-100'
                style={{ minWidth: '30%' }}
                onDragOver={(event) => {
                    event.preventDefault();
                    removeDraggingClass(event);
                    const className = genDraggingClass(event);
                    event.currentTarget.classList.add(className);
                }}
                onDragLeave={(event) => {
                    event.preventDefault();
                    removeDraggingClass(event);
                }}
                onDrop={async (event) => {
                    applyDragged(event, viewController, bibleItem);
                }}
                onContextMenu={(event: any) => {
                    showAppContextMenu(event, [
                        ...genDefaultBibleItemContextMenu(bibleItem),
                        ...viewController.genContextMenu(
                            bibleItem, windowMode,
                        ),
                    ]);
                }}>
                <RenderHeader
                    onChange={(_oldBibleKey: string, newBibleKey: string) => {
                        const newBibleItem = bibleItem.clone(true);
                        newBibleItem.bibleKey = newBibleKey;
                        viewController.changeBibleItem(
                            bibleItem, newBibleItem,
                        );
                    }}
                    onClose={() => {
                        viewController.removeBibleItem(bibleItem);
                    }}
                />
                <div className='card-body p-3'>
                    <BibleViewText />
                    {/* TODO: implement this
                <RefRenderer /> */}
                </div>
            </div>
        </BibleItemContext.Provider>
    );
}
