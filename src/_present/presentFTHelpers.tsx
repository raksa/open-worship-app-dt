import BibleItem from '../bible-list/BibleItem';
import { isValidJson } from '../helper/helpers';
import { getSetting, setSetting } from '../helper/settingHelper';
import { checkIsValidLocale } from '../lang';
import { showAppContextMenu } from '../others/AppContextMenu';
import { getBibleInfoWithStatusList } from
    '../helper/bible-helpers/serverBibleHelpers';
import {
    BibleItemRenderedType, LyricRenderedType,
} from './fullTextPresentComps';
import fullTextPresentHelper from './fullTextPresentHelper';
import PresentFTManager from './PresentFTManager';
import PresentManager from './PresentManager';
import * as loggerHelpers from '../helper/loggerHelpers';
import { BibleItemType } from '../bible-list/bibleItemHelpers';
import { handleError } from '../helper/errorHelpers';

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

export type PresentFTManagerEventType = 'update' | 'text-style';

export const PRESENT_SETTING_NAME = 'present-ft-';

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
    const settingName = `${PRESENT_SETTING_NAME}-ft-data`;
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
    setSetting(`${PRESENT_SETTING_NAME}-ft-data`, str);
}

function onSelectIndex(presentFTManager: PresentFTManager,
    selectedIndex: number | null) {
    presentFTManager.selectedIndex = selectedIndex;
    presentFTManager.sendSyncSelectedIndex();
}
async function onBibleSelect(presentFTManager: PresentFTManager,
    event: any, index: number, ftItemData: FTItemDataType) {
    const bibleRenderedList = (
        ftItemData.bibleItemData?.renderedList as BibleItemRenderedType[]
    );
    const bibleItemingList = bibleRenderedList.map(({ bibleKey }) => {
        return bibleKey;
    });
    const bibleList = await getBibleInfoWithStatusList();
    const bibleListFiltered = bibleList.filter(([bibleKey]) => {
        return !bibleItemingList.includes(bibleKey);
    });
    const bibleItemJson = ftItemData.bibleItemData?.bibleItem as BibleItemType;
    const applyBibleItems = async (newBibleKeys: string[]) => {
        const newBibleItems = newBibleKeys.map((bibleKey1) => {
            const bibleItem = BibleItem.fromJson(bibleItemJson);
            bibleItem.bibleKey = bibleKey1;
            return bibleItem;
        });
        const newFtItemData = await bibleItemToFtData(newBibleItems);
        presentFTManager.ftItemData = newFtItemData;
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
            ...bibleListFiltered.map(([bibleKey, isAvailable]) => {
                return {
                    title: bibleKey,
                    disabled: !isAvailable,
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

export function renderPFTManager(presentFTManager: PresentFTManager) {
    if (presentFTManager.div === null) {
        return;
    }
    const ftItemData = presentFTManager.ftItemData;
    if (ftItemData === null) {
        if (presentFTManager.div.lastChild !== null) {
            const targetDiv = presentFTManager.div.lastChild as HTMLDivElement;
            targetDiv.remove();
        }
        return;
    }
    let newTable: HTMLTableElement | null = null;
    if (ftItemData.type === 'bible-item' &&
        ftItemData.bibleItemData !== undefined) {
        newTable = fullTextPresentHelper.genHtmlFromFtBibleItem(
            ftItemData.bibleItemData.renderedList, presentFTManager.isLineSync);
    } else if (ftItemData.type === 'lyric' &&
        ftItemData.lyricData !== undefined) {
        newTable = fullTextPresentHelper.genHtmlFromFtLyric(
            ftItemData.lyricData.renderedList, presentFTManager.isLineSync);
    }
    if (newTable === null) {
        return;
    }
    fullTextPresentHelper.registerHighlight(newTable, {
        onSelectIndex: (selectedIndex) => {
            onSelectIndex(presentFTManager, selectedIndex);
        },
        onBibleSelect: (event: any, index) => {
            onBibleSelect(presentFTManager, event, index, ftItemData);
        },
    });
    const divHaftScale = document.createElement('div');
    divHaftScale.appendChild(newTable);
    const presentManager = presentFTManager.presentManager;
    if (presentManager === null) {
        return;
    }
    const parentWidth = presentManager.width;
    const parentHeight = presentManager.height;
    const { bounds } = PresentManager.getDisplayByPresentId(
        presentFTManager.presentId,
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
    Array.from(presentFTManager.div.children).forEach((child) => {
        child.remove();
    });
    presentFTManager.div.appendChild(divContainer);
    presentFTManager.renderScroll(true);
    presentFTManager.renderSelectedIndex();
}

export async function bibleItemToFtData(bibleItems: BibleItem[]) {
    const bibleRenderedList = await fullTextPresentHelper.
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
