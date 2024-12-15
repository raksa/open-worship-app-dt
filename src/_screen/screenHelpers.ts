import * as loggerHelpers from '../helper/loggerHelpers';
import BibleItem from '../bible-list/BibleItem';
import { BibleItemType } from '../bible-list/bibleItemHelpers';
import { screenManagerSettingNames } from '../helper/constants';
import { handleError } from '../helper/errorHelpers';
import { isValidJson } from '../helper/helpers';
import { getSetting, setSetting } from '../helper/settingHelpers';
import { checkIsValidLocale } from '../lang';
import { createMouseEvent } from '../others/AppContextMenu';
import SlideItem, { SlideItemType } from '../slide-list/SlideItem';
import appProviderScreen from './appProviderScreen';
import {
    BibleItemRenderedType, LyricRenderedType,
} from './fullTextScreenComps';
import {
    ScreenTransitionEffectType, TargetType,
} from './transition-effect/transitionEffectHelpers';

export const ftDataTypeList = ['bible-item', 'lyric'] as const;
export type FfDataType = typeof ftDataTypeList[number];
export type FTItemDataType = {
    type: FfDataType,
    bibleItemData?: {
        renderedList: BibleItemRenderedType[],
        bibleItem: BibleItemType,
    },
    lyricData?: {
        renderedList: LyricRenderedType[],
    },
    scroll: number,
    selectedIndex: number | null,
};
export type FTListType = {
    [key: string]: FTItemDataType;
};

const _backgroundTypeList = ['color', 'image', 'video', 'sound'] as const;
export type BackgroundType = typeof _backgroundTypeList[number];
export type BackgroundSrcType = {
    type: BackgroundType;
    src: string;
    width?: number;
    height?: number;
};
export type BackgroundSrcListType = {
    [key: string]: BackgroundSrcType;
};

export type AlertDataType = {
    marqueeData: {
        text: string,
    } | null;
    countdownData: {
        dateTime: Date,
    } | null;
};
export type AlertSrcListType = {
    [key: string]: AlertDataType;
};

export type SlideItemDataType = {
    slideFilePath: string;
    slideItemJson: SlideItemType
};
export type SlideListType = {
    [key: string]: SlideItemDataType;
};

export type BoundsType = {
    x: number,
    y: number,
    width: number,
    height: number,
};
export type DisplayType = {
    id: number,
    bounds: BoundsType,
};
export type AllDisplayType = {
    primaryDisplay: DisplayType,
    displays: DisplayType[],
}

export const screenTypeList = [
    'background', 'slide', 'full-text', 'full-text-scroll',
    'full-text-text-style', 'alert',
    'full-text-selected-index', 'display-change', 'visible',
    'init', 'effect',
] as const;
export type ScreenType = typeof screenTypeList[number];
export type ScreenMessageType = {
    screenId: number,
    type: ScreenType,
    data: any,
};

const messageUtils = appProviderScreen.messageUtils;

export function calMediaSizes({
    parentWidth, parentHeight,
}: {
    parentWidth: number,
    parentHeight: number,
}, { width, height }: {
    width?: number,
    height?: number,
}) {
    if (width === undefined || height === undefined) {
        return {
            width: parentWidth,
            height: parentHeight,
            offsetH: 0,
            offsetV: 0,
        };
    }
    const scale = Math.max(parentWidth / width, parentHeight / height);
    const newWidth = width * scale;
    const newHeight = height * scale;
    const offsetH = (newWidth - parentWidth) / 2;
    const offsetV = (newHeight - parentHeight) / 2;
    return {
        width: newWidth,
        height: newHeight,
        offsetH,
        offsetV,
    };
}

type SetDisplayType = {
    screenId: number,
    displayId: number,
}
export function setDisplay({ screenId, displayId }: SetDisplayType) {
    messageUtils.sendData('main:app:set-screen-display', {
        screenId, displayId,
    });
}

export function getAllShowingScreenIds(): number[] {
    return messageUtils.sendDataSync('main:app:get-screens');
}
export function getAllDisplays(): AllDisplayType {
    return messageUtils.sendDataSync('main:app:get-displays');
}

type ShowScreenDataType = {
    screenId: number,
    displayId: number,
    replyEventName: string,
};
export function showScreen({ screenId, displayId }: SetDisplayType) {
    return new Promise<void>((resolve) => {
        const replyEventName = 'app:main-' + Date.now();
        messageUtils.listenOnceForData(replyEventName, () => {
            resolve();
        });
        const data: ShowScreenDataType = {
            screenId,
            displayId,
            replyEventName,
        };
        messageUtils.sendData('main:app:show-screen', data);
    });
}
export function hideScreen(screenId: number) {
    messageUtils.sendData('app:hide-screen', screenId);
}

