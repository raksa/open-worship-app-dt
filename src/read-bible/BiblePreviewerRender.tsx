import { useStateSettingNumber } from '../helper/settingHelper';
import BibleViewSetting from './BibleViewSetting';
import BibleItemViewController, {
    useBIVCUpdateEvent,
} from './BibleItemViewController';
import BibleViewRenderer from './BibleViewRenderer';
import { useState } from 'react';

const MIN_FONT_SIZE = 5;
const MAX_FONT_SIZE = 150;
const STEP_FONT_SIZE = 2;

export default function BiblePreviewerRender() {
    const [isFullScreen, setIsFullScreen] = useState(
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
        <div className={`card h-100 ${isFullScreen ? 'app-popup-full' : ''}`}
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
                        isFullScreen={isFullScreen}
                        setIsFullScreen={setIsFullScreen}
                    />
                </div>
            </div>
        </div>
    );
}

function FullScreenBtn({ isFullScreen: isFull, setIsFullScreen }: {
    isFullScreen: boolean,
    setIsFullScreen: (isFullScreen: boolean) => void,
}) {
    return (
        <button className='btn btn-info btn-sm'
            onClick={() => {
                if (!isFull) {
                    setIsFullScreen(true);
                    document.documentElement.requestFullscreen();
                } else if (document.exitFullscreen) {
                    setIsFullScreen(false);
                    document.exitFullscreen();
                }
            }}>
            <i className={
                `bi bi-${isFull ? 'fullscreen-exit' : 'arrows-fullscreen'}`
            } />
            {isFull ? 'Exit ' : ''}Full
        </button>
    );
}

function Render({
    fontSize, bibleItemViewController,
}: {
    fontSize: number,
    bibleItemViewController: BibleItemViewController,
}) {
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
