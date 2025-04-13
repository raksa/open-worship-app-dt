import BibleItem from '../bible-list/BibleItem';
import {
    ContextMenuItemType,
    showAppContextMenu,
} from '../context-menu/appContextMenuHelpers';
import { BibleItemRenderingType } from './fullTextScreenComps';
import fullTextScreenHelper from './fullTextScreenHelpers';
import ScreenFullTextManager from './managers/ScreenFullTextManager';
import { showAppAlert } from '../popup-widget/popupWidgetHelpers';
import { getAllLocalBibleInfoList } from '../helper/bible-helpers/bibleDownloadHelpers';
import { FullTextItemDataType } from './screenHelpers';
import { getDisplayByScreenId } from './managers/screenHelpers';

export type ScreenFTManagerEventType = 'update' | 'text-style';

export const SCREEN_FT_SETTING_PREFIX = 'screen-ft-';

function onSelectIndex(
    screenFTManager: ScreenFullTextManager,
    selectedIndex: number | null,
    isToCenter: boolean,
) {
    screenFTManager.isToCenter = isToCenter;
    screenFTManager.selectedIndex = selectedIndex;
    screenFTManager.sendSyncSelectedIndex();
}
async function onBibleSelect(
    screenFTManager: ScreenFullTextManager,
    event: any,
    index: number,
    ftItemData: FullTextItemDataType,
) {
    const bibleRenderingList = ftItemData.bibleItemData
        ?.renderedList as BibleItemRenderingType[];
    const bibleItemingList = bibleRenderingList.map(({ bibleKey }) => {
        return bibleKey;
    });
    const localBibleInfoList = await getAllLocalBibleInfoList();
    if (localBibleInfoList === null) {
        showAppAlert(
            'Unable to get bible info list',
            'We were sorry, but we are unable to get bible list at the moment' +
                ' please try again later',
        );
        return;
    }
    const bibleListFiltered = localBibleInfoList.filter((bibleInfo) => {
        return !bibleItemingList.includes(bibleInfo.key);
    });
    const applyBibleItems = async (newBibleKeys: string[]) => {
        const bibleItemJson = ftItemData.bibleItemData?.bibleItem;
        if (bibleItemJson === undefined) {
            showAppAlert(
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
        screenFTManager.fullTextItemData = newFtItemData;
    };
    const menuItems: ContextMenuItemType[] = [
        ...(bibleRenderingList.length > 1
            ? [
                  {
                      menuTitle:
                          'Remove(' + bibleRenderingList[index].bibleKey + ')',
                      onSelect: async () => {
                          bibleItemingList.splice(index, 1);
                          applyBibleItems(bibleItemingList);
                      },
                      otherChild: (
                          <i className="bi bi-x-lg" style={{ color: 'red' }} />
                      ),
                  },
              ]
            : []),
        ...(bibleListFiltered.length > 0
            ? [
                  {
                      menuTitle: 'Shift Click to Add',
                      disabled: true,
                  },
              ]
            : []),
        ...bibleListFiltered.map((bibleInfo) => {
            const bibleKey = bibleInfo.key;
            return {
                menuTitle: bibleKey,
                onSelect: async (event1: any) => {
                    if (event1.shiftKey) {
                        bibleItemingList.push(bibleKey);
                    } else {
                        bibleItemingList[index] = bibleKey;
                    }
                    applyBibleItems(bibleItemingList);
                },
            };
        }),
    ];
    showAppContextMenu(event, menuItems);
}

export async function renderScreenFullTextManager(
    screenFullTextManager: ScreenFullTextManager,
) {
    if (screenFullTextManager.div === null) {
        return;
    }
    const ftItemData = screenFullTextManager.fullTextItemData;
    if (ftItemData === null) {
        if (screenFullTextManager.div.lastChild !== null) {
            const targetDiv = screenFullTextManager.div
                .lastChild as HTMLDivElement;
            targetDiv.remove();
        }
        screenFullTextManager.div.style.pointerEvents = 'none';
        return;
    }
    screenFullTextManager.div.style.pointerEvents = 'auto';
    let newDiv: HTMLDivElement | null = null;
    if (
        ftItemData.type === 'bible-item' &&
        ftItemData.bibleItemData !== undefined
    ) {
        newDiv = await fullTextScreenHelper.genHtmlFromFtBibleItem(
            ftItemData.bibleItemData.renderedList,
            screenFullTextManager.isLineSync,
        );
    } else if (
        ftItemData.type === 'lyric' &&
        ftItemData.lyricData !== undefined
    ) {
        newDiv = fullTextScreenHelper.genHtmlFromFtLyric(
            ftItemData.lyricData.renderedList,
            screenFullTextManager.isLineSync,
        );
    }
    if (newDiv === null) {
        return;
    }
    fullTextScreenHelper.registerHighlight(newDiv, {
        onSelectIndex: (selectedIndex, isToCenter) => {
            onSelectIndex(screenFullTextManager, selectedIndex, isToCenter);
        },
        onBibleSelect: (event: any, index) => {
            onBibleSelect(screenFullTextManager, event, index, ftItemData);
        },
    });
    const divHaftScale = document.createElement('div');
    divHaftScale.appendChild(newDiv);
    const { screenManagerBase } = screenFullTextManager;
    const parentWidth = screenManagerBase.width;
    const parentHeight = screenManagerBase.height;
    const { bounds } = getDisplayByScreenId(screenFullTextManager.screenId);
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
    Array.from(screenFullTextManager.div.children).forEach((child) => {
        child.remove();
    });
    screenFullTextManager.div.appendChild(divContainer);
    screenFullTextManager.renderScroll(true);
    screenFullTextManager.renderSelectedIndex();
}

export async function bibleItemToFtData(bibleItems: BibleItem[]) {
    const bibleRenderingList =
        await fullTextScreenHelper.genBibleItemRenderList(bibleItems);
    return {
        type: 'bible-item',
        bibleItemData: {
            renderedList: bibleRenderingList,
            bibleItem: bibleItems[0].toJson(),
        },
        scroll: 0,
        selectedIndex: null,
    } as FullTextItemDataType;
}
