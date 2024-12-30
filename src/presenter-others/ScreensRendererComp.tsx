import ShowingScreenIcon from '../_screen/preview/ShowingScreenIcon';

export default function ScreensRendererComp({
    buttonTitle, showingScreenIds, handleMarqueeHiding,
}: Readonly<{
    buttonTitle: string,
    showingScreenIds: number[],
    handleMarqueeHiding: (screenId: number) => void,
}>) {
    if (showingScreenIds.length === 0) {
        return null;
    }
    return (
        <div className='d-flex mt-2 p-1 app-border-white-round'>
            {showingScreenIds.map((screenId) => {
                return (
                    <div className='d-flex' key={screenId}>
                        <button className='btn btn-secondary'
                            onClick={
                                handleMarqueeHiding.bind(null, screenId)
                            }>
                            {buttonTitle}
                        </button>
                        <div className='input-group-text'>
                            <ShowingScreenIcon screenId={screenId} />
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
