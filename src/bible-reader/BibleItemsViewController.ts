import { ReactNode, createContext, use, useState } from 'react';

import BibleItem from '../bible-list/BibleItem';
import EventHandler from '../event/EventHandler';
import { useAppEffect } from '../helper/debuggerHelpers';
import { getSetting, setSetting } from '../helper/settingHelpers';
import { handleError } from '../helper/errorHelpers';
import { BibleItemType } from '../bible-list/bibleItemHelpers';
import { showSimpleToast } from '../toast/toastHelpers';
import { ContextMenuItemType } from '../context-menu/appContextMenuHelpers';
import { showBibleOption } from '../bible-lookup/BibleSelectionComp';
import appProvider from '../server/appProvider';
import {
    bringDomToNearestView,
    bringDomToTopView,
    genTimeoutAttempt,
} from '../helper/helpers';
import { BIBLE_VIEW_TEXT_CLASS } from '../helper/bibleViewHelpers';
import { getLangAsync } from '../lang';
import { getBibleLocale } from '../helper/bible-helpers/serverBibleHelpers2';
import { BibleTargetType } from '../bible-list/bibleRenderHelpers';

export type UpdateEventType = 'update';
export const RESIZE_SETTING_NAME = 'bible-previewer-render';

export type NestedBibleItemsType = BibleItem | NestedBibleItemsType[];
export type NestedObjectsType = BibleItemType | NestedObjectsType[];

export const splitHorizontalId = 'split-horizontal';
export const splitVerticalId = 'split-vertical';

export const historyStore: {
    addHistory: (text: string) => void;
} = {
    addHistory: (_text: string) => {},
};
export function applyHistoryPendingText() {
    if (!pendingText) {
        return;
    }
    historyStore.addHistory(pendingText);
    pendingText = '';
}
const attemptTimeout = genTimeoutAttempt(4e3);
let pendingText = '';
export function attemptAddingHistory(
    bibleKey: string,
    text: string,
    isImmediate = false,
) {
    pendingText = `(${bibleKey}) ${text}`;
    if (isImmediate) {
        applyHistoryPendingText();
        return;
    }
    attemptTimeout(() => {
        applyHistoryPendingText();
    });
}

function toStraightItems(nestedBibleItems: NestedBibleItemsType): BibleItem[] {
    const traverse = (items: any): any => {
        if (items instanceof Array) {
            return items.flatMap((item) => {
                return traverse(item);
            });
        }
        return [items];
    };
    const allBibleItems: BibleItem[] = traverse(nestedBibleItems);
    return allBibleItems;
}

function parseNestedBibleItem(json: any): NestedBibleItemsType {
    if (json instanceof Array) {
        const nestedBibleItems: NestedBibleItemsType = json.map((item: any) => {
            return parseNestedBibleItem(item);
        });
        const straightBibleItems = toStraightItems(nestedBibleItems);
        const allIds = straightBibleItems.map((item) => {
            return item.id;
        });
        if (
            allIds.length !==
            new Set(
                allIds.filter((id) => {
                    return id !== -1;
                }),
            ).size
        ) {
            throw new Error('Duplicate BibleItem ID found');
        }
        return nestedBibleItems;
    }
    return BibleItem.fromJson(json);
}

function deepSanitizeNestedItems(nestedBibleItems: NestedBibleItemsType): {
    nestedBibleItems: NestedBibleItemsType;
    isFoundError: boolean;
} {
    let isFoundError = false;
    if (nestedBibleItems instanceof Array) {
        if (
            nestedBibleItems.length === 1 &&
            nestedBibleItems[0] instanceof BibleItem
        ) {
            return {
                nestedBibleItems: nestedBibleItems[0],
                isFoundError: true,
            };
        }
        nestedBibleItems = nestedBibleItems
            .map((item) => {
                const sanitized = deepSanitizeNestedItems(item);
                if (sanitized.isFoundError) {
                    isFoundError = true;
                }
                return sanitized.nestedBibleItems;
            })
            .filter((item1) => {
                if (item1 instanceof Array && item1.length === 0) {
                    isFoundError = true;
                    return false;
                }
                return true;
            });
    }
    return { nestedBibleItems, isFoundError };
}

