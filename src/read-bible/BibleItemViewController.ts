import { useState } from 'react';
import BibleItem from '../bible-list/BibleItem';
import EventHandler from '../event/EventHandler';
import { useAppEffect } from '../helper/debuggerHelpers';
import { getSetting, setSetting } from '../helper/settingHelper';
import { handleError } from '../helper/errorHelpers';
import { clearFlexSizeSetting } from '../resize-actor/flexSizeHelpers';

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

export default class BibleItemViewController
    extends EventHandler<UpdateEventType>{
    static _instance: BibleItemViewController | null = null;
    get bibleItems(): any {
        try {
            const jsonStr = getSetting('bibleItems') || '[]';
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
        setSetting('bibleItems', jsonStr);
        this.fireUpdateEvent();
    }

    private walkBibleItems(
        fullBiblItems: any, indices: number[], isHorizontal: boolean,
        bibleItems?: any
    ): {
        bibleItems: BibleItem[],
        fullBiblItems: any,
        index: number,
        isHorizontal: boolean,
    } {
        if (!bibleItems) {
            bibleItems = fullBiblItems;
        }
        if (indices.length < 2) {
            return {
                fullBiblItems,
                bibleItems,
                index: indices.length === 1 ? indices[0] : 0,
                isHorizontal,
            };
        }
        indices = [...indices];
        const index = indices.shift()!;
        return this.walkBibleItems(
            fullBiblItems, indices, isHorizontal,
            bibleItems[index],
        );
    }

    fireUpdateEvent() {
        this.addPropEvent('update');
    }

    changeItemBibleKey(
        indices: number[], bibleKey: string, isHorizontal: boolean,
    ) {
        const { fullBiblItems, bibleItems, index } = this.walkBibleItems(
            this.bibleItems, indices, isHorizontal,
        );
        bibleItems[index].bibleKey = bibleKey;
        this.bibleItems = fullBiblItems;
    }

    changeItemAtIndex(
        bibleItem: BibleItem, indices: number[], isHorizontal: boolean,
    ) {
        const { fullBiblItems, bibleItems, index } = this.walkBibleItems(
            this.bibleItems, indices, isHorizontal,
        );
        bibleItems[index] = bibleItem;
        this.bibleItems = fullBiblItems;
    }

    removeItem(indices: number[], isHorizontal: boolean,) {
        const { fullBiblItems, bibleItems, index } = this.walkBibleItems(
            this.bibleItems, indices, isHorizontal,
        );
        bibleItems.splice(index, 1);
        const newFullBiblItems = cleanBibleItems(fullBiblItems);
        this.bibleItems = newFullBiblItems;
    }

    addItem(bibleItem: BibleItem, indices: number[], isHorizontal: boolean) {
        const { fullBiblItems, bibleItems } = this.walkBibleItems(
            this.bibleItems, indices, isHorizontal,
        );
        bibleItems.push(bibleItem);
        this.bibleItems = fullBiblItems;
    }
    private addItemAtIndex(
        indices: number[], bibleItem: BibleItem, isHorizontal: boolean,
    ) {
        const { fullBiblItems, bibleItems, index } = this.walkBibleItems(
            this.bibleItems, indices, isHorizontal,
        );
        bibleItems.splice(index, 0, bibleItem);
        this.bibleItems = fullBiblItems;
    }
    private transformToHorizontal(
        indices: number[], isHorizontal: boolean,
    ) {
        const { fullBiblItems, bibleItems, index } = this.walkBibleItems(
            this.bibleItems, indices, isHorizontal,
        );
        if (isHorizontal && !(bibleItems[index] instanceof Array)) {
            (bibleItems as any)[index] = [bibleItems[index]];
            indices = [...indices, 0];
            isHorizontal = false;
        }
        this.bibleItems = fullBiblItems;
        return { indices, isHorizontal };
    }
    addItemAtIndexLeft(
        indices: number[], bibleItem: BibleItem, isHorizontal: boolean,
    ) {
        this.addItemAtIndex(indices, bibleItem, isHorizontal);
    }
    addItemAtIndexRight(
        indices: number[], bibleItem: BibleItem, isHorizontal: boolean,
    ) {
        indices[indices.length - 1] += 1;
        this.addItemAtIndex(indices, bibleItem, isHorizontal);
    }
    addItemAtIndexTop(
        indices: number[], bibleItem: BibleItem, isHorizontal: boolean,
    ) {
        const {
            indices: newIndices,
            isHorizontal: newIsHorizontal,
        } = this.transformToHorizontal(indices, isHorizontal);
        this.addItemAtIndexLeft(newIndices, bibleItem, newIsHorizontal);
    }
    addItemAtIndexBottom(
        indices: number[], bibleItem: BibleItem, isHorizontal: boolean,
    ) {
        const {
            indices: newIndices,
            isHorizontal: newIsHorizontal,
        } = this.transformToHorizontal(indices, isHorizontal);
        this.addItemAtIndexBottom(newIndices, bibleItem, newIsHorizontal);
    }
    duplicateItemAtIndexRight(
        indices: number[], isHorizontal: boolean, bibleKey?: string,
    ) {
        const { bibleItems, index } = this.walkBibleItems(
            this.bibleItems, indices, isHorizontal,
        );
        const duplicatedBibleItem = bibleItems[index].clone();
        if (bibleKey) {
            duplicatedBibleItem.bibleKey = bibleKey;
        }
        this.addItemAtIndexRight(indices, duplicatedBibleItem, isHorizontal);
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
