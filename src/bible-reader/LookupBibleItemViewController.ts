import BibleItem from '../bible-list/BibleItem';
import { showSimpleToast } from '../toast/toastHelpers';
import { ContextMenuItemType } from '../context-menu/appContextMenuHelpers';
import { genFoundBibleItemContextMenu } from '../bible-lookup/RenderActionButtonsComp';
import { closeCurrentEditingBibleItem } from './readBibleHelpers';
import { EventMapper } from '../event/KeyboardEventListener';
import { genContextMenuItemShortcutKey } from '../context-menu/AppContextMenuComp';
import BibleItemViewController, {
    applyPendingText,
    attemptAddingHistory,
    splitHorizontalId,
    splitVerticalId,
} from './BibleItemViewController';
import { setBibleLookupInputFocus } from '../bible-lookup/selectionHelpers';
import { getSetting, setSetting } from '../helper/settingHelpers';
import { extractBibleTitle } from '../helper/bible-helpers/serverBibleHelpers2';

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

let instance: LookupBibleItemViewController | null = null;
class LookupBibleItemViewController extends BibleItemViewController {
    setInputText = (_: string) => {};
    setBibleKey = (_: string) => {};
    onLookupAddBibleItem = () => {};

    constructor() {
        super('lookup');
        if (this.straightBibleItems.length === 0) {
            const bibleItem = BibleItem.fromJson({
                id: this.genBibleItemUniqueId(),
                bibleKey: 'KJV',
                metadata: {},
                target: {
                    bookKey: 'GEN',
                    chapter: 1,
                    verseStart: 1,
                    verseEnd: 1,
                },
            });
            this.nestedBibleItems = [bibleItem];
        }
    }
    get selectedBibleItem() {
        const settingId = getSetting(
            this.toSettingName('-selected-bible-item'),
        );
        const bibleItemId = settingId ? parseInt(settingId) : -1;
        if (bibleItemId !== -1) {
            const bibleItem = this.straightBibleItems.find((bibleItem) => {
                return bibleItem.id === bibleItemId;
            });
            if (bibleItem !== undefined) {
                return bibleItem;
            }
        }
        setSetting(
            this.toSettingName('-selected-bible-item'),
            this.straightBibleItems[0].id.toString(),
        );
        return this.selectedBibleItem;
    }
    set selectedBibleItem(bibleItem: BibleItem) {
        setSetting(
            this.toSettingName('-selected-bible-item'),
            bibleItem.id.toString(),
        );
        this.applyTargetOrBibleKey(this.selectedBibleItem, bibleItem);
        this.setBibleKey(this.bibleKey);
    }
    checkIsBibleItemSelected(bibleItem: BibleItem) {
        return bibleItem.id === this.selectedBibleItem.id;
    }
    get selectedIndex() {
        return this.straightBibleItems.findIndex((bibleItem) => {
            return this.checkIsBibleItemSelected(bibleItem);
        });
    }
    setColorNote(bibleItem: BibleItem, color: string | null) {
        super._setColorNote(bibleItem, color);
        const selectedBibleItem = this.selectedBibleItem;
        const selectedColorNote = this.getColorNote(selectedBibleItem);
        const currentColorNote = this.getColorNote(bibleItem);
        const isSameWithSelected =
            selectedColorNote && selectedColorNote === currentColorNote;
        this.syncTargetByColorNote(
            isSameWithSelected ? selectedBibleItem : bibleItem,
        );
    }
    get inputText() {
        return getSetting(this.toSettingName('-input-text'), '');
    }
    set inputText(newText: string) {
        setSetting(this.toSettingName('-input-text'), newText);
        this.setInputText(newText);
        setBibleLookupInputFocus();
    }
    get bibleKey() {
        return this.selectedBibleItem.bibleKey;
    }
    set bibleKey(newBibleKey: string) {
        const selectedBibleItem = this.selectedBibleItem;
        selectedBibleItem.bibleKey = newBibleKey;
        this.selectedBibleItem = selectedBibleItem;
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
        this.inputText = bibleText;
    }

    async getFoundBibleItem() {
        const { result } = await extractBibleTitle(
            this.bibleKey,
            this.inputText,
        );
        if (result.bibleItem !== null) {
            return result.bibleItem;
        }
        return null;
    }

    async editBibleItem(bibleItem: BibleItem) {
        const foundBibleItem = await this.getFoundBibleItem();
        if (foundBibleItem !== null) {
            foundBibleItem.toTitle().then((inputText) => {
                attemptAddingHistory(foundBibleItem.bibleKey, inputText, true);
            });
            this.applyTargetOrBibleKey(this.selectedBibleItem, foundBibleItem);
        } else {
            this.deleteBibleItem(this.selectedBibleItem);
        }
        this.selectedBibleItem = bibleItem;
        this.setLookupContentFromBibleItem(bibleItem);
    }
    async genContextMenu(
        bibleItem: BibleItem,
        uuid: string,
    ): Promise<ContextMenuItemType[]> {
        const isBibleItemSelected = this.checkIsBibleItemSelected(bibleItem);
        const menu1 = genFoundBibleItemContextMenu(
            bibleItem,
            this.onLookupAddBibleItem,
            isBibleItemSelected,
        );
        const menus2 = await super.genContextMenu(bibleItem, uuid);
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
                          if (this.checkIsBibleItemSelected(bibleItem)) {
                              closeCurrentEditingBibleItem();
                          } else {
                              this.deleteBibleItem(bibleItem);
                          }
                      },
                  },
              ];
        return [...menu1, ...menus2, ...menu3];
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
        const selectedBibleItem = this.selectedBibleItem;
        const nextTarget = await selectedBibleItem.getJumpingChapter(isNext);
        if (nextTarget === null) {
            showSimpleToast(
                `Try ${isNext ? 'Next' : 'Previous'} Chapter`,
                `Unable to find ${isNext ? 'next' : 'previous'} chapter`,
            );
            return;
        }
        selectedBibleItem.target = nextTarget;
        selectedBibleItem.toTitle().then((title) => {
            this.inputText = title;
        });
    }
}

export default LookupBibleItemViewController;
