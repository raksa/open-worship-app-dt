import BibleItem from '../bible-list/BibleItem';
import RenderVerseOptions from './RenderVerseOptions';
import RenderActionButtons, {
    genFoundBibleItemContextMenu, useFoundActionKeyboard,
} from './RenderActionButtons';
import {
    BibleViewText, BibleViewTitle,
} from '../read-bible/BibleViewExtra';
import { showAppContextMenu } from '../others/AppContextMenu';
import {
    genDefaultBibleItemContextMenu,
} from '../bible-list/bibleItemHelpers';
import { useWindowMode } from '../router/routeHelpers';

export default function RenderBibleDataFound({
    bibleItem, onVerseChange,
}: Readonly<{
    bibleItem: BibleItem,
    onVerseChange?: (verseStart?: number, verseEnd?: number) => void,
}>) {
    const windowMode = useWindowMode();
    const isSearching = onVerseChange !== undefined;
    useFoundActionKeyboard(bibleItem);
    return (
        <div className='card border-success mt-1 w-100 h-100'
            onContextMenu={(event) => {
                if (windowMode === null) {
                    return;
                }
                showAppContextMenu(event as any, [
                    ...genFoundBibleItemContextMenu(
                        bibleItem, windowMode,
                        true,
                    ),
                    ...genDefaultBibleItemContextMenu(bibleItem),
                ]);
            }}
            style={{
                height: '10px',
            }}>
            {renderHeader(bibleItem)}
            <div className={
                'card-body bg-transparent border-success p-0'
            }>
                {!isSearching ? null :
                    <RenderVerseOptions
                        bibleItem={bibleItem}
                        onVersesChange={onVerseChange} />
                }
                <div className='p-2'>
                    <BibleViewText
                        bibleItem={bibleItem}
                    />
                </div>
            </div>
        </div>
    );
}

function renderHeader(
    bibleItem: BibleItem,
) {
    return (
        <div className='card-header bg-transparent border-success'>
            <div className='d-flex w-100 h-100'>
                <div className='flex-fill text-nowrap'>
                    <BibleViewTitle bibleItem={bibleItem} />
                </div>
                <div>
                    <RenderActionButtons bibleItem={bibleItem} />
                </div>
            </div>
        </div>
    );
}
