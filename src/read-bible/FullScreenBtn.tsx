const enterFullScreen = async () => {
    if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        return true;
    }
    return false;
};
const exitFullScreen = async () => {
    if (document.exitFullscreen) {
        await document.exitFullscreen();
        return false;
    }
    return true;
};

export const genFullScreenClassName = (isFulledScreen: boolean) => {
    return isFulledScreen ? 'fullscreen-exit' : 'arrows-fullscreen';
};

let onFullscreenChange: (() => void) | null = null;
function removeFSListener() {
    if (onFullscreenChange === null) {
        return;
    }
    document.removeEventListener(
        'fullscreenchange', onFullscreenChange,
    );
    onFullscreenChange = null;
}

export default function FullScreenBtn({
    isFulledScreen, setIsFullScreen,
}: Readonly<{
    isFulledScreen: boolean,
    setIsFullScreen: (isFullScreen: boolean) => void,
}>) {
    return (
        <div style={{ overflow: 'hidden' }}>
            <button className='btn btn-info btn-sm'
                onClick={async () => {
                    const action = (
                        isFulledScreen ? exitFullScreen : enterFullScreen
                    );
                    const isFulledScreenSuccess = await action();
                    removeFSListener();
                    onFullscreenChange = () => {
                        setIsFullScreen(!!document.fullscreenElement);
                        removeFSListener();
                    };
                    document.addEventListener(
                        'fullscreenchange', onFullscreenChange,
                    );
                    setIsFullScreen(isFulledScreenSuccess);
                }}>
                <i className={
                    `bi bi-${genFullScreenClassName(isFulledScreen)}`
                } />
                {isFulledScreen ? 'Exit ' : ''}Full
            </button>
        </div>
    );
}