export function sanitizeNestedItems(nestedBibleItems: NestedBibleItemsType) {
    while (true) {
        const sanitized = deepSanitizeNestedItems(nestedBibleItems);
        if (sanitized.isFoundError) {
            nestedBibleItems = sanitized.nestedBibleItems;
            continue;
        }
        break;
    }
    if (nestedBibleItems instanceof BibleItem) {
        nestedBibleItems = [nestedBibleItems];
    }
    return [...nestedBibleItems];
}

export function stringifyNestedBibleItem(
    nestedBibleItems: NestedBibleItemsType,
): NestedObjectsType {
    if (nestedBibleItems instanceof Array) {
        return nestedBibleItems.map((item1) => {
            return stringifyNestedBibleItem(item1);
        });
    }
    return nestedBibleItems.toJson();
}

function checkIsIdentical(
    nestedBibleItem1: NestedBibleItemsType,
    nestedBibleItem2: NestedBibleItemsType,
) {
    if (nestedBibleItem1 instanceof Array) {
        if (!(nestedBibleItem2 instanceof Array)) {
            return false;
        }
        if (nestedBibleItem1.length !== nestedBibleItem2.length) {
            return false;
        }
        for (let i = 0; i < nestedBibleItem1.length; i++) {
            if (!checkIsIdentical(nestedBibleItem1[i], nestedBibleItem2[i])) {
                return false;
            }
        }
        return true;
    }
    if (nestedBibleItem2 instanceof Array) {
        return false;
    }
    return nestedBibleItem1.checkIsSameId(nestedBibleItem2);
}
function checkIsIndexGTZero(index: number) {
    return index > 0;
}
function checkIsIndexLTLengthM1(index: number, length: number) {
    return index < length - 1;
}

function seekParent(
    nestedBibleItems: NestedBibleItemsType,
    targetNestedBibleItem: NestedBibleItemsType,
    isHorizontal: boolean = true,
): {
    parentNestedBibleItems: NestedBibleItemsType[];
    isHorizontal: boolean;
    targetNestedBibleItem: NestedBibleItemsType;
} | null {
    if (nestedBibleItems instanceof Array) {
        for (const nestedBibleItem of nestedBibleItems) {
            if (checkIsIdentical(nestedBibleItem, targetNestedBibleItem)) {
                return {
                    parentNestedBibleItems: nestedBibleItems,
                    isHorizontal,
                    targetNestedBibleItem: nestedBibleItem,
                };
            } else if (nestedBibleItem instanceof Array) {
                const foundParent = seekParent(
                    nestedBibleItem,
                    targetNestedBibleItem,
                    !isHorizontal,
                );
                if (foundParent !== null) {
                    return foundParent;
                }
            }
        }
    }
    return null;
}
function getFirstBibleItemAtIndex(
    nestedBibleItems: NestedBibleItemsType,
    index: number,
    isOrientation: boolean,
    isGoBack: boolean,
): BibleItem | null {
    if (nestedBibleItems instanceof Array) {
        if (index < 0) {
            index = nestedBibleItems.length - 1;
        } else if (index >= nestedBibleItems.length) {
            index = 0;
        }
        const target = nestedBibleItems[index];
        if (target instanceof BibleItem) {
            return target;
        } else {
            return getFirstBibleItemAtIndex(
                target,
                isOrientation ? 0 : target.length - 1,
                isGoBack ? !isOrientation : isOrientation,
                isGoBack,
            );
        }
    }
    return null;
}

const movingPosition: { [key: string]: [boolean, boolean] } = {
    // [isHorizontal, isGoBack]
    left: [true, true],
    right: [true, false],
    top: [false, true],
    bottom: [false, false],
};
export type MovingPositionType = keyof typeof movingPosition;

