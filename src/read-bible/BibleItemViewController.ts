import { ReactNode, createContext, useContext, useState } from 'react';

import BibleItem from '../bible-list/BibleItem';
import EventHandler from '../event/EventHandler';
import { useAppEffect } from '../helper/debuggerHelpers';
import {
    getSetting, setSetting,
} from '../helper/settingHelper';
import { handleError } from '../helper/errorHelpers';
import { WindowModEnum } from '../router/routeHelpers';
import { BibleItemType } from '../bible-list/bibleItemHelpers';
import { showSimpleToast } from '../toast/toastHelpers';
import { ContextMenuItemType } from '../others/AppContextMenu';
import { showBibleOption } from '../bible-search/BibleSelection';
import {
    genFoundBibleItemContextMenu,
} from '../bible-search/RenderActionButtons';

export type UpdateEventType = 'update';
export const RESIZE_SETTING_NAME = 'bible-previewer-render';

export type NestedBibleItemsType = BibleItem | NestedBibleItemsType[];
export type NestedObjectsType = BibleItemType | NestedObjectsType[];

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
        if (nestedBibleItems.length === 1) {
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

function seekParent(
    nestedBibleItems: NestedBibleItemsType, bibleItem: BibleItem,
    isHorizontal: boolean = true,
): {
    nestedBibleItems: NestedBibleItemsType[], isHorizontal: boolean,
    bibleItem: BibleItem,
} | null {
    if (nestedBibleItems instanceof Array) {
        for (const nestedBibleItem of nestedBibleItems) {
            if (nestedBibleItem instanceof Array) {
                const foundParent = seekParent(
                    nestedBibleItem, bibleItem, !isHorizontal,
                );
                if (foundParent !== null) {
                    return foundParent;
                }
            } else if (nestedBibleItem.checkIsSameId(bibleItem)) {
                return {
                    nestedBibleItems, isHorizontal, bibleItem: nestedBibleItem,
                };
            }
        }
    }
    return null;
}

const BIBLE_ITEMS_PREVIEW_SETTING = 'bible-items-preview';
export default class BibleItemViewController
    extends EventHandler<UpdateEventType>{
    private _settingNameSuffix: string;
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
    toSettingName(preSettingName: string) {
        return preSettingName + this._settingNameSuffix;
    }

    finalRenderer(_: BibleItem): ReactNode {
        return null;
    }

    genBibleItemUniqueId() {
        return (new Date()).getTime();
    }

    fireUpdateEvent() {
        this.addPropEvent('update');
    }
    seek(bibleItem: BibleItem, toastTitle: string, toastMessage: string) {
        const nestedBibleItems = this.nestedBibleItems;
        const foundParent = seekParent(nestedBibleItems, bibleItem);
        if (foundParent === null) {
            showSimpleToast(toastTitle, toastMessage);
            throw new Error();
        }
        const {
            nestedBibleItems: parentNestedBibleItems, isHorizontal,
            bibleItem: foundBibleItem,
        } = foundParent;
        const index = parentNestedBibleItems.indexOf(foundBibleItem);
        return {
            nestedBibleItems, parentNestedBibleItems, index, isHorizontal,
        };
    }
    changeItem(bibleItem: BibleItem, newBibleItem: BibleItem) {
        try {
            const {
                nestedBibleItems, parentNestedBibleItems, index,
            } = this.seek(
                bibleItem, 'Change Item', 'Unable to change bible item',
            );
            parentNestedBibleItems[index] = newBibleItem;
            this.nestedBibleItems = nestedBibleItems;
        } catch (error) { }
    }

    removeItem(bibleItem: BibleItem) {
        try {
            const {
                nestedBibleItems, parentNestedBibleItems, index,
            } = this.seek(
                bibleItem, 'Remove Item', 'Unable to remove bible item',
            );
            parentNestedBibleItems.splice(index, 1);
            this.nestedBibleItems = nestedBibleItems;
        } catch (error) { }
    }

    addBibleItem(bibleItem: BibleItem | null, newBibleItem: BibleItem,
        isHorizontal: boolean, isBefore: boolean,
    ) {
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
            this.nestedBibleItems = nestedBibleItems;
        } catch (error) { }
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
        bibleItem: BibleItem, _: WindowModEnum | null,
    ): ContextMenuItemType[] {
        return [
            {
                title: 'Split Left', onClick: () => {
                    this.addBibleItemLeft(bibleItem, bibleItem);
                },
            }, {
                title: 'Split Left To', onClick: (event: any) => {
                    showBibleOption(event, [], (bibleKey: string) => {
                        const newBibleItem = bibleItem.clone();
                        newBibleItem.bibleKey = bibleKey;
                        this.addBibleItemLeft(bibleItem, newBibleItem);
                    });
                },
            },
            {
                title: 'Split Bottom', onClick: () => {
                    this.addBibleItemBottom(bibleItem, bibleItem);
                },
            }, {
                title: 'Split Bottom To', onClick: (event: any) => {
                    showBibleOption(event, [], (bibleKey: string) => {
                        const newBibleItem = bibleItem.clone();
                        newBibleItem.bibleKey = bibleKey;
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

export class SearchBibleItemViewController extends BibleItemViewController {
    private _nestedBibleItems: NestedBibleItemsType;
    private static _instance: SearchBibleItemViewController | null = null;
    selectedBibleItem: BibleItem;
    setInputText = (_: string) => { };
    setBibleKey = (_: string | null) => { };
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
    checkIsBibleItemSelected(bibleItem: BibleItem) {
        return bibleItem === this.selectedBibleItem;
    }
    static getInstance() {
        if (this._instance === null) {
            this._instance = new this;
        }
        return this._instance;
    }
    genContextMenu(
        bibleItem: BibleItem, windowMode: WindowModEnum | null,
    ): ContextMenuItemType[] {
        const menu1 = windowMode === null ? [] : genFoundBibleItemContextMenu(
            bibleItem, windowMode, this.checkIsBibleItemSelected(bibleItem),
        );
        const menus2 = super.genContextMenu(bibleItem, windowMode);
        if (!this.checkIsBibleItemSelected(bibleItem)) {
            menus2.push({
                title: 'Edit', onClick: () => {
                    const newBibleItem = bibleItem.clone(true);
                    this.selectedBibleItem = newBibleItem;
                    this.changeItem(bibleItem, newBibleItem);
                    bibleItem.toTitle().then((inputText) => {
                        this.setInputText(inputText);
                        this.setBibleKey(bibleItem.bibleKey);
                    });
                },
            });
        }
        return [...menu1, ...menus2];
    }
}

export const BibleItemViewControllerContext = createContext<
    BibleItemViewController
>(new BibleItemViewController(''));

export function useBibleItemViewControllerContext() {
    return useContext(BibleItemViewControllerContext);
}

export function useBIVCUpdateEvent() {
    const bibleItemViewController = useBibleItemViewControllerContext();
    const [nestedBibleItems, setNestedBibleItems] = useState(
        bibleItemViewController.nestedBibleItems,
    );
    useAppEffect(() => {
        const update = () => {
            setNestedBibleItems(bibleItemViewController.nestedBibleItems);
        };
        const instanceEvents = bibleItemViewController.registerEventListener(
            ['update'], update,
        ) || [];
        return () => {
            bibleItemViewController.unregisterEventListener(instanceEvents);
        };
    }, [bibleItemViewController]);
    return nestedBibleItems;
}
