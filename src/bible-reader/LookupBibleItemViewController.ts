import BibleItem from '../bible-list/BibleItem';
import { showSimpleToast } from '../toast/toastHelpers';
import { ContextMenuItemType } from '../context-menu/appContextMenuHelpers';
import { genFoundBibleItemContextMenu } from '../bible-lookup/RenderActionButtonsComp';
import { closeCurrentEditingBibleItem } from './readBibleHelpers';
import {
    applyPendingText,
    attemptAddingHistory,
} from '../bible-lookup/InputHistoryComp';
import { EventMapper } from '../event/KeyboardEventListener';
import { genContextMenuItemShortcutKey } from '../context-menu/AppContextMenuComp';
import BibleItemViewController, {
    NestedBibleItemsType,
    sanitizeNestedItems,
} from './BibleItemViewController';

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

let instance: LookupBibleItemViewController | null = null;
class LookupBibleItemViewController extends BibleItemViewController {
    private _nestedBibleItems: NestedBibleItemsType;
    selectedBibleItem: BibleItem;
    setInputText = (_: string) => {};
    setBibleKey = (_: string | null) => {};
    onLookupAddBibleItem = () => {};

    constructor() {
        super('');
        this.selectedBibleItem = BibleItem.fromJson({
            id: this.genBibleItemUniqueId(),
            bibleKey: 'KJV',
            metadata: {},
            target: { bookKey: 'GEN', chapter: 1, verseStart: 1, verseEnd: 1 },
        });
        this._nestedBibleItems = [this.selectedBibleItem];
    }
    get nestedBibleItems() {
        return this._nestedBibleItems;
    }
    set nestedBibleItems(newNestedBibleItems: NestedBibleItemsType) {
        const nestedBibleItems = sanitizeNestedItems(newNestedBibleItems);

        this._nestedBibleItems = nestedBibleItems;
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
            instance = new this();
        }
        return instance;
    }

    async setLookupContentFromBibleItem(bibleItem: BibleItem) {
        applyPendingText();
        this.setBibleKey(bibleItem.bibleKey);
        const bibleText = await bibleItem.toTitle();
        this.setInputText(bibleText);
    }

    editBibleItem(bibleItem: BibleItem) {
        this.selectedBibleItem.toTitle().then((inputText) => {
            attemptAddingHistory(bibleItem.bibleKey, inputText, true);
        });
        const newBibleItem = bibleItem.clone(true);
        this.changeBibleItem(bibleItem, newBibleItem);
        this.selectedBibleItem = newBibleItem;
        this.setLookupContentFromBibleItem(newBibleItem);
    }
    genContextMenu(bibleItem: BibleItem, uuid: string): ContextMenuItemType[] {
        const isBibleItemSelected = this.checkIsBibleItemSelected(bibleItem);
        const menu1 = genFoundBibleItemContextMenu(
            bibleItem,
            this.onLookupAddBibleItem,
            isBibleItemSelected,
        );
        const menus2 = super.genContextMenu(bibleItem, uuid);
        if (!isBibleItemSelected) {
            menus2.push({
                menuTitle: 'Edit',
                title: 'Double click on header to edit',
                onSelect: () => {
                    this.editBibleItem(bibleItem);
                },
            });
        } else {
            const menu2IdMap: { [key: string]: ContextMenuItemType } =
                Object.fromEntries(
                    menus2.map((menuItem) => [menuItem.id, menuItem]),
                );
            if (menu2IdMap[splitHorizontalId]) {
                menu2IdMap[splitHorizontalId].otherChild =
                    genContextMenuItemShortcutKey({
                        ...ctrlShiftMetaKeys,
                        key: 's',
                    });
            }
            if (menu2IdMap[splitVerticalId]) {
                menu2IdMap[splitVerticalId].otherChild =
                    genContextMenuItemShortcutKey({
                        ...ctrlShiftMetaKeys,
                        key: 'v',
                    });
            }
        }
        const menu3: ContextMenuItemType[] = this.isAlone
            ? []
            : [
                  {
                      menuTitle: 'Close',
                      otherChild: isBibleItemSelected
                          ? genContextMenuItemShortcutKey(closeEventMapper)
                          : undefined,
                      onSelect: () => {
                          if (bibleItem === this.selectedBibleItem) {
                              closeCurrentEditingBibleItem();
                          } else {
                              this.deleteBibleItem(bibleItem);
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
    deleteBibleItem(bibleItem: BibleItem) {
        if (this.isAlone) {
            return;
        }
        super.deleteBibleItem(bibleItem);
        const straightBibleItems = this.straightBibleItems;
        if (!straightBibleItems.includes(this.selectedBibleItem)) {
            const lastBibleItem =
                straightBibleItems[straightBibleItems.length - 1];
            this.editBibleItem(lastBibleItem);
        }
    }
    async tryJumpingChapter(isNext: boolean) {
        const bibleItem = this.selectedBibleItem;
        const nextBibleItem = bibleItem.clone(true);
        const nextTarget = await bibleItem.getJumpingChapter(isNext);
        if (nextTarget === null) {
            showSimpleToast(
                `Try ${isNext ? 'Next' : 'Previous'} Chapter`,
                `Unable to find ${isNext ? 'next' : 'previous'} chapter`,
            );
            return;
        }
        nextBibleItem.target = nextTarget;
        this.changeBibleItem(bibleItem, nextBibleItem);
        this.editBibleItem(nextBibleItem);
    }
}

export default LookupBibleItemViewController;
