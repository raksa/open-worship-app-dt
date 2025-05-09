import { useState } from 'react';
import { useBibleSearchController } from './BibleSearchController';
import { useAppEffect } from '../helper/debuggerHelpers';

export default function BibleSearchHeaderComp({
    handleSearch,
    isSearching,
}: Readonly<{
    handleSearch: (isFresh?: boolean) => void;
    isSearching: boolean;
}>) {
    const [canSearch, setCanSearch] = useState(false);
    const bibleSearchController = useBibleSearchController();
    useAppEffect(() => {
        bibleSearchController.onTextChange = () => {
            setCanSearch(!!bibleSearchController.searchText);
        };
        return () => {
            bibleSearchController.onTextChange = () => {};
        };
    }, [bibleSearchController]);
    const keyUpHandling = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            if (bibleSearchController.isAddedByEnter) {
                bibleSearchController.isAddedByEnter = false;
                return;
            }
            event.preventDefault();
            event.stopPropagation();
            handleSearch(true);
            return;
        }
        bibleSearchController.handleKeyUp(event);
    };
    return (
        <>
            <input
                ref={(input) => {
                    bibleSearchController.input = input;
                    return () => {
                        bibleSearchController.input = null;
                    };
                }}
                data-bible-key={bibleSearchController.bibleKey}
                type="text"
                className="form-control"
                onKeyUp={keyUpHandling}
            />
            <button
                className="btn btn-sm"
                disabled={isSearching || !canSearch}
                onClick={() => {
                    handleSearch(true);
                }}
            >
                <i className="bi bi-search" />
            </button>
        </>
    );
}
