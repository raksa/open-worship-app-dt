import RenderVerseOptionsComp from './RenderVerseOptionsComp';
import RenderActionButtonsComp, {
    useFoundActionKeyboard,
} from './RenderActionButtonsComp';
import {
    BibleViewTextComp,
    RenderTitleMaterialComp,
} from '../bible-reader/BibleViewExtra';
import { showAppContextMenu } from '../context-menu/AppContextMenuComp';
import { genDefaultBibleItemContextMenu } from '../bible-list/bibleItemHelpers';
import {
    fontSizeToHeightStyle,
    useBibleViewFontSizeContext,
} from '../helper/bibleViewHelpers';
import { closeCurrentEditingBibleItem } from '../bible-reader/readBibleHelpers';
import { toShortcutKey } from '../event/KeyboardEventListener';
import { useBibleItemContext } from '../bible-reader/BibleItemContext';
import { genInputText } from '../bible-list/bibleHelpers';
import LookupBibleItemViewController, {
    closeEventMapper,
} from '../bible-reader/LookupBibleItemViewController';
import RenderToTheTopComp from '../others/RenderToTheTopComp';

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
    const uuid = crypto.randomUUID();
    return (
        <div
            id={`uuid-${uuid}`}
            className="card border-success w-100 h-100"
            onContextMenu={async (event) => {
                showAppContextMenu(event as any, [
                    ...genDefaultBibleItemContextMenu(bibleItem),
                    ...(await viewController.genContextMenu(
                        viewController.selectedBibleItem,
                        uuid,
                    )),
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
                <RenderToTheTopComp style={{ bottom: '60px' }} />
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
        viewController.bibleKey = newBibleKey;
        viewController.inputText = newText;
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
