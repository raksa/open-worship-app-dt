async function enterFullScreen() {
    if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        return true;
    }
    return false;
}
async function exitFullScreen() {
    if (document.exitFullscreen) {
        await document.exitFullscreen();
        return false;
    }
    return true;
}

let onFullscreenChange: (() => void) | null = null;
function removeFullScreenListener() {
    if (onFullscreenChange === null) {
        return;
    }
    document.removeEventListener('fullscreenchange', onFullscreenChange);
    onFullscreenChange = null;
}

export default function FullScreenButtonComp({
    isFulledScreen,
    setIsFullScreen,
}: Readonly<{
    isFulledScreen: boolean;
    setIsFullScreen: (isFullScreen: boolean) => void;
}>) {
    const fullScreenCN = isFulledScreen
        ? 'fullscreen-exit'
        : 'arrows-fullscreen';
    return (
        <div style={{ overflow: 'hidden' }}>
            <button
                className="btn btn-info btn-sm"
                onClick={async () => {
                    const action = isFulledScreen
                        ? exitFullScreen
                        : enterFullScreen;
                    const isFulledScreenSuccess = await action();
                    removeFullScreenListener();
                    onFullscreenChange = () => {
                        setIsFullScreen(!!document.fullscreenElement);
                        removeFullScreenListener();
                    };
                    document.addEventListener(
                        'fullscreenchange',
                        onFullscreenChange,
                    );
                    setIsFullScreen(isFulledScreenSuccess);
                }}
            >
                <i className={`bi bi-${fullScreenCN}`} />
                {isFulledScreen ? 'Exit ' : ''}Full
            </button>
        </div>
    );
}
