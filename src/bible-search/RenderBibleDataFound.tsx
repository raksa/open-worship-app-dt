import BibleItem from '../bible-list/BibleItem';
import RenderVerseOptions from './RenderVerseOptions';
import RenderActionButtons, {
    useFoundActionKeyboard,
} from './RenderActionButtons';
import {
    BibleViewText, BibleViewTitle,
} from '../read-bible/BibleViewExtra';
import { showAppContextMenu } from '../others/AppContextMenu';
import {
    genDefaultBibleItemContextMenu,
} from '../bible-list/bibleItemHelpers';
import {
    SearchBibleItemViewController,
} from '../read-bible/BibleItemViewController';
import { useWindowMode } from '../router/routeHelpers';
import {
    fontSizeToHeightStyle, useBibleViewFontSize,
} from '../helper/bibleViewHelpers';
import { closeCurrentEditingBibleItem } from '../read-bible/readBibleHelper';
import { EventMapper, toShortcutKey } from '../event/KeyboardEventListener';

export const closeEventMapper: EventMapper = {
    wControlKey: ['Ctrl'],
    lControlKey: ['Ctrl'],
    mControlKey: ['Meta'],
    key: 'w',
};

export default function RenderBibleDataFound({
    bibleItem, onVerseChange,
}: Readonly<{
    bibleItem: BibleItem,
    onVerseChange?: (verseStart?: number, verseEnd?: number) => void,
}>) {
    const windowMode = useWindowMode();
    const isSearching = onVerseChange !== undefined;
    useFoundActionKeyboard(bibleItem);
    const bibleItemViewController = SearchBibleItemViewController.getInstance();
    bibleItemViewController.selectedBibleItem.syncData(bibleItem);
    return (
        <div className='card border-success w-100 h-100'
            onContextMenu={(event) => {
                showAppContextMenu(event as any, [
                    ...genDefaultBibleItemContextMenu(bibleItem),
                    ...bibleItemViewController.genContextMenu(
                        bibleItemViewController.selectedBibleItem, windowMode,
                    ),
                ]);
            }}>
            <RenderBibleFoundHeader bibleItem={bibleItem} />
            <div className='card-body bg-transparent border-success p-0'>
                {!isSearching ? null : (
                    <RenderVerseOptions
                        bibleItem={bibleItem}
                        onVersesChange={onVerseChange}
                    />
                )}
                <div className='p-2'>
                    <BibleViewText bibleItem={bibleItem} />
                </div>
            </div>
        </div>
    );
}

function RenderBibleFoundHeader({ bibleItem }: Readonly<{
    bibleItem: BibleItem,
}>) {
    const fontSize = useBibleViewFontSize();
    const viewController = SearchBibleItemViewController.getInstance();
    return (
        <div className='card-header bg-transparent border-success'
            style={fontSizeToHeightStyle(fontSize)}>
            <div className='d-flex w-100 h-100'>
                <div className='flex-fill text-nowrap'>
                    <BibleViewTitle bibleItem={bibleItem} />
                </div>
                <div>
                    <RenderActionButtons bibleItem={bibleItem} />
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
