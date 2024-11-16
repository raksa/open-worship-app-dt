import { useState } from 'react';

import { useStateSettingNumber } from '../helper/settingHelper';
import BibleViewSetting from './BibleViewSetting';
import {
    useBIVCUpdateEvent,
} from './BibleItemViewController';
import BibleViewRenderer from './BibleViewRenderer';
import {
    BibleViewFontSizeContext, DEFAULT_BIBLE_TEXT_FONT_SIZE,
} from '../helper/bibleViewHelpers';
import FullScreenBtn from './FullScreenBtn';
import {
    checkIsWindowReadingMode, useWindowMode,
} from '../router/routeHelpers';
import { fontSizeSettingNames } from '../helper/constants';

const MIN_FONT_SIZE = 5;
const MAX_FONT_SIZE = 150;
const STEP_FONT_SIZE = 2;

export default function BiblePreviewerRender() {
    const [isFulledScreen, setIsFulledScreen] = useState(false);
    const windowMode = useWindowMode();
    const isReading = checkIsWindowReadingMode(windowMode);
    const fontSizeSettingName = (
        isReading ? fontSizeSettingNames.BIBLE_READING :
            fontSizeSettingNames.BIBLE_PRESENTING
    );
    const [fontSize, _setFontSize] = useStateSettingNumber(
        fontSizeSettingName, DEFAULT_BIBLE_TEXT_FONT_SIZE,
    );
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
        <div className={
            `card w-100 h-100 ${isFulledScreen ? 'app-popup-full' : ''}`
        }
            onWheel={(event) => {
                if (event.ctrlKey) {
                    setFontSize(Math.round(fontSize + event.deltaY / 10));
                }
            }}>
            <div className={
                'card-body d-flex overflow-hidden w-100 h-100'
            }>
                <BibleViewFontSizeContext.Provider value={fontSize}>
                    <Render />
                </BibleViewFontSizeContext.Provider>
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

function Render() {
    const nestedBibleItems = useBIVCUpdateEvent();
    return (
        <BibleViewRenderer
            nestedBibleItems={nestedBibleItems}
        />
    );
}