const BIBLE_ITEMS_PREVIEW_SETTING = 'bible-items-preview';
class BibleItemsViewController extends EventHandler<UpdateEventType> {
    private readonly _settingNameSuffix: string;
    setBibleVerseKey = (_verseKey: string) => {};
    handleScreenBibleVersesHighlighting = (
        _verseKey: string,
        _isToTop: boolean,
    ) => {};
    constructor(settingNameSuffix: string) {
        super();
        this._settingNameSuffix = `-${settingNameSuffix}`;
    }
    get colorNoteMap() {
        const str = getSetting(this.toSettingName('bible-items-color-note'));
        try {
            if (str) {
                return JSON.parse(str);
            }
        } catch (error) {
            handleError(error);
        }
        return {};
    }
    set colorNoteMap(newColorNoteMap: { [key: number]: string }) {
        const json = JSON.stringify(newColorNoteMap);
        setSetting(this.toSettingName('bible-items-color-note'), json);
    }
    get shouldNewLine() {
        return getSetting(this.toSettingName('-view-new-line')) === 'true';
    }
    set shouldNewLine(shouldNewLine: boolean) {
        setSetting(
            this.toSettingName('-view-new-line'),
            shouldNewLine ? 'true' : 'false',
        );
        this.fireUpdateEvent();
    }
    get bibleVerseKey() {
        const verseKey = getSetting(this.toSettingName('-bible-verse-key'), '');
        // (KJV) GEN 1:2-3
        if (verseKey.startsWith('(')) {
            return verseKey;
        }
        return '';
    }
    set bibleVerseKey(bibleVerseKey: string) {
        setSetting(this.toSettingName('-bible-verse-key'), bibleVerseKey);
        this.setBibleVerseKey(bibleVerseKey);
    }
    get nestedBibleItems() {
        try {
            const jsonStr = getSetting(this.toSettingName('-data')) || '[]';
            const json = JSON.parse(jsonStr);
            return parseNestedBibleItem(json);
        } catch (error) {
            handleError(error);
        }
        setSetting(this.toSettingName('-data'), '[]');
        return [];
    }
    set nestedBibleItems(newNestedBibleItems: NestedBibleItemsType) {
        newNestedBibleItems = sanitizeNestedItems(newNestedBibleItems);
        const jsonStr = JSON.stringify(
            stringifyNestedBibleItem(newNestedBibleItems),
        );
        setSetting(this.toSettingName('-data'), jsonStr);
        this.fireUpdateEvent();
    }
    get straightBibleItems() {
        return toStraightItems(this.nestedBibleItems);
    }
    get isAlone() {
        return this.straightBibleItems.length < 2;
    }
    getColorNote(bibleItem: BibleItem) {
        return this.colorNoteMap[bibleItem.id] ?? '';
    }
    _setColorNote(bibleItem: BibleItem, color: string | null) {
        const colorNoteMap = this.colorNoteMap;
        if (!color) {
            delete colorNoteMap[bibleItem.id];
        } else {
            colorNoteMap[bibleItem.id] = color;
        }
        const allBibleItemIds = this.straightBibleItems.map((item) => {
            return item.id.toString();
        });
        for (const id in colorNoteMap) {
            if (!allBibleItemIds.includes(id)) {
                delete colorNoteMap[id];
            }
        }
        this.colorNoteMap = colorNoteMap;
    }
    setColorNote(bibleItem: BibleItem, color: string | null) {
        this._setColorNote(bibleItem, color);
        this.syncTargetByColorNote(bibleItem);
    }
    getBibleItemsByColorNote(colorNote: string) {
        if (!colorNote) {
            return [];
        }
        const allBibleItems = this.straightBibleItems;
        return allBibleItems.filter((bibleItem) => {
            return this.getColorNote(bibleItem) === colorNote;
        });
    }
    toSettingName(suffixSettingName: string) {
        return `${BIBLE_ITEMS_PREVIEW_SETTING}${this._settingNameSuffix}${suffixSettingName}`;
    }

    finalRenderer(_bibleItem: BibleItem): ReactNode {
        throw new Error(
            'Method not implemented. You need to implement finalRenderer method',
        );
    }

    genBibleItemUniqueId() {
        return new Date().getTime() + Math.floor(Math.random() * 1e6);
    }

