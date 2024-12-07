import { ReactNode, createContext, useContext, useState } from 'react';

import BibleItem from '../bible-list/BibleItem';
import EventHandler from '../event/EventHandler';
import { useAppEffect } from '../helper/debuggerHelpers';
import {
    getSetting, setSetting,
} from '../helper/settingHelpers';
import { handleError } from '../helper/errorHelpers';
import { WindowModEnum } from '../router/routeHelpers';
import { BibleItemType } from '../bible-list/bibleItemHelpers';
import { showSimpleToast } from '../toast/toastHelpers';
import {
    ContextMenuItemType, genContextMenuItemShortcutKey,
} from '../others/AppContextMenu';
import { showBibleOption } from '../bible-search/BibleSelection';
import {
    genFoundBibleItemContextMenu,
} from '../bible-search/RenderActionButtons';
import { closeCurrentEditingBibleItem } from './readBibleHelpers';
import { attemptAddingHistory } from '../bible-search/InputHistory';
import { EventMapper } from '../event/KeyboardEventListener';
import BibleView, { finalRenderer } from './BibleView';

export type UpdateEventType = 'update';
export const RESIZE_SETTING_NAME = 'bible-previewer-render';

export type NestedBibleItemsType = BibleItem | NestedBibleItemsType[];
export type NestedObjectsType = BibleItemType | NestedObjectsType[];

export const closeEventMapper: EventMapper = {
    wControlKey: ['Ctrl'],
    lControlKey: ['Ctrl'],
    mControlKey: ['Meta'],
    key: 'w',
};

export const ctrlShiftMetaKeys: any = {
    wControlKey: ['Ctrl', 'Shift'],
    lControlKey: ['Ctrl', 'Shift'],
    mControlKey: ['Meta', 'Shift'],
};

const splitHorizontalId = 'split-horizontal';
const splitVerticalId = 'split-vertical';

function parseNestedBibleItem(json: any): NestedBibleItemsType {
    if (json instanceof Array) {
        const nestedBibleItems: NestedBibleItemsType = json.map((item: any) => {
            return parseNestedBibleItem(item);
        });
        return nestedBibleItems;
    }
    return BibleItem.fromJson(json);
}

