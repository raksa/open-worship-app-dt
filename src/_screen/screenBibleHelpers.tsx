import BibleItem from '../bible-list/BibleItem';
import {
    ContextMenuItemType,
    showAppContextMenu,
} from '../context-menu/appContextMenuHelpers';
import { BibleItemRenderingType } from './bibleScreenComps';
import bibleScreenHelper from './bibleScreenHelpers';
import ScreenBibleManager from './managers/ScreenBibleManager';
import { showAppAlert } from '../popup-widget/popupWidgetHelpers';
import { getAllLocalBibleInfoList } from '../helper/bible-helpers/bibleDownloadHelpers';
import { BibleItemDataType } from './screenHelpers';
import { getDisplayByScreenId } from './managers/screenHelpers';
import { BibleItemType } from '../bible-list/bibleItemHelpers';
import { cloneJson } from '../helper/helpers';

export type ScreenBibleManagerEventType = 'update' | 'text-style';

export const SCREEN_BIBLE_SETTING_PREFIX = 'screen-bible-';

export function onSelectIndex(
    screenBibleManager: ScreenBibleManager,
    selectedIndex: number | null,
    isToTop: boolean,
) {
    screenBibleManager.isToTop = isToTop;
    screenBibleManager.selectedIndex = selectedIndex;
    screenBibleManager.sendSyncSelectedIndex();
}

async function applyBibleItems(
    screenBibleManager: ScreenBibleManager,
    bibleItemData: BibleItemDataType,
    newBibleKeys: string[],
) {
    const bibleItemJson = bibleItemData.bibleItemData?.bibleItem;
    if (bibleItemJson === undefined) {
        showAppAlert(
            'Fail to get bible item data',
            'We were sorry, but we are unable to get bible item data at ' +
                'the moment please try again later',
        );
        return;
    }
    const newFtItemData = await bibleItemJsonToFtData(
        bibleItemJson,
        newBibleKeys,
    );
    screenBibleManager.bibleItemData = newFtItemData;
}

async function onBibleSelect(
    screenBibleManager: ScreenBibleManager,
    event: any,
    index: number,
    bibleItemData: BibleItemDataType,
) {
    const bibleRenderingList = bibleItemData.bibleItemData
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

    const menuItems: ContextMenuItemType[] = [
        ...(bibleRenderingList.length > 1
            ? [
                  {
                      menuTitle:
                          'Remove(' + bibleRenderingList[index].bibleKey + ')',
                      onSelect: async () => {
                          bibleItemingList.splice(index, 1);
                          applyBibleItems(
                              screenBibleManager,
                              bibleItemData,
                              bibleItemingList,
                          );
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
                    applyBibleItems(
                        screenBibleManager,
                        bibleItemData,
                        bibleItemingList,
                    );
                },
            };
        }),
    ];
    showAppContextMenu(event, menuItems);
}

export async function renderScreenBibleManager(
    screenBibleManager: ScreenBibleManager,
) {
    if (screenBibleManager.div === null) {
        return;
    }
    const bibleItemData = screenBibleManager.bibleItemData;
    if (bibleItemData === null) {
        if (screenBibleManager.div.lastChild !== null) {
            const targetDiv = screenBibleManager.div
                .lastChild as HTMLDivElement;
            targetDiv.remove();
        }
        screenBibleManager.div.style.pointerEvents = 'none';
        return;
    }
    screenBibleManager.div.style.pointerEvents = 'auto';
    let newDiv: HTMLDivElement | null = null;
    if (
        bibleItemData.type === 'bible-item' &&
        bibleItemData.bibleItemData !== undefined
    ) {
        newDiv = await bibleScreenHelper.genHtmlFromFtBibleItem(
            bibleItemData.bibleItemData.renderedList,
            screenBibleManager.isLineSync,
        );
    }
    if (newDiv === null) {
        return;
    }
    bibleScreenHelper.registerHighlight(newDiv, {
        onSelectIndex: (selectedIndex, isToTop) => {
            onSelectIndex(screenBibleManager, selectedIndex, isToTop);
        },
        onBibleSelect: (event: any, index) => {
            onBibleSelect(screenBibleManager, event, index, bibleItemData);
        },
    });
    const divHaftScale = document.createElement('div');
    divHaftScale.appendChild(newDiv);
    const { screenManagerBase } = screenBibleManager;
    const parentWidth = screenManagerBase.width;
    const parentHeight = screenManagerBase.height;
    const { bounds } = getDisplayByScreenId(screenBibleManager.screenId);
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
    Array.from(screenBibleManager.div.children).forEach((child) => {
        child.remove();
    });
    screenBibleManager.div.appendChild(divContainer);
    screenBibleManager.renderScroll(true);
    screenBibleManager.renderSelectedIndex();
}

export async function bibleItemJsonToFtData(
    bibleItemJson: BibleItemType,
    bibleKeys: string[],
) {
    const newBibleKeys = cloneJson(bibleKeys);
    if (newBibleKeys.length === 0) {
        return await bibleItemToFtData([BibleItem.fromJson(bibleItemJson)]);
    }
    const newBibleItems = newBibleKeys.map((bibleKey1) => {
        const bibleItem = BibleItem.fromJson(bibleItemJson);
        bibleItem.bibleKey = bibleKey1;
        return bibleItem;
    });
    return await bibleItemToFtData(newBibleItems);
}

export async function bibleItemToFtData(bibleItems: BibleItem[]) {
    const bibleRenderingList =
        await bibleScreenHelper.genBibleItemRenderList(bibleItems);
    return {
        type: 'bible-item',
        bibleItemData: {
            renderedList: bibleRenderingList,
            bibleItem: bibleItems[0].toJson(),
        },
        scroll: 0,
        selectedIndex: null,
    } as BibleItemDataType;
}