    fireUpdateEvent() {
        this.addPropEvent('update');
    }
    getNeighborBibleItems(
        bibleItem: BibleItem,
        positions: MovingPositionType[],
    ): {
        left: BibleItem | null;
        right: BibleItem | null;
        top: BibleItem | null;
        bottom: BibleItem | null;
    } {
        const seekNeighbor = (
            nestedBibleItems: NestedBibleItemsType,
            targetNestedBibleItem: NestedBibleItemsType,
            position: MovingPositionType,
        ): BibleItem | null => {
            if (!positions.includes(position)) {
                return null;
            }
            const [isHorizontal, isGoBack] = movingPosition[position];
            const found = seekParent(nestedBibleItems, targetNestedBibleItem);
            if (found === null) {
                return null;
            }
            const index = found.parentNestedBibleItems.indexOf(
                found.targetNestedBibleItem,
            );
            const isOrientation = found.isHorizontal === isHorizontal;
            const isMatchIndex = isGoBack
                ? checkIsIndexGTZero(index)
                : checkIsIndexLTLengthM1(
                      index,
                      found.parentNestedBibleItems.length,
                  );
            if (!(isOrientation && isMatchIndex)) {
                const found1 = seekNeighbor(
                    nestedBibleItems,
                    found.parentNestedBibleItems,
                    position,
                );
                if (found1 !== null) {
                    return found1;
                }
            }
            return getFirstBibleItemAtIndex(
                found.parentNestedBibleItems,
                index + (isGoBack ? -1 : 1),
                isOrientation,
                isGoBack,
            );
        };
        const nestedBibleItems = this.nestedBibleItems;
        const left = seekNeighbor(nestedBibleItems, bibleItem, 'left');
        const right = seekNeighbor(nestedBibleItems, bibleItem, 'right');
        const top = seekNeighbor(nestedBibleItems, bibleItem, 'top');
        const bottom = seekNeighbor(nestedBibleItems, bibleItem, 'bottom');
        return {
            left,
            right,
            top,
            bottom,
        };
    }
    seek(bibleItem: BibleItem, toastTitle: string, toastMessage: string) {
        const nestedBibleItems = this.nestedBibleItems;
        const foundParent = seekParent(nestedBibleItems, bibleItem);
        if (foundParent === null) {
            showSimpleToast(toastTitle, toastMessage);
            throw new Error();
        }
        const {
            parentNestedBibleItems,
            isHorizontal,
            targetNestedBibleItem: foundBibleItem,
        } = foundParent;
        const index = parentNestedBibleItems.indexOf(foundBibleItem);
        return {
            nestedBibleItems,
            parentNestedBibleItems,
            index,
            isHorizontal,
        };
    }
    applyTargetOrBibleKey(
        bibleItem: BibleItem,
        { target, bibleKey }: { target?: BibleTargetType; bibleKey?: string },
    ) {
        try {
            const { nestedBibleItems, parentNestedBibleItems, index } =
                this.seek(
                    bibleItem,
                    'Change Item',
                    'Unable to change bible item',
                );
            const actualBibleItem = parentNestedBibleItems[index] as BibleItem;
            actualBibleItem.bibleKey = bibleKey ?? actualBibleItem.bibleKey;
            actualBibleItem.target = target ?? actualBibleItem.target;

            this.nestedBibleItems = nestedBibleItems;
        } catch (error) {
            handleError(error);
        }
    }

    deleteBibleItem(bibleItem: BibleItem) {
        try {
            const { nestedBibleItems, parentNestedBibleItems, index } =
                this.seek(
                    bibleItem,
                    'Remove Item',
                    'Unable to remove bible item',
                );
            parentNestedBibleItems.splice(index, 1);
            this.nestedBibleItems = nestedBibleItems;
        } catch (error) {
            handleError(error);
        }
    }

