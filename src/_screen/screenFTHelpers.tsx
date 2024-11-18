import BibleItem from '../bible-list/BibleItem';
import { isValidJson } from '../helper/helpers';
import { getSetting, setSetting } from '../helper/settingHelper';
import { checkIsValidLocale } from '../lang';
import { showAppContextMenu } from '../others/AppContextMenu';
import {
    BibleItemRenderedType, LyricRenderedType,
} from './fullTextScreenComps';
import fullTextScreenHelper from './fullTextScreenHelper';
import ScreenFTManager from './ScreenFTManager';
import ScreenManager from './ScreenManager';
import * as loggerHelpers from '../helper/loggerHelpers';
import { BibleItemType } from '../bible-list/bibleItemHelpers';
import { handleError } from '../helper/errorHelpers';
import { openAlert } from '../alert/alertHelpers';
import {
    getDownloadedBibleInfoList,
} from '../helper/bible-helpers/bibleDownloadHelpers';

const ftDataTypeList = [
    'bible-item', 'lyric',
] as const;
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

export type ScreenFTManagerEventType = 'update' | 'text-style';

export const SCREEN_SETTING_NAME = 'screen-ft-';

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
    return !Array.isArray(renderedList)
        || renderedList.some(({
            title, items,
        }: any) => {
            return typeof title !== 'string'
                || !Array.isArray(items)
                || items.some(({ num, text }: any) => {
                    return typeof num !== 'number'
                        || typeof text !== 'string';
                });
        });
};
export function getFTList(): FTListType {
    const settingName = `${SCREEN_SETTING_NAME}-ft-data`;
    const str = getSetting(settingName, '');
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
        return json;
    } catch (error) {
        setSetting(settingName, '');
        handleError(error);
    }
    return {};
}
export function setFTList(ftList: FTListType) {
    const str = JSON.stringify(ftList);
    setSetting(`${SCREEN_SETTING_NAME}-ft-data`, str);
}

function onSelectIndex(
    screenFTManager: ScreenFTManager, selectedIndex: number | null,
) {
    screenFTManager.selectedIndex = selectedIndex;
    screenFTManager.sendSyncSelectedIndex();
}
async function onBibleSelect(
    screenFTManager: ScreenFTManager, event: any, index: number,
    ftItemData: FTItemDataType,
) {
    const bibleRenderedList = (
        ftItemData.bibleItemData?.renderedList as BibleItemRenderedType[]
    );
    const bibleItemingList = bibleRenderedList.map(({ bibleKey }) => {
        return bibleKey;
    });
    const bibleInfoList = await getDownloadedBibleInfoList();
    if (bibleInfoList === null) {
        openAlert(
            'Unable to get bible info list',
            'We were sorry, but we are unable to get bible list at the moment' +
            ' please try again later'
        );
        return;
    }
    const bibleListFiltered = bibleInfoList.filter((bibleInfo) => {
        return !bibleItemingList.includes(bibleInfo.key);
    });
    const applyBibleItems = async (newBibleKeys: string[]) => {
        const bibleItemJson = ftItemData.bibleItemData?.bibleItem;
        if (bibleItemJson === undefined) {
            openAlert(
                'Fail to get bible item data',
                'We were sorry, but we are unable to get bible item data at ' +
                'the moment please try again later',
            );
            return;
        }
        const newBibleItems = newBibleKeys.map((bibleKey1) => {
            const bibleItem = BibleItem.fromJson(bibleItemJson);
            bibleItem.bibleKey = bibleKey1;
            return bibleItem;
        });
        const newFtItemData = await bibleItemToFtData(newBibleItems);
        screenFTManager.ftItemData = newFtItemData;
    };
    showAppContextMenu(event,
        [
            ...bibleRenderedList.length > 1 ? [{
                title: 'Remove(' + bibleRenderedList[index].bibleKey + ')',
                onClick: async () => {
                    bibleItemingList.splice(index, 1);
                    applyBibleItems(bibleItemingList);
                },
                otherChild: (<i className='bi bi-x-lg'
                    style={{ color: 'red' }} />),
            }] : [],
            ...bibleListFiltered.length > 0 ? [{
                title: 'Shift Click to Add',
                disabled: true,
            }] : [],
            ...bibleListFiltered.map((bibleInfo) => {
                const bibleKey = bibleInfo.key;
                return {
                    title: bibleKey,
                    onClick: async (event1: any) => {
                        if (event1.shiftKey) {
                            bibleItemingList.push(bibleKey);
                        } else {
                            bibleItemingList[index] = bibleKey;
                        }
                        applyBibleItems(bibleItemingList);
                    },
                };
            }),
        ]);
}

export function renderPFTManager(screenFTManager: ScreenFTManager) {
    if (screenFTManager.div === null) {
        return;
    }
    const ftItemData = screenFTManager.ftItemData;
    if (ftItemData === null) {
        if (screenFTManager.div.lastChild !== null) {
            const targetDiv = screenFTManager.div.lastChild as HTMLDivElement;
            targetDiv.remove();
        }
        return;
    }
    let newTable: HTMLTableElement | null = null;
    if (ftItemData.type === 'bible-item' &&
        ftItemData.bibleItemData !== undefined) {
        newTable = fullTextScreenHelper.genHtmlFromFtBibleItem(
            ftItemData.bibleItemData.renderedList, screenFTManager.isLineSync,
        );
    } else if (ftItemData.type === 'lyric' &&
        ftItemData.lyricData !== undefined) {
        newTable = fullTextScreenHelper.genHtmlFromFtLyric(
            ftItemData.lyricData.renderedList, screenFTManager.isLineSync,
        );
    }
    if (newTable === null) {
        return;
    }
    fullTextScreenHelper.registerHighlight(newTable, {
        onSelectIndex: (selectedIndex) => {
            onSelectIndex(screenFTManager, selectedIndex);
        },
        onBibleSelect: (event: any, index) => {
            onBibleSelect(screenFTManager, event, index, ftItemData);
        },
    });
    const divHaftScale = document.createElement('div');
    divHaftScale.appendChild(newTable);
    const screenManager = screenFTManager.screenManager;
    if (screenManager === null) {
        return;
    }
    const parentWidth = screenManager.width;
    const parentHeight = screenManager.height;
    const { bounds } = ScreenManager.getDisplayByScreenId(
        screenFTManager.screenId,
    );
    const width = bounds.width;
    const height = bounds.height;
    Object.assign(divHaftScale.style, {
        width: `${width}px`,
        height: `${height}px`,
        transform: 'translate(-50%, -50%)',
    });
    const scale = parentWidth / width;
    const divContainer = document.createElement('div');
    divContainer.appendChild(divHaftScale);
    Object.assign(divContainer.style, {
        position: 'absolute',
        width: `${parentWidth}px`,
        height: `${parentHeight}px`,
        transform: `scale(${scale},${scale}) translate(50%, 50%)`,
    });
    Array.from(screenFTManager.div.children).forEach((child) => {
        child.remove();
    });
    screenFTManager.div.appendChild(divContainer);
    screenFTManager.renderScroll(true);
    screenFTManager.renderSelectedIndex();
}

export async function bibleItemToFtData(bibleItems: BibleItem[]) {
    const bibleRenderedList = await fullTextScreenHelper.
        genBibleItemRenderList(bibleItems);
    return {
        type: 'bible-item',
        bibleItemData: {
            renderedList: bibleRenderedList,
            bibleItem: bibleItems[0].toJson(),
        },
        scroll: 0,
        selectedIndex: null,
    } as FTItemDataType;
}
