import { useState } from 'react';
import BibleItem from '../bible-list/BibleItem';
import EventHandler from '../event/EventHandler';
import { useAppEffect } from '../helper/debuggerHelpers';
import { getSetting, setSetting } from '../helper/settingHelper';
import { handleError } from '../helper/errorHelpers';
import { clearFlexSizeSetting } from '../resize-actor/flexSizeHelpers';

export type UpdateEventType = 'update';
export const RESIZE_SETTING_NAME = 'bible-previewer-render';

export default class BibleItemViewController
    extends EventHandler<UpdateEventType>{
    static _instance: BibleItemViewController | null = null;
    get bibleItems() {
        try {
            const bibleItems = JSON.parse(getSetting('bibleItems') || '[]');
            return bibleItems.map((item: any) => {
                return BibleItem.fromJson(item);
            });
        } catch (error) {
            handleError(error);
        }
        return [];
    }
    set bibleItems(newBibleItems: BibleItem[]) {
        if (newBibleItems.length !== this.bibleItems.length) {
            clearFlexSizeSetting(RESIZE_SETTING_NAME);
        }
        setSetting('bibleItems', JSON.stringify(newBibleItems.map((item) => {
            return item.toJson();
        })));
        this.fireUpdateEvent();
    }

    fireUpdateEvent() {
        this.addPropEvent('update');
    }

    changeItemBibleKey(index: number, bibleKey: string) {
        const newBibleItems = this.bibleItems.map((item1) => {
            return item1.clone();
        });
        newBibleItems[index].bibleKey = bibleKey;
        this.bibleItems = newBibleItems;
    }

    changeItemAtIndex(bibleItem: BibleItem, index: number) {
        const newBibleItems = this.bibleItems.map((item1, i) => {
            if (i !== index) {
                return item1.clone();
            } else {
                return bibleItem;
            }
        });
        this.bibleItems = newBibleItems;
    }

    removeItem(index: number) {
        const newBibleItems = this.bibleItems.filter((_, i) => {
            return i !== index;
        });
        this.bibleItems = newBibleItems;
    }

    addItem(bibleItem: BibleItem) {
        const newBibleItems = this.bibleItems.map((item1) => {
            return item1.clone();
        });
        newBibleItems.push(bibleItem);
        this.bibleItems = newBibleItems;
    }
    duplicateItemAtIndex(index: number, bibleKey?: string) {
        const bibleItems = this.bibleItems;
        const duplicatedBibleItem = bibleItems[index].clone();
        if (bibleKey) {
            duplicatedBibleItem.bibleKey = bibleKey;
        }
        bibleItems.splice(index + 1, 0, duplicatedBibleItem);
        this.bibleItems = bibleItems;
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