    addBibleItem(
        bibleItem: BibleItem | null,
        newBibleItem: BibleItem,
        isHorizontal: boolean,
        isBefore: boolean,
    ) {
        const sourceColor =
            bibleItem === null ? null : this.getColorNote(bibleItem);
        newBibleItem = newBibleItem.clone();
        newBibleItem.id = this.genBibleItemUniqueId();
        if (bibleItem === null) {
            this.nestedBibleItems = [newBibleItem];
            return;
        }
        try {
            const {
                nestedBibleItems,
                parentNestedBibleItems,
                isHorizontal: foundIsHorizontal,
                index,
            } = this.seek(bibleItem, 'Add Item', 'Unable to add bible item');
            if (isHorizontal === foundIsHorizontal) {
                parentNestedBibleItems.splice(
                    index + (isBefore ? 0 : 1),
                    0,
                    newBibleItem,
                );
            } else {
                parentNestedBibleItems[index] = isBefore
                    ? [newBibleItem, bibleItem]
                    : [bibleItem, newBibleItem];
            }
            if (sourceColor) {
                this.setColorNote(newBibleItem, sourceColor);
            }
            this.nestedBibleItems = nestedBibleItems;
            newBibleItem.toTitle().then((title) => {
                attemptAddingHistory(newBibleItem.bibleKey, title, true);
            });
        } catch (error) {
            handleError(error);
        }
    }
    addBibleItemLeft(bibleItem: BibleItem, newBibleItem: BibleItem) {
        this.addBibleItem(bibleItem, newBibleItem, true, true);
    }
    addBibleItemRight(bibleItem: BibleItem, newBibleItem: BibleItem) {
        this.addBibleItem(bibleItem, newBibleItem, true, false);
    }
    addBibleItemTop(bibleItem: BibleItem, newBibleItem: BibleItem) {
        this.addBibleItem(bibleItem, newBibleItem, false, true);
    }
    addBibleItemBottom(bibleItem: BibleItem, newBibleItem: BibleItem) {
        this.addBibleItem(bibleItem, newBibleItem, false, false);
    }
    async genContextMenu(
        bibleItem: BibleItem,
        uuid: string,
    ): Promise<ContextMenuItemType[]> {
        const locale = await getBibleLocale(bibleItem.bibleKey);
        const langData = await getLangAsync(locale);
        return [
            {
                menuTitle: 'Split Horizontal',
                onSelect: () => {
                    this.addBibleItemLeft(bibleItem, bibleItem);
                },
                id: splitHorizontalId,
            },
            {
                menuTitle: 'Split Horizontal To',
                onSelect: (event1: any) => {
                    showBibleOption(event1, [], (newBibleKey: string) => {
                        const newBibleItem = bibleItem.clone();
                        newBibleItem.bibleKey = newBibleKey;
                        this.addBibleItemLeft(bibleItem, newBibleItem);
                    });
                },
            },
            {
                menuTitle: 'Split Vertical',
                onSelect: () => {
                    this.addBibleItemBottom(bibleItem, bibleItem);
                },
                id: splitVerticalId,
            },
            {
                menuTitle: 'Split Vertical To',
                onSelect: (event2: any) => {
                    showBibleOption(event2, [], (newBibleKey: string) => {
                        const newBibleItem = bibleItem.clone();
                        newBibleItem.bibleKey = newBibleKey;
                        this.addBibleItemBottom(bibleItem, newBibleItem);
                    });
                },
            },
            ...(langData !== null
                ? langData.extraBibleContextMenuItems(bibleItem, appProvider)
                : []),
            {
                menuTitle: 'Toggle Widget Full View',
                onSelect: () => {
                    document
                        .querySelector(
                            `#uuid-${uuid} .${BIBLE_VIEW_TEXT_CLASS}`,
                        )
                        ?.classList.toggle('app-full-view');
                },
            },
        ];
    }
    appendBibleItem(bibleItem: BibleItem) {
        const newBibleItem = bibleItem.clone();
        newBibleItem.id = this.genBibleItemUniqueId();
        let nestedBibleItems = this.nestedBibleItems;
        if (!(nestedBibleItems instanceof Array)) {
            nestedBibleItems = [nestedBibleItems];
        }
        this.nestedBibleItems = [...nestedBibleItems, newBibleItem];
        return newBibleItem;
    }
    syncBibleVerseSelection(
        bibleItem: BibleItem,
        verseKey: string,
        isToTop: boolean,
    ) {
        const containerDoms = document.querySelectorAll(
            `.${BIBLE_VIEW_TEXT_CLASS}[data-bible-item-id="${bibleItem.id}"]`,
        );
        Array.from(containerDoms).forEach((containerDom: any) => {
            const elements = containerDom.querySelectorAll(
                `.${BIBLE_VIEW_TEXT_CLASS} div[data-kjv-verse-key="${verseKey}"]`,
            );
            Array.from(elements).forEach((element: any) => {
                this.handleVersesSelecting(element, isToTop, true);
            });
        });
    }
    handleVersesHighlighting(kjvVerseKey: string, isToTop = false) {
        const elements = document.querySelectorAll(
            `.bible-view div[data-kjv-verse-key="${kjvVerseKey}"]`,
        );
        Array.from(elements).forEach((element: any) => {
            this.handleVersesSelecting(element, isToTop, true);
        });
    }
    handleVersesSelecting(
        targetDom: HTMLDivElement,
        isToTop: boolean,
        isForceSelect = false,
        bibleItem?: BibleItem,
    ) {
        const classList = targetDom.classList;
        if (!isForceSelect && classList.contains('selected')) {
            classList.remove('selected');
            return;
        }
        targetDom.parentElement?.childNodes.forEach((element: any) => {
            element.classList.remove('selected');
        });
        classList.add('selected');
        if (isToTop) {
            bringDomToTopView(targetDom);
        } else {
            bringDomToNearestView(targetDom);
        }
        if (bibleItem === undefined) {
            return;
        }
        this.bibleVerseKey = targetDom.dataset.verseKey ?? '';
        const kjvBibleVerseKey = targetDom.dataset.kjvVerseKey;
        if (kjvBibleVerseKey === undefined) {
            return;
        }
        this.handleScreenBibleVersesHighlighting(kjvBibleVerseKey, isToTop);

        const colorNote = this.getColorNote(bibleItem);
        if (!colorNote) {
            return;
        }
        this.getBibleItemsByColorNote(colorNote).forEach((bibleItem1) => {
            if (bibleItem1.id !== bibleItem.id) {
                this.syncBibleVerseSelection(
                    bibleItem1,
                    kjvBibleVerseKey,
                    isToTop,
                );
            }
        });
    }
    syncTargetByColorNote(bibleItem: BibleItem) {
        const { parentNestedBibleItems, index } = this.seek(
            bibleItem,
            'Sync Target',
            'Unable to change target',
        );
        const actualBibleItem = parentNestedBibleItems[index] as BibleItem;
        const colorNote = this.getColorNote(actualBibleItem);
        for (const bibleItem1 of this.getBibleItemsByColorNote(colorNote)) {
            if (bibleItem1.id === actualBibleItem.id) {
                continue;
            }
            this.applyTargetOrBibleKey(bibleItem1, {
                target: actualBibleItem.target,
            });
        }
    }
}

export const BibleItemsViewControllerContext =
    createContext<BibleItemsViewController | null>(null);

export function useBibleItemsViewControllerContext() {
    const viewController = use(BibleItemsViewControllerContext);
    if (viewController === null) {
        throw new Error(
            'useBibleItemViewControllerUpdateEvent must be used within a' +
                ' BibleItemViewControllerContext',
        );
    }
    return viewController;
}

export function useBibleItemViewControllerUpdateEvent() {
    const viewController = useBibleItemsViewControllerContext();
    const [nestedBibleItems, setNestedBibleItems] = useState(
        viewController.nestedBibleItems,
    );
    useAppEffect(() => {
        const update = () => {
            setNestedBibleItems(viewController.nestedBibleItems);
        };
        const instanceEvents = viewController.registerEventListener(
            ['update'],
            update,
        );
        return () => {
            viewController.unregisterEventListener(instanceEvents);
        };
    }, [viewController]);
    return nestedBibleItems;
}

export default BibleItemsViewController;
