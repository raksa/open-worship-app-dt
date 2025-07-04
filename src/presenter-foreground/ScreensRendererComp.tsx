import ShowingScreenIcon from '../_screen/preview/ShowingScreenIcon';

export default function ScreensRendererComp<T>({
    buttonTitle,
    showingScreenIdDataList,
    handleForegroundHiding,
    isMini = false,
}: Readonly<{
    buttonTitle: string;
    showingScreenIdDataList: [number, T][];
    handleForegroundHiding: (screenId: number, data: T) => void;
    isMini?: boolean;
}>) {
    if (showingScreenIdDataList.length === 0) {
        return null;
    }
    return (
        <div className="d-flex mt-2 p-1 app-border-white-round">
            {showingScreenIdDataList.map(([screenId, data], i) => {
                return (
                    <div
                        className="d-flex app-caught-hover-pointer"
                        key={screenId + '-' + i}
                        onClick={handleForegroundHiding.bind(
                            null,
                            screenId,
                            data,
                        )}
                    >
                        {!isMini ? (
                            <button className="btn btn-secondary">
                                {buttonTitle}
                            </button>
                        ) : null}
                        <div className="input-group-text">
                            <ShowingScreenIcon screenId={screenId} />
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
