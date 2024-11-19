import { useState } from 'react';

import { useStateSettingNumber } from '../helper/settingHelper';
import BibleViewSetting from './BibleViewSetting';
import {
    NestedBibleItemsType, SearchBibleItemViewController, useBIVCUpdateEvent,
} from './BibleItemViewController';
import BibleViewRenderer from './BibleViewRenderer';
import {
    BibleViewFontSizeContext, DEFAULT_BIBLE_TEXT_FONT_SIZE,
} from '../helper/bibleViewHelpers';
import FullScreenBtn from './FullScreenBtn';
import {
    checkIsWindowReaderMode, useWindowMode,
} from '../router/routeHelpers';
import { fontSizeSettingNames } from '../helper/constants';
import { useKeyboardRegistering } from '../event/KeyboardEventListener';

const MIN_FONT_SIZE = 5;
const MAX_FONT_SIZE = 150;
const STEP_FONT_SIZE = 2;

export default function BiblePreviewerRender() {
    const [isFulledScreen, setIsFulledScreen] = useState(false);
    const windowMode = useWindowMode();
    const isReader = checkIsWindowReaderMode(windowMode);
    const fontSizeSettingName = (
        isReader ? fontSizeSettingNames.BIBLE_READING :
            fontSizeSettingNames.BIBLE_PRESENTER
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
            <div className='auto-hide auto-hide-bottom'>
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

const metaKeys: any = {
    wControlKey: ['Ctrl', 'Shift'],
    lControlKey: ['Ctrl', 'Shift'],
    mControlKey: ['Meta', 'Shift'],
};
function useNextEditingBibleItem(
    key: 'ArrowLeft' | 'ArrowRight', nestedBibleItems: NestedBibleItemsType,
) {
    useKeyboardRegistering([{ ...metaKeys, key }], (e) => {
        e.preventDefault();
        const viewController = SearchBibleItemViewController.getInstance();
        const allBibleItems = viewController.convertToStraightBibleItems(
            nestedBibleItems,
        );
        if (allBibleItems.length === 0) {
            return;
        }
        let selectedIndex = viewController.findSelectedIndex(allBibleItems);
        if (selectedIndex === -1) {
            selectedIndex = 0;
        }
        selectedIndex = (
            (
                selectedIndex + (key === 'ArrowLeft' ? - 1 : 1) +
                allBibleItems.length
            ) %
            allBibleItems.length
        );
        viewController.editBibleItem(allBibleItems[selectedIndex]);
    });
}
export function useSplitBibleItemRenderer(key: 's' | 'v') {
    useKeyboardRegistering([{ ...metaKeys, key }], () => {
        const viewController = SearchBibleItemViewController.getInstance();
        const bibleItem = viewController.selectedBibleItem;
        if (key === 's') {
            viewController.addBibleItemLeft(bibleItem, bibleItem);
        } else {
            viewController.addBibleItemBottom(bibleItem, bibleItem);
        }
    });
}

function Render() {
    const nestedBibleItems = useBIVCUpdateEvent();
    useNextEditingBibleItem('ArrowLeft', nestedBibleItems);
    useNextEditingBibleItem('ArrowRight', nestedBibleItems);
    return (
        <BibleViewRenderer nestedBibleItems={nestedBibleItems} />
    );
}
