import ShowingScreenIcon from '../_screen/preview/ShowingScreenIcon';

export default function ScreensRendererComp({
    buttonTitle,
    showingScreenIds,
    handleOtherHiding,
    isMini = false,
}: Readonly<{
    buttonTitle: string;
    showingScreenIds: number[];
    handleOtherHiding: (screenId: number) => void;
    isMini?: boolean;
}>) {
    if (showingScreenIds.length === 0) {
        return null;
    }
    return (
        <div className="d-flex mt-2 p-1 app-border-white-round">
            {showingScreenIds.map((screenId) => {
                return (
                    <div
                        className="d-flex app-caught-hover-pointer"
                        key={screenId}
                        onClick={handleOtherHiding.bind(null, screenId)}
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