export type PTEffectDataType = {
    target: TargetType,
    effect: ScreenTransitionEffectType,
};

export function genScreenMouseEvent(event?: any): MouseEvent {
    if (event) {
        return event;
    }
    const miniScreen = document.getElementsByClassName(
        'mini-screen',
    )[0];
    if (miniScreen !== undefined) {
        const rect = miniScreen.getBoundingClientRect();
        return createMouseEvent(rect.x, rect.y);
    }
    return createMouseEvent(0, 0);
}

export function getScreenManagersInstanceSetting() {
    const str = getSetting(screenManagerSettingNames.MANAGERS, '');
    if (isValidJson(str, true)) {
        const json = JSON.parse(str);
        return json.filter(({ screenId }: any) => {
            return typeof screenId === 'number';
        });
    }
    return [];
}

function getValidOnScreen(data: { [key: string]: any }) {
    const instanceSetting = getScreenManagersInstanceSetting();
    if (instanceSetting.size === 0) {
        return {};
    }
    const screenIdList = instanceSetting.map(({ screenId }: any) => {
        return screenId;
    });
    const validEntry = Object.entries(data).filter(([key, _]) => {
        return screenIdList.includes(parseInt(key));
    });
    return Object.fromEntries(validEntry);
}

export function getSlideListOnScreenSetting(): SlideListType {
    const str = getSetting(screenManagerSettingNames.SLIDE, '');
    try {
        if (!isValidJson(str, true)) {
            return {};
        }
        const json = JSON.parse(str);
        Object.values(json).forEach((item: any) => {
            if (typeof item.slideFilePath !== 'string') {
                throw new Error('Invalid slide path');
            }
            SlideItem.validate(item.slideItemJson);
        });
        return getValidOnScreen(json);
    } catch (error) {
        handleError(error);
    }
    return {};
}

export function getAlertDataListOnScreenSetting(): AlertSrcListType {
    const str = getSetting(screenManagerSettingNames.ALERT, '');
    try {
        if (!isValidJson(str, true)) {
            return {};
        }
        const json = JSON.parse(str);
        Object.values(json).forEach((item: any) => {
            const { countdownData } = item;
            if (
                !(
                    item.marqueeData === null ||
                    typeof item.marqueeData.text === 'string'
                ) ||
                !(
                    countdownData === null ||
                    typeof countdownData.dateTime === 'string'
                )
            ) {
                throw new Error('Invalid alert data');
            }
            if (countdownData?.dateTime) {
                countdownData.dateTime = new Date(countdownData.dateTime);
            }
        });
        return getValidOnScreen(json);
    } catch (error) {
        handleError(error);
    }
    return {};
}

export function getBackgroundSrcListOnScreenSetting(): BackgroundSrcListType {
    const str = getSetting(screenManagerSettingNames.BACKGROUND, '');
    if (isValidJson(str, true)) {
        const json = JSON.parse(str);
        const items = Object.values(json);
        if (items.every((item: any) => {
            return item.type && item.src;
        })) {
            return getValidOnScreen(json);
        }
    }
    return {};
}

const validateBible = ({ renderedList, bibleItem }: any) => {
    BibleItem.validate(bibleItem);
    return (
        !Array.isArray(renderedList) ||
        renderedList.some(({ locale, bibleKey, title, verses }: any) => {
            return (
                !checkIsValidLocale(locale) ||
                typeof bibleKey !== 'string' ||
                typeof title !== 'string' ||
                !Array.isArray(verses) ||
                verses.some(({ num, text }: any) => {
                    return (
                        typeof num !== 'string' || typeof text !== 'string'
                    );
                })
            );
        })
    );
};
const validateLyric = ({ renderedList }: any) => {
    return (
        !Array.isArray(renderedList) || renderedList.some((item: any) => {
            const { title, items } = item;
            return (
                typeof title !== 'string' || !Array.isArray(items) ||
                items.some(({ num, text }: any) => {
                    return typeof num !== 'number' || typeof text !== 'string';
                })
            );
        })
    );
};

export function getFTListOnScreenSetting(): FTListType {
    const str = getSetting(screenManagerSettingNames.FULL_TEXT, '');
    try {
        if (!isValidJson(str, true)) {
            return {};
        }
        const json = JSON.parse(str);
        Object.values(json).forEach((item: any) => {
            if (
                !ftDataTypeList.includes(item.type) ||
                (
                    item.type === 'bible-item' &&
                    validateBible(item.bibleItemData)
                ) ||
                (item.type === 'lyric' && validateLyric(item.lyricData))
            ) {
                loggerHelpers.error(item);
                throw new Error('Invalid full-text data');
            }
        });
        return getValidOnScreen(json);
    } catch (error) {
        setSetting(screenManagerSettingNames.FULL_TEXT, '');
        handleError(error);
    }
    return {};
}   
