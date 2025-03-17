import RenderVerseOptionsComp from './RenderVerseOptionsComp';
import RenderActionButtonsComp, {
    useFoundActionKeyboard,
} from './RenderActionButtonsComp';
import {
    BibleViewTextComp,
    RenderTitleMaterialComp,
} from '../bible-reader/BibleViewExtra';
import { showAppContextMenu } from '../others/AppContextMenuComp';
import { genDefaultBibleItemContextMenu } from '../bible-list/bibleItemHelpers';
import {
    closeEventMapper,
    LookupBibleItemViewController,
} from '../bible-reader/BibleItemViewController';
import {
    fontSizeToHeightStyle,
    useBibleViewFontSizeContext,
} from '../helper/bibleViewHelpers';
import { closeCurrentEditingBibleItem } from '../bible-reader/readBibleHelpers';
import { toShortcutKey } from '../event/KeyboardEventListener';
import { useBibleItemContext } from '../bible-reader/BibleItemContext';
import { genInputText } from '../bible-list/bibleHelpers';

export default function RenderBibleDataFoundComp({
    onVerseChange,
}: Readonly<{
    onVerseChange?: (verseStart?: number, verseEnd?: number) => void;
}>) {
    const bibleItem = useBibleItemContext();
    const isLookup = onVerseChange !== undefined;
    useFoundActionKeyboard(bibleItem);
    const viewController = LookupBibleItemViewController.getInstance();
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
                {!isLookup ? null : (
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
    const viewController = LookupBibleItemViewController.getInstance();
    const handleBibleKeyChanging = async (
        oldBibleKey: string,
        newBibleKey: string,
    ) => {
        const inputText = await viewController.selectedBibleItem?.toTitle();
        const newText = await genInputText(oldBibleKey, newBibleKey, inputText);
        viewController.setInputText(newText);
        viewController.setBibleKey(newBibleKey);
    };
    return (
        <div
            className="card-header bg-transparent border-success"
            style={fontSizeToHeightStyle(fontSize)}
        >
            <div className="d-flex w-100 h-100">
                <RenderTitleMaterialComp
                    editingBibleItem={viewController.selectedBibleItem}
                    onBibleKeyChange={handleBibleKeyChanging}
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
