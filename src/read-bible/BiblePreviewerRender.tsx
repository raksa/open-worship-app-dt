import { useEffect, useState } from 'react';
import { useStateSettingNumber } from '../helper/settingHelper';
import BibleViewSetting from './BibleViewSetting';
import BibleItemViewController, {
    useBIVCUpdateEvent,
} from './BibleItemViewController';
import BibleViewRenderer from './BibleViewRenderer';

const MIN_FONT_SIZE = 5;
const MAX_FONT_SIZE = 150;
const STEP_FONT_SIZE = 2;

export default function BiblePreviewerRender({
    bibleItemViewController,
}: Readonly<{
    bibleItemViewController: BibleItemViewController,
}>) {
    const [isFulledScreen, setIsFulledScreen] = useState(
        !!document.fullscreenElement,
    );
    const [fontSize, _setFontSize] = useStateSettingNumber(
        'preview-font-S=size', 16);
    const setFontSize = (fontSize: number) => {
        if (fontSize < MIN_FONT_SIZE) {
            fontSize = MIN_FONT_SIZE;
        }
        if (fontSize > MAX_FONT_SIZE) {
            fontSize = MAX_FONT_SIZE;
        }
        _setFontSize(fontSize);
    };
    return (
        <div className={`card h-100 ${isFulledScreen ? 'app-popup-full' : ''}`}
            onWheel={(event) => {
                if (event.ctrlKey) {
                    setFontSize(Math.round(fontSize + event.deltaY / 10));
                }
            }}>
            <div className='card-body d-flex d-flex-row overflow-hidden h-100'>
                <Render fontSize={fontSize}
                    bibleItemViewController={bibleItemViewController}
                />
            </div>
            <div className='card-footer p-0'>
                <div className='d-flex w-100'>
                    <div className='flex-fill'>
                        <BibleViewSetting
                            minFontSize={MIN_FONT_SIZE}
                            maxFontSize={MAX_FONT_SIZE}
                            stepFontSize={STEP_FONT_SIZE}
                            fontSize={fontSize}
                            setFontSize={setFontSize}
                        />
                    </div>
                    <FullScreenBtn
                        isFulledScreen={isFulledScreen}
                        setIsFullScreen={setIsFulledScreen}
                    />
                </div>
            </div>
        </div>
    );
}

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

const genFullScreenClassName = (isFulledScreen: boolean) => {
    return isFulledScreen ? 'fullscreen-exit' : 'arrows-fullscreen';
};

function FullScreenBtn({
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
        <button className='btn btn-info btn-sm'
            onClick={async () => {
                setIsFullScreen(
                    await (isFulledScreen ? exitFullScreen : enterFullScreen)()
                );
            }}>
            <i className={
                `bi bi-${genFullScreenClassName(isFulledScreen)}`
            } />
            {isFulledScreen ? 'Exit ' : ''}Full
        </button>
    );
}

function Render({
    fontSize, bibleItemViewController,
}: Readonly<{
    fontSize: number,
    bibleItemViewController: BibleItemViewController,
}>) {
    const bibleItems = useBIVCUpdateEvent(bibleItemViewController);
    return (
        <BibleViewRenderer
            fontSize={fontSize}
            bibleItemViewController={bibleItemViewController}
            bibleItems={bibleItems}
            isHorizontal={true}
            indices={[]}
        />
    );
}
