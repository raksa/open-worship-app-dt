export default function BibleSearchHeaderComp({
    handleSearch,
    isSearching,
    inputText,
    setInputText,
}: Readonly<{
    handleSearch: (isFresh?: boolean) => void;
    isSearching: boolean;
    inputText: string;
    setInputText: (_: string) => void;
}>) {
    return (
        <>
            <input
                type="text"
                className="form-control"
                value={inputText}
                onKeyUp={(event) => {
                    if (event.key === 'Enter') {
                        event.preventDefault();
                        event.stopPropagation();
                        handleSearch(true);
                    }
                }}
                onChange={(event) => {
                    const value = event.target.value;
                    setInputText(value);
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