function sanitizeNestedItems(nestedBibleItems: NestedBibleItemsType) {
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
function deepSanitizeNestedItems(
    nestedBibleItems: NestedBibleItemsType,
): { nestedBibleItems: NestedBibleItemsType, isFoundError: boolean } {
    let isFoundError = false;
    if (nestedBibleItems instanceof Array) {
        if (
            nestedBibleItems.length === 1 &&
            nestedBibleItems[0] instanceof BibleItem
        ) {
            return {
                nestedBibleItems: nestedBibleItems[0], isFoundError: true,
            };
        }
        nestedBibleItems = nestedBibleItems.map((item) => {
            const sanitized = deepSanitizeNestedItems(item);
            if (sanitized.isFoundError) {
                isFoundError = true;
            }
            return sanitized.nestedBibleItems;
        }).filter((item1) => {
            if (item1 instanceof Array && item1.length === 0) {
                isFoundError = true;
                return false;
            }
            return true;
        });
    }
    return { nestedBibleItems, isFoundError };
}

function stringifyNestedBibleItem(
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
    parentNestedBibleItems: NestedBibleItemsType[], isHorizontal: boolean,
    targetNestedBibleItem: NestedBibleItemsType,
} | null {
    if (nestedBibleItems instanceof Array) {
        for (const nestedBibleItem of nestedBibleItems) {
            if (checkIsIdentical(nestedBibleItem, targetNestedBibleItem)) {
                return {
                    parentNestedBibleItems: nestedBibleItems, isHorizontal,
                    targetNestedBibleItem: nestedBibleItem,
                };
            } else if (nestedBibleItem instanceof Array) {
                const foundParent = seekParent(
                    nestedBibleItem, targetNestedBibleItem, !isHorizontal,
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
    nestedBibleItems: NestedBibleItemsType, index: number,
    isOrientation: boolean, isGoBack: boolean,
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
                target, isOrientation ? 0 : target.length - 1,
                isGoBack ? !isOrientation : isOrientation, isGoBack,
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
export default class BibleItemViewController
    extends EventHandler<UpdateEventType> {

    private readonly _settingNameSuffix: string;
    readonly colorNoteMap: WeakMap<BibleItem, string> = new WeakMap();
    constructor(settingNameSuffix: string) {
        super();
        this._settingNameSuffix = `-${settingNameSuffix}`;
    }
    get settingName() {
        return this.toSettingName(BIBLE_ITEMS_PREVIEW_SETTING);
    }
    get nestedBibleItems() {
        try {
            const jsonStr = getSetting(this.settingName) || '[]';
            const json = JSON.parse(jsonStr);
            return parseNestedBibleItem(json);
        } catch (error) {
            handleError(error);
        }
        setSetting(this.settingName, '[]');
        return [];
    }
    set nestedBibleItems(newNestedBibleItems: NestedBibleItemsType) {
        newNestedBibleItems = sanitizeNestedItems(newNestedBibleItems);
        const jsonStr = JSON.stringify(
            stringifyNestedBibleItem(newNestedBibleItems),
        );
        setSetting(this.settingName, jsonStr);
        this.fireUpdateEvent();
    }
    get straightBibleItems() {
        const traverse = (items: any): any => {
            if (items instanceof Array) {
                return items.flatMap((item) => {
                    return traverse(item);
                });
            }
            return [items];
        };
        const allBibleItems: BibleItem[] = traverse(this.nestedBibleItems);
        return allBibleItems;
    }
    get isAlone() {
        return this.straightBibleItems.length < 2;
    }
    getColorNote(bibleItem: BibleItem) {
        return this.colorNoteMap.get(bibleItem) || '';
    }
    setColorNote(bibleItem: BibleItem, color: string | null) {
        if (!color) {
            this.colorNoteMap.delete(bibleItem);
        } else {
            this.colorNoteMap.set(bibleItem, color);
        }
    }
    toSettingName(preSettingName: string) {
        return preSettingName + this._settingNameSuffix;
    }

    finalRenderer(bibleItem: BibleItem): ReactNode {
        return finalRenderer(bibleItem);
    }

    genBibleItemUniqueId() {
        return (new Date()).getTime();
    }

    fireUpdateEvent() {
        this.addPropEvent('update');
    }
    getNeighborBibleItems(
        bibleItem: BibleItem,
        positions: MovingPositionType[],
    ): {
        left: BibleItem | null, right: BibleItem | null,
        top: BibleItem | null, bottom: BibleItem | null,
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
            const isMatchIndex = isGoBack ? checkIsIndexGTZero(index) : (
                checkIsIndexLTLengthM1(
                    index, found.parentNestedBibleItems.length,
                )
            );
            if (!(isOrientation && isMatchIndex)) {
                const found1 = seekNeighbor(
                    nestedBibleItems, found.parentNestedBibleItems, position,
                );
                if (found1 !== null) {
                    return found1;
                }
            }
            return getFirstBibleItemAtIndex(
                found.parentNestedBibleItems, index + (isGoBack ? -1 : 1),
                isOrientation, isGoBack,
            );
        };
        const nestedBibleItems = this.nestedBibleItems;
        const left = seekNeighbor(nestedBibleItems, bibleItem, 'left');
        const right = seekNeighbor(nestedBibleItems, bibleItem, 'right');
        const top = seekNeighbor(nestedBibleItems, bibleItem, 'top');
        const bottom = seekNeighbor(nestedBibleItems, bibleItem, 'bottom');
        return {
            left, right, top, bottom,
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
            parentNestedBibleItems, isHorizontal,
            targetNestedBibleItem: foundBibleItem,
        } = foundParent;
        const index = parentNestedBibleItems.indexOf(foundBibleItem);
        return {
            nestedBibleItems, parentNestedBibleItems, index, isHorizontal,
        };
    }
    changeBibleItem(bibleItem: BibleItem, newBibleItem: BibleItem) {
        try {
            const {
                nestedBibleItems, parentNestedBibleItems, index,
            } = this.seek(
                bibleItem, 'Change Item', 'Unable to change bible item',
            );
            parentNestedBibleItems[index] = newBibleItem;
            this.setColorNote(newBibleItem, this.getColorNote(bibleItem));
            this.nestedBibleItems = nestedBibleItems;
        } catch (error) {
            handleError(error);
        }
    }

    removeBibleItem(bibleItem: BibleItem) {
        try {
            if (this.isAlone) {
                return;
            }
            const {
                nestedBibleItems, parentNestedBibleItems, index,
            } = this.seek(
                bibleItem, 'Remove Item', 'Unable to remove bible item',
            );
            parentNestedBibleItems.splice(index, 1);
            this.nestedBibleItems = nestedBibleItems;
        } catch (error) { }
    }

    addBibleItem(
        bibleItem: BibleItem | null, newBibleItem: BibleItem,
        isHorizontal: boolean, isBefore: boolean,
    ) {
        const sourceColor = (
            bibleItem === null ? null : this.getColorNote(bibleItem)
        );
        newBibleItem = newBibleItem.clone();
        newBibleItem.id = this.genBibleItemUniqueId();
        if (bibleItem === null) {
            this.nestedBibleItems = [newBibleItem];
            return;
        }
        try {
            const {
                nestedBibleItems, parentNestedBibleItems,
                isHorizontal: foundIsHorizontal, index,
            } = this.seek(
                bibleItem, 'Add Item', 'Unable to add bible item',
            );
            if (isHorizontal === foundIsHorizontal) {
                parentNestedBibleItems.splice(
                    index + (isBefore ? 0 : 1), 0, newBibleItem,
                );
            } else {
                parentNestedBibleItems[index] = (
                    isBefore ?
                        [newBibleItem, bibleItem] :
                        [bibleItem, newBibleItem]
                );
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
    addBibleItemLeft(
        bibleItem: BibleItem, newBibleItem: BibleItem,
    ) {
        this.addBibleItem(bibleItem, newBibleItem, true, true);
    }
    addBibleItemRight(
        bibleItem: BibleItem, newBibleItem: BibleItem,
    ) {
        this.addBibleItem(bibleItem, newBibleItem, true, false);
    }
    addBibleItemTop(
        bibleItem: BibleItem, newBibleItem: BibleItem,
    ) {
        this.addBibleItem(bibleItem, newBibleItem, false, true);
    }
    addBibleItemBottom(
        bibleItem: BibleItem, newBibleItem: BibleItem,
    ) {
        this.addBibleItem(bibleItem, newBibleItem, false, false);
    }
    genContextMenu(
        bibleItem: BibleItem, _?: WindowModEnum | null,
    ): ContextMenuItemType[] {
        return [
            {
                menuTitle: 'Split Horizontal', onClick: () => {
                    this.addBibleItemLeft(bibleItem, bibleItem);
                }, id: splitHorizontalId,
            }, {
                menuTitle: 'Split Horizontal To', onClick: (event: any) => {
                    showBibleOption(event, [], (newBibleKey: string) => {
                        const newBibleItem = bibleItem.clone();
                        newBibleItem.bibleKey = newBibleKey;
                        this.addBibleItemLeft(bibleItem, newBibleItem);
                    });
                },
            },
            {
                menuTitle: 'Split Vertical', onClick: () => {
                    this.addBibleItemBottom(bibleItem, bibleItem);
                }, id: splitVerticalId,
            }, {
                menuTitle: 'Split Vertical To', onClick: (event: any) => {
                    showBibleOption(event, [], (newBibleKey: string) => {
                        const newBibleItem = bibleItem.clone();
                        newBibleItem.bibleKey = newBibleKey;
                        this.addBibleItemBottom(
                            bibleItem, newBibleItem,
                        );
                    });
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
    }
}

let instance: SearchBibleItemViewController | null = null;
export class SearchBibleItemViewController extends BibleItemViewController {

    private _nestedBibleItems: NestedBibleItemsType;
    selectedBibleItem: BibleItem;
    setInputText = (_: string) => { };
    setBibleKey = (_: string | null) => { };
    onSearchAddBibleItem = () => { };

    constructor() {
        super('');
        this.selectedBibleItem = BibleItem.fromJson({
            id: this.genBibleItemUniqueId(), bibleKey: 'KJV', metadata: {},
            target: { bookKey: 'GEN', chapter: 1, verseStart: 1, verseEnd: 1 },
        });
        this._nestedBibleItems = [this.selectedBibleItem];
    }
    get nestedBibleItems() {
        return this._nestedBibleItems;
    }
    set nestedBibleItems(newNestedBibleItems: NestedBibleItemsType) {
        this._nestedBibleItems = sanitizeNestedItems(newNestedBibleItems);
        this.fireUpdateEvent();
    }
    get selectedIndex() {
        return this.straightBibleItems.findIndex((bibleItem) => {
            return bibleItem === this.selectedBibleItem;
        });
    }
    setColorNote(bibleItem: BibleItem, color: string | null) {
        super.setColorNote(bibleItem, color);
        if (color) {
            if (this.checkIsBibleItemSelected(bibleItem)) {
                this.syncBibleItems();
            } else {
                this.syncBibleItem(bibleItem);
            }
        }
    }
    checkIsBibleItemSelected(bibleItem: BibleItem) {
        return bibleItem === this.selectedBibleItem;
    }
    static getInstance() {
        if (instance === null) {
            instance = new this;
        }
        return instance;
    }
    editBibleItem(bibleItem: BibleItem) {
        this.selectedBibleItem.toTitle().then((inputText) => {
            attemptAddingHistory(bibleItem.bibleKey, inputText, true);
        });
        const newBibleItem = bibleItem.clone(true);
        this.selectedBibleItem = newBibleItem;
        this.changeBibleItem(bibleItem, newBibleItem);
        bibleItem.toTitle().then((inputText) => {
            this.setInputText(inputText);
            this.setBibleKey(bibleItem.bibleKey);
        });
    }
    genContextMenu(
        bibleItem: BibleItem, windowMode: WindowModEnum | null = null,
    ): ContextMenuItemType[] {
        const isBibleItemSelected = this.checkIsBibleItemSelected(bibleItem);
        const menu1 = genFoundBibleItemContextMenu(
            bibleItem, windowMode, this.onSearchAddBibleItem,
            isBibleItemSelected,
        );
        const menus2 = super.genContextMenu(bibleItem, windowMode);
        if (!isBibleItemSelected) {
            menus2.push({
                menuTitle: 'Edit', title: 'Double click on header to edit',
                onClick: () => {
                    this.editBibleItem(bibleItem);
                },
            });
        } else {
            const menu2IdMap: { [key: string]: ContextMenuItemType } = (
                Object.fromEntries(
                    menus2.map((menuItem) => [menuItem.id, menuItem]),
                )
            );
            if (menu2IdMap[splitHorizontalId]) {
                menu2IdMap[splitHorizontalId].otherChild = (
                    genContextMenuItemShortcutKey({
                        ...ctrlShiftMetaKeys, key: 's',
                    })
                );
            }
            if (menu2IdMap[splitVerticalId]) {
                menu2IdMap[splitVerticalId].otherChild = (
                    genContextMenuItemShortcutKey({
                        ...ctrlShiftMetaKeys, key: 'v',
                    })
                );
            }
        }
        const menu3: ContextMenuItemType[] = this.isAlone ? [] : [
            {
                menuTitle: 'Close',
                otherChild: isBibleItemSelected ? (
                    genContextMenuItemShortcutKey(closeEventMapper)
                ) : undefined,
                onClick: () => {
                    if (bibleItem === this.selectedBibleItem) {
                        closeCurrentEditingBibleItem();
                    } else {
                        this.removeBibleItem(bibleItem);
                    }
                },
            },
        ];
        return [...menu1, ...menus2, ...menu3];
    }
    syncBibleItems() {
        this.straightBibleItems.forEach((bibleItem) => {
            this.syncBibleItem(bibleItem);
        });
    }
    syncBibleItem(bibleItem: BibleItem) {
        if (
            this.checkIsBibleItemSelected(bibleItem) ||
            bibleItem.checkIsTargetIdentical(this.selectedBibleItem)
        ) {
            return;
        }
        const editingColor = this.getColorNote(this.selectedBibleItem);
        const currentColor = this.getColorNote(bibleItem);
        if (!editingColor || !currentColor || currentColor !== editingColor) {
            return;
        }
        const newBibleItem = bibleItem.clone(true);
        newBibleItem.target = this.selectedBibleItem.clone().target;
        this.changeBibleItem(bibleItem, newBibleItem);
    }
    removeBibleItem(bibleItem: BibleItem) {
        super.removeBibleItem(bibleItem);
        const straightBibleItems = this.straightBibleItems;
        if (!straightBibleItems.includes(this.selectedBibleItem)) {
            const lastBibleItem = straightBibleItems[
                straightBibleItems.length - 1
            ];
            this.editBibleItem(lastBibleItem);
        }
    }
}

export const BibleItemViewControllerContext = (
    createContext<BibleItemViewController>(new BibleItemViewController(''))
);

export function useBibleItemViewControllerContext() {
    return useContext(BibleItemViewControllerContext);
}

export function useBIVCUpdateEvent() {
    const viewController = useBibleItemViewControllerContext();
    const [nestedBibleItems, setNestedBibleItems] = useState(
        viewController.nestedBibleItems,
    );
    useAppEffect(() => {
        const update = () => {
            setNestedBibleItems(viewController.nestedBibleItems);
        };
        const instanceEvents = viewController.registerEventListener(
            ['update'], update,
        ) || [];
        return () => {
            viewController.unregisterEventListener(instanceEvents);
        };
    }, [viewController]);
    return nestedBibleItems;
}
