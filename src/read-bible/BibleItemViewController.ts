import { useState } from 'react';
import BibleItem from '../bible-list/BibleItem';
import EventHandler from '../event/EventHandler';
import { useAppEffect } from '../helper/debuggerHelpers';
import {
    getSetting, getSettingPrefix, setSetting,
} from '../helper/settingHelper';
import { handleError } from '../helper/errorHelpers';
import { clearFlexSizeSetting } from '../resize-actor/flexSizeHelpers';
import { WindowModEnum } from '../router/routeHelpers';

export type UpdateEventType = 'update';
export const RESIZE_SETTING_NAME = 'bible-previewer-render';

function parseBibleItem(json: any): any {
    if (json instanceof Array) {
        return json.map((item: any) => {
            return parseBibleItem(item);
        });
    }
    return BibleItem.fromJson(json);
}

function stringifyBibleItem(item: any): any {
    if (item instanceof Array) {
        return item.map((item1) => {
            return stringifyBibleItem(item1);
        });
    }
    return item.toJson();
}

function cleanBibleItems(item: any): any {
    if (item instanceof Array) {
        return item.map((item1) => {
            return cleanBibleItems(item1);
        }).filter((item1) => {
            if (item1 instanceof Array && item1.length === 0) {
                return false;
            }
            return true;
        });
    }
    return item;
}
const BIBLE_ITEMS_PREVIEW_SETTING = 'bible-items-preview';
export default class BibleItemViewController
    extends EventHandler<UpdateEventType>{
    static _instance: BibleItemViewController | null = null;
    static getBibleItemsPreviewSettingName(windowMode: WindowModEnum | null) {
        const prefixSetting = getSettingPrefix(windowMode);
        return `${prefixSetting}${BIBLE_ITEMS_PREVIEW_SETTING}`;
    }
    get bibleItems(): any {
        try {
            const settingName = BibleItemViewController.
                getBibleItemsPreviewSettingName(null);
            const jsonStr = getSetting(settingName) || '[]';
            const json = JSON.parse(jsonStr);
            return parseBibleItem(json);
        } catch (error) {
            handleError(error);
        }
        setSetting('bibleItems', '[]');
        return [];
    }
    set bibleItems(newBibleItems: BibleItem[]) {
        if (newBibleItems.length !== this.bibleItems.length) {
            clearFlexSizeSetting(RESIZE_SETTING_NAME);
        }
        const jsonStr = JSON.stringify(stringifyBibleItem(newBibleItems));
        const settingName = BibleItemViewController.
            getBibleItemsPreviewSettingName(null);
        setSetting(settingName, jsonStr);
        this.fireUpdateEvent();
    }

    private walkBibleItems(
        fullBiblItems: any, indices: number[],
        bibleItems?: any
    ): {
        bibleItems: BibleItem[],
        fullBiblItems: any,
        index: number,
    } {
        if (!bibleItems) {
            bibleItems = fullBiblItems;
        }
        if (indices.length < 2) {
            return {
                fullBiblItems,
                bibleItems,
                index: indices.length === 1 ? indices[0] : 0,
            };
        }
        indices = [...indices];
        const index = indices.shift()!;
        return this.walkBibleItems(
            fullBiblItems, indices,
            bibleItems[index],
        );
    }

    fireUpdateEvent() {
        this.addPropEvent('update');
    }

    changeItemBibleKey(indices: number[], bibleKey: string) {
        const { fullBiblItems, bibleItems, index } = this.walkBibleItems(
            this.bibleItems, indices,
        );
        bibleItems[index].bibleKey = bibleKey;
        this.bibleItems = fullBiblItems;
    }

    changeItemAtIndex(bibleItem: BibleItem, indices: number[]) {
        const { fullBiblItems, bibleItems, index } = this.walkBibleItems(
            this.bibleItems, indices,
        );
        bibleItems[index] = bibleItem;
        this.bibleItems = fullBiblItems;
    }

    removeItem(indices: number[]) {
        const { fullBiblItems, bibleItems, index } = this.walkBibleItems(
            this.bibleItems, indices,
        );
        bibleItems.splice(index, 1);
        const newFullBiblItems = cleanBibleItems(fullBiblItems);
        this.bibleItems = newFullBiblItems;
    }

    addItem(bibleItem: BibleItem, indices: number[]) {
        const { fullBiblItems, bibleItems } = this.walkBibleItems(
            this.bibleItems, indices,
        );
        bibleItems.push(bibleItem);
        this.bibleItems = fullBiblItems;
    }
    private addItemAtIndex(indices: number[], bibleItem: BibleItem) {
        const { fullBiblItems, bibleItems, index } = this.walkBibleItems(
            this.bibleItems, indices,
        );
        bibleItems.splice(index, 0, bibleItem);
        this.bibleItems = fullBiblItems;
    }
    private transform(indices: number[], isHorizontal: boolean) {
        const { fullBiblItems, bibleItems, index } = this.walkBibleItems(
            this.bibleItems, indices,
        );
        if (!(bibleItems[index] instanceof Array)) {
            (bibleItems as any)[index] = [bibleItems[index]];
            indices = [...indices, 0];
            isHorizontal = false;
        }
        this.bibleItems = fullBiblItems;
        return { indices, isHorizontal };
    }
    private transformToVertical(indices: number[], isHorizontal: boolean) {
        if (isHorizontal) {
            return this.transform(indices, isHorizontal);
        }
        return { indices, isHorizontal };
    }
    private transformToHorizontal(indices: number[], isHorizontal: boolean) {
        if (!isHorizontal) {
            return this.transform(indices, isHorizontal);
        }
        return { indices, isHorizontal };
    }
    addItemAtIndexLeft(
        indices: number[], bibleItem: BibleItem, isHorizontal: boolean,
    ) {
        const {
            indices: newIndices,
        } = this.transformToHorizontal(indices, isHorizontal);
        this.addItemAtIndex(newIndices, bibleItem);
    }
    addItemAtIndexRight(
        indices: number[], bibleItem: BibleItem, isHorizontal: boolean,
    ) {
        const {
            indices: newIndices,
        } = this.transformToHorizontal(indices, isHorizontal);
        newIndices[newIndices.length - 1] += 1;
        this.addItemAtIndex(newIndices, bibleItem);
    }
    addItemAtIndexTop(
        indices: number[], bibleItem: BibleItem, isHorizontal: boolean,
    ) {
        const {
            indices: newIndices,
        } = this.transformToVertical(indices, isHorizontal);
        this.addItemAtIndex(newIndices, bibleItem);
    }
    addItemAtIndexBottom(
        indices: number[], bibleItem: BibleItem, isHorizontal: boolean,
    ) {
        const {
            indices: newIndices,
        } = this.transformToVertical(indices, isHorizontal);
        newIndices[newIndices.length - 1] += 1;
        this.addItemAtIndex(newIndices, bibleItem);
    }
    private cloneAtIndex(
        indices: number[], bibleKey?: string,
    ) {
        const { bibleItems, index } = this.walkBibleItems(
            this.bibleItems, indices,
        );
        const clonedBibleItem = bibleItems[index].clone();
        if (bibleKey) {
            clonedBibleItem.bibleKey = bibleKey;
        }
        return clonedBibleItem;
    }
    duplicateItemAtIndexRight(
        indices: number[], isHorizontal: boolean, bibleKey?: string,
    ) {
        const duplicatedBibleItem = this.cloneAtIndex(indices, bibleKey);
        this.addItemAtIndexRight(indices, duplicatedBibleItem, isHorizontal);
    }
    duplicateItemAtIndexBottom(
        indices: number[], isHorizontal: boolean, bibleKey?: string,
    ) {
        const duplicatedBibleItem = this.cloneAtIndex(indices, bibleKey);
        this.addItemAtIndexBottom(indices, duplicatedBibleItem, isHorizontal);
    }

    static getInstance() {
        if (this._instance === null) {
            this._instance = new BibleItemViewController();
        }
        return this._instance;
    }
}

export function useBIVCUpdateEvent(
    bibleItemViewController: BibleItemViewController) {
    const [bibleItems, setBibleItems] = useState(
        bibleItemViewController.bibleItems);
    useAppEffect(() => {
        const update = () => {
            setBibleItems(bibleItemViewController.bibleItems);
        };
        const instanceEvents = bibleItemViewController.registerEventListener(
            ['update'], update,
        ) || [];
        return () => {
            bibleItemViewController.unregisterEventListener(instanceEvents);
        };
    }, [bibleItemViewController]);
    return bibleItems;
}
