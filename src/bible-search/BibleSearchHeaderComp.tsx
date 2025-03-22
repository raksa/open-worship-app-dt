import { useState } from 'react';
import { useBibleSearchController } from './BibleSearchController';
import { sanitizeSearchingText } from '../lang';
import { showAppContextMenu } from '../others/AppContextMenuComp';
function cumulativeOffset(element: HTMLElement | null) {
    let top = 0;
    let left = 0;
    do {
        if (!element) {
            break;
        }
        top += element.offsetTop ?? 0;
        left += element.offsetLeft ?? 0;
        element = element.offsetParent as HTMLElement;
    } while (element);
    return { top, left };
}
export default function BibleSearchHeaderComp({
    handleSearch,
    isSearching,
}: Readonly<{
    handleSearch: (isFresh?: boolean) => void;
    isSearching: boolean;
}>) {
    const bibleSearchController = useBibleSearchController();
    const [inputText, setInputText] = useState(
        bibleSearchController.searchText,
    );
    const handleTextChange = async (event: any) => {
        if (bibleSearchController.searchText === event.currentTarget.value) {
            return;
        }
        setInputText(bibleSearchController.searchText);
        bibleSearchController.closeSuggestionMenu();
        const text = (bibleSearchController.searchText =
            event.currentTarget.value);
        const lookupWord =
            (
                (await sanitizeSearchingText(
                    bibleSearchController.locale,
                    text,
                )) ?? ''
            )
                .split(' ')
                .at(-1) ?? '';
        const suggestWords = await bibleSearchController.loadSuggestionWords(
            lookupWord,
            100,
        );
        if (!suggestWords.length) {
            return;
        }
        const currentTarget: HTMLInputElement = event.target;
        const { top, left } = cumulativeOffset(currentTarget);
        bibleSearchController.contextMenuController = showAppContextMenu(
            event,
            suggestWords.map((text) => ({
                menuTitle: text,
                onClick: () => {
                    bibleSearchController.searchText = text;
                    currentTarget.value = text;
                    setInputText(bibleSearchController.searchText);
                },
            })),
            {
                coord: { x: left, y: top + currentTarget.offsetHeight },
                maxHeigh: 200,
                style: {
                    backgroundColor: 'rgba(128, 128, 128, 0.4)',
                    backdropFilter: 'blur(5px)',
                    opacity: 0.9,
                },
            },
        );
    };
    return (
        <>
            <input
                type="text"
                className="form-control"
                onKeyUp={(event) => {
                    if (event.key === 'Enter') {
                        event.preventDefault();
                        event.stopPropagation();
                        handleSearch(true);
                        return;
                    }
                    handleTextChange(event);
                }}
            />
            <button
                className="btn btn-sm"
                disabled={isSearching || !inputText}
                onClick={() => {
                    handleSearch(true);
                }}
            >
                <i className="bi bi-search" />
            </button>
        </>
    );
}
