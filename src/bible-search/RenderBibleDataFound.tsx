import RenderVerseOptions from './RenderVerseOptions';
import RenderActionButtons, {
    useFoundActionKeyboard,
} from './RenderActionButtons';
import {
    BibleViewText, RenderTitleMaterial,
} from '../bible-reader/BibleViewExtra';
import { showAppContextMenu } from '../others/AppContextMenu';
import {
    genDefaultBibleItemContextMenu,
} from '../bible-list/bibleItemHelpers';
import {
    closeEventMapper, SearchBibleItemViewController,
} from '../bible-reader/BibleItemViewController';
import { useWindowMode } from '../router/routeHelpers';
import {
    fontSizeToHeightStyle, useBibleViewFontSizeContext,
} from '../helper/bibleViewHelpers';
import { closeCurrentEditingBibleItem } from '../bible-reader/readBibleHelpers';
import { toShortcutKey } from '../event/KeyboardEventListener';
import { useBibleItemContext } from '../bible-reader/BibleItemContext';

export default function RenderBibleDataFound({
    onVerseChange,
}: Readonly<{
    onVerseChange?: (verseStart?: number, verseEnd?: number) => void,
}>) {
    const bibleItem = useBibleItemContext();
    const windowMode = useWindowMode();
    const isSearching = onVerseChange !== undefined;
    useFoundActionKeyboard(bibleItem);
    const viewController = SearchBibleItemViewController.getInstance();
    viewController.selectedBibleItem.syncData(bibleItem);
    return (
        <div className='card border-success w-100 h-100'
            onContextMenu={(event) => {
                showAppContextMenu(event as any, [
                    ...genDefaultBibleItemContextMenu(bibleItem),
                    ...viewController.genContextMenu(
                        viewController.selectedBibleItem, windowMode,
                    ),
                ]);
            }}>
            <RenderBibleFoundHeader />
            <div className='card-body bg-transparent border-success p-0'>
                {!isSearching ? null : (
                    <RenderVerseOptions
                        onVersesChange={onVerseChange}
                    />
                )}
                <div className='p-2'>
                    <BibleViewText />
                </div>
            </div>
        </div>
    );
}

function RenderBibleFoundHeader() {
    const fontSize = useBibleViewFontSizeContext();
    const viewController = SearchBibleItemViewController.getInstance();
    return (
        <div className='card-header bg-transparent border-success'
            style={fontSizeToHeightStyle(fontSize)}>
            <div className='d-flex w-100 h-100'>
                <RenderTitleMaterial
                    editingBibleItem={viewController.selectedBibleItem}
                />
                <div>
                    <RenderActionButtons />
                </div>
                <div>
                    {viewController.isAlone ? null : (
                        <button className='btn-close'
                            data-tool-tip={toShortcutKey(closeEventMapper)}
                            onClick={() => {
                                closeCurrentEditingBibleItem();
                            }}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
