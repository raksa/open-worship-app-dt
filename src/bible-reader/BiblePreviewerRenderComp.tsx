import { useState } from 'react';

import { useStateSettingNumber } from '../helper/settingHelpers';
import BibleViewSettingComp, { defaultRangeSize } from './BibleViewSettingComp';
import { useBibleItemViewControllerUpdateEvent } from './BibleItemViewController';
import BibleViewRendererComp from './BibleViewRendererComp';
import {
    BibleViewFontSizeContext,
    DEFAULT_BIBLE_TEXT_FONT_SIZE,
} from '../helper/bibleViewHelpers';
import FullScreenButtonComp from './FullScreenButtonComp';
import { fontSizeSettingNames } from '../helper/constants';
import { handleCtrlWheel } from '../others/AppRangeComp';
import appProvider from '../server/appProvider';

export default function BiblePreviewerRenderComp() {
    const [isFulledScreen, setIsFulledScreen] = useState(false);
    const fontSizeSettingName = appProvider.isPageReader
        ? fontSizeSettingNames.BIBLE_READING
        : fontSizeSettingNames.BIBLE_PRESENTER;
    const [fontSize, setFontSize] = useStateSettingNumber(
        fontSizeSettingName,
        DEFAULT_BIBLE_TEXT_FONT_SIZE,
    );
    return (
        <div
            className={
                'card w-100 h-100' +
                ` ${isFulledScreen ? 'app-popup-full' : ''}`
            }
            onWheel={(event) => {
                handleCtrlWheel({
                    event,
                    value: fontSize,
                    setValue: setFontSize,
                    defaultSize: defaultRangeSize,
                });
            }}
        >
            <div className={'card-body d-flex overflow-hidden w-100 h-100'}>
                <BibleViewFontSizeContext value={fontSize}>
                    <Render />
                </BibleViewFontSizeContext>
            </div>
            <div className="auto-hide auto-hide-bottom">
                <div className="d-flex w-100">
                    <div className="flex-fill">
                        <BibleViewSettingComp
                            fontSize={fontSize}
                            setFontSize={setFontSize}
                        />
                    </div>
                    <FullScreenButtonComp
                        isFulledScreen={isFulledScreen}
                        setIsFullScreen={setIsFulledScreen}
                    />
                </div>
            </div>
        </div>
    );
}

function Render() {
    const nestedBibleItems = useBibleItemViewControllerUpdateEvent();
    return <BibleViewRendererComp nestedBibleItems={nestedBibleItems} />;
}
