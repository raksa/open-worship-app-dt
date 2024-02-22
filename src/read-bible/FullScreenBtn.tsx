import { useEffect } from 'react';

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

export default function FullScreenBtn({
    isFulledScreen, setIsFullScreen,
}: Readonly<{
    isFulledScreen: boolean,
    setIsFullScreen: (isFullScreen: boolean) => void,
}>) {
    useEffect(() => {
        const onFullscreenChange = () => {
            setIsFullScreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', onFullscreenChange);
        return () => {
            document.removeEventListener(
                'fullscreenchange', onFullscreenChange,
            );
        };
    });
    return (
        <div style={{ width: '60px', overflow: 'hidden' }}>
            <button className='btn btn-info btn-sm'
                onClick={async () => {
                    const action = (
                        isFulledScreen ? exitFullScreen : enterFullScreen
                    );
                    setIsFullScreen(await action());
                }}>
                <i className={
                    `bi bi-${genFullScreenClassName(isFulledScreen)}`
                } />
                {isFulledScreen ? 'Exit ' : ''}Full
            </button>
        </div>
    );
}
