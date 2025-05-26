import { useState } from 'react';

import { useStateSettingNumber } from '../helper/settingHelpers';
import BibleViewSettingComp, { defaultRangeSize } from './BibleViewSettingComp';
import {
    useBibleItemsViewControllerContext,
    useBibleItemViewControllerUpdateEvent,
} from './BibleItemsViewController';
import BibleViewRendererComp from './BibleViewRendererComp';
import {
    BibleViewFontSizeContext,
    DEFAULT_BIBLE_TEXT_FONT_SIZE,
} from '../helper/bibleViewHelpers';
import FullScreenButtonComp from './FullScreenButtonComp';
import { fontSizeSettingNames } from '../helper/constants';
import { handleCtrlWheel } from '../others/AppRangeComp';
import appProvider from '../server/appProvider';

function NewLineSettingComp() {
    const viewController = useBibleItemsViewControllerContext();
    const [shouldNewLine, setShouldNewLine] = useState(
        viewController.shouldNewLine,
    );
    const setShouldNewLine1 = (newValue: boolean) => {
        setShouldNewLine(newValue);
        viewController.shouldNewLine = newValue;
    };
    return (
        <div className="d-flex mx-1">
            <label htmlFor="new-line-setting" className="form-label">
                Should new Line:
            </label>
            <input
                className="form-check-input pointer"
                type="checkbox"
                id="new-line-setting"
                checked={shouldNewLine}
                onChange={(event) => {
                    setShouldNewLine1(event.target.checked);
                }}
            />
        </div>
    );
}

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
            <div className="app-auto-hide app-auto-hide-bottom">
                <div className="d-flex w-100">
                    <div className="flex-fill d-flex">
                        <BibleViewSettingComp
                            fontSize={fontSize}
                            setFontSize={setFontSize}
                        />
                        <NewLineSettingComp />
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
