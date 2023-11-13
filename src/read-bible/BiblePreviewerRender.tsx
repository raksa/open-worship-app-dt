import { useState } from 'react';
import { useStateSettingNumber } from '../helper/settingHelper';
import BibleViewSetting from './BibleViewSetting';
import BibleItemViewController, {
    useBIVCUpdateEvent,
} from './BibleItemViewController';
import BibleViewRenderer from './BibleViewRenderer';

const MIN_FONT_SIZE = 5;
const MAX_FONT_SIZE = 150;
const STEP_FONT_SIZE = 2;

export default function BiblePreviewerRender() {
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
    const bibleItemViewController = BibleItemViewController.getInstance();
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

function FullScreenBtn({
    isFulledScreen, setIsFullScreen,
}: Readonly<{
    isFulledScreen: boolean,
    setIsFullScreen: (isFullScreen: boolean) => void,
}>) {
    const genFullScreenClassName = () => {
        return isFulledScreen ? 'fullscreen-exit' : 'arrows-fullscreen';
    };
    return (
        <button className='btn btn-info btn-sm'
            onClick={() => {
                if (!isFulledScreen) {
                    setIsFullScreen(true);
                    document.documentElement.requestFullscreen();
                    const onExitFullScreen = () => {
                        if (!document.fullscreenElement) {
                            setIsFullScreen(false);
                            document.removeEventListener(
                                'fullscreenchange', onExitFullScreen,
                            );
                        }
                    };
                    document.addEventListener(
                        'fullscreenchange', onExitFullScreen,
                    );
                } else if (document.exitFullscreen) {
                    setIsFullScreen(false);
                    document.exitFullscreen();
                }
            }}>
            <i className={
                `bi bi-${genFullScreenClassName()}`
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
