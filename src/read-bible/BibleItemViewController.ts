import { ReactNode, useState } from 'react';

import BibleItem from '../bible-list/BibleItem';
import EventHandler from '../event/EventHandler';
import { useAppEffect } from '../helper/debuggerHelpers';
import {
    getSetting, getSettingPrefix, setSetting,
} from '../helper/settingHelper';
import { handleError } from '../helper/errorHelpers';
import { clearFlexSizeSetting } from '../resize-actor/flexSizeHelpers';
import { WindowModEnum } from '../router/routeHelpers';
import { BibleItemType } from '../bible-list/bibleItemHelpers';
import { showSimpleToast } from '../toast/toastHelpers';
import { ContextMenuItemType } from '../others/AppContextMenu';
import { showBibleOption } from '../bible-search/BibleSelection';

export type UpdateEventType = 'update';
export const RESIZE_SETTING_NAME = 'bible-previewer-render';

export type NestedBibleItemsType = BibleItem | NestedBibleItemsType[];
export type NestedObjectsType = BibleItemType | NestedObjectsType[];

function parseNestedBibleItem(json: any): NestedBibleItemsType {
    if (json instanceof Array) {
        let nestedBibleItems: NestedBibleItemsType = json.map((item: any) => {
            return parseNestedBibleItem(item);
        });
        nestedBibleItems = sanitizeZeroItem(nestedBibleItems);
        return nestedBibleItems;
    }
    return BibleItem.fromJson(json);
}

function sanitizeZeroItem(
    nestedBibleItems: NestedBibleItemsType,
): NestedBibleItemsType {
    if (nestedBibleItems instanceof Array) {
        let isFoundError = false;
        const newNestedBibleItems = nestedBibleItems.map((item1) => {
            const newItem1 = sanitizeZeroItem(item1);
            if (
                item1 instanceof Array && newItem1 instanceof Array &&
                item1.length !== newItem1.length
            ) {
                isFoundError = true;
            }
            return newItem1;
        }).filter((item1) => {
            if (item1 instanceof Array && item1.length === 0) {
                return false;
            }
            return true;
        });
        if (isFoundError) {
            return sanitizeZeroItem(newNestedBibleItems);
        }
        return newNestedBibleItems;
    }
    return nestedBibleItems;
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

function getBibleItemsPreviewSettingName(windowMode: WindowModEnum | null) {
    const prefixSetting = getSettingPrefix(windowMode);
    return `${prefixSetting}${BIBLE_ITEMS_PREVIEW_SETTING}`;
}
type FinalRendererType = (bibleItem: BibleItem) => ReactNode;
const BIBLE_ITEMS_PREVIEW_SETTING = 'bible-items-preview';
export default class BibleItemViewController
    extends EventHandler<UpdateEventType>{
    private _settingNameSuffix: string | null;
    finalRenderer: FinalRendererType;
    constructor(finalRenderer: FinalRendererType, settingNameSuffix?: string) {
        super();
        this._settingNameSuffix = settingNameSuffix || null;
        this.finalRenderer = finalRenderer;
    }
    get settingName() {
        return getBibleItemsPreviewSettingName(null) + this._settingNameSuffix;
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
        if (
            newNestedBibleItems instanceof Array &&
            this.nestedBibleItems instanceof Array
            && newNestedBibleItems.length !== this.nestedBibleItems.length
        ) {
            clearFlexSizeSetting(RESIZE_SETTING_NAME);
        }
        const jsonStr = JSON.stringify(stringifyNestedBibleItem(
            newNestedBibleItems,
        ));
        setSetting(this.settingName, jsonStr);
        this.fireUpdateEvent();
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
    genContextMenu(bibleItem: BibleItem): ContextMenuItemType[] {
        return [
            {
                title: 'Split Right', onClick: () => {
                    this.addBibleItemRight(bibleItem, bibleItem);
                },
            }, {
                title: 'Split Right To', onClick: (event: any) => {
                    showBibleOption(event, [], (bibleKey: string) => {
                        const newBibleItem = bibleItem.clone();
                        newBibleItem.bibleKey = bibleKey;
                        this.addBibleItemRight(bibleItem, newBibleItem);
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
}

export class SearchBibleItemViewController extends BibleItemViewController {
    private _nestedBibleItems: NestedBibleItemsType;
    private _selectBibleItemId: number;
    constructor() {
        super((_: BibleItem) => null);
        debugger;
        this._selectBibleItemId = this.genBibleItemUniqueId();
        const bibleItem = BibleItem.fromJson({
            id: this._selectBibleItemId, bibleKey: 'KJV', metadata: {},
            target: { bookKey: 'GEN', chapter: 1, verseStart: 1, verseEnd: 1 },
        });
        this._nestedBibleItems = [bibleItem];
    }
    get nestedBibleItems() {
        return this._nestedBibleItems;
    }
    set nestedBibleItems(newNestedBibleItems: NestedBibleItemsType) {
        this._nestedBibleItems = sanitizeZeroItem(newNestedBibleItems);
        this.fireUpdateEvent();
    }
    checkIsBibleItemSelected(bibleItem: BibleItem) {
        console.log(bibleItem.id, this._selectBibleItemId);

        return bibleItem.id === this._selectBibleItemId;
    }
}

export function useBIVCUpdateEvent(
    bibleItemViewController: BibleItemViewController) {
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
