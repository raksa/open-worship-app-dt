import RenderVerseOptionsComp from './RenderVerseOptionsComp';
import RenderActionButtonsComp, {
    useFoundActionKeyboard,
} from './RenderActionButtonsComp';
import {
    BibleViewTextComp,
    RenderTitleMaterialComp,
} from '../bible-reader/bibleViewExtra';
import { showAppContextMenu } from '../others/AppContextMenuComp';
import { genDefaultBibleItemContextMenu } from '../bible-list/bibleItemHelpers';
import {
    closeEventMapper,
    SearchBibleItemViewController,
} from '../bible-reader/BibleItemViewController';
import {
    fontSizeToHeightStyle,
    useBibleViewFontSizeContext,
} from '../helper/bibleViewHelpers';
import { closeCurrentEditingBibleItem } from '../bible-reader/readBibleHelpers';
import { toShortcutKey } from '../event/KeyboardEventListener';
import { useBibleItemContext } from '../bible-reader/BibleItemContext';

export default function RenderBibleDataFoundComp({
    onVerseChange,
}: Readonly<{
    onVerseChange?: (verseStart?: number, verseEnd?: number) => void;
}>) {
    const bibleItem = useBibleItemContext();
    const isSearching = onVerseChange !== undefined;
    useFoundActionKeyboard(bibleItem);
    const viewController = SearchBibleItemViewController.getInstance();
    viewController.selectedBibleItem.syncData(bibleItem);
    return (
        <div
            className="card border-success w-100 h-100"
            onContextMenu={(event) => {
                showAppContextMenu(event as any, [
                    ...genDefaultBibleItemContextMenu(bibleItem),
                    ...viewController.genContextMenu(
                        viewController.selectedBibleItem,
                    ),
                ]);
            }}
        >
            <RenderBibleFoundHeader />
            <div className="card-body bg-transparent border-success p-0">
                {!isSearching ? null : (
                    <RenderVerseOptionsComp onVersesChange={onVerseChange} />
                )}
                <div className="p-2">
                    <BibleViewTextComp />
                </div>
            </div>
        </div>
    );
}

function RenderBibleFoundHeader() {
    const fontSize = useBibleViewFontSizeContext();
    const viewController = SearchBibleItemViewController.getInstance();
    return (
        <div
            className="card-header bg-transparent border-success"
            style={fontSizeToHeightStyle(fontSize)}
        >
            <div className="d-flex w-100 h-100">
                <RenderTitleMaterialComp
                    editingBibleItem={viewController.selectedBibleItem}
                />
                <div>
                    <RenderActionButtonsComp />
                </div>
                <div>
                    {viewController.isAlone ? null : (
                        <button
                            className="btn-close"
                            title={`Close [${toShortcutKey(closeEventMapper)}]`}
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
