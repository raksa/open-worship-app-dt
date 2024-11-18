import BibleItem from '../bible-list/BibleItem';
import { showAppContextMenu } from '../others/AppContextMenu';
import {
    BibleItemRenderedType,
} from './fullTextScreenComps';
import fullTextScreenHelper from './fullTextScreenHelper';
import ScreenFTManager from './ScreenFTManager';
import ScreenManager from './ScreenManager';
import { openAlert } from '../alert/alertHelpers';
import {
    getDownloadedBibleInfoList,
} from '../helper/bible-helpers/bibleDownloadHelpers';
import { FTItemDataType } from './screenHelpers';

export type ScreenFTManagerEventType = 'update' | 'text-style';

export const SCREEN_FT_SETTING_PREFIX = 'screen-ft-';

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
    const bibleRenderedList = (
        await fullTextScreenHelper.genBibleItemRenderList(bibleItems)
    );
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
