import BibleItem from '../bible-list/BibleItem';
import { showSimpleToast } from '../toast/toastHelpers';
import { ContextMenuItemType } from '../context-menu/appContextMenuHelpers';
import { genFoundBibleItemContextMenu } from '../bible-lookup/RenderActionButtonsComp';
import { closeCurrentEditingBibleItem } from './readBibleHelpers';
import { EventMapper } from '../event/KeyboardEventListener';
import { genContextMenuItemShortcutKey } from '../context-menu/AppContextMenuComp';
import BibleItemsViewController, {
    applyHistoryPendingText,
    attemptAddingHistory,
    splitHorizontalId,
    splitVerticalId,
    useBibleItemsViewControllerContext,
} from './BibleItemsViewController';
import { setBibleLookupInputFocus } from '../bible-lookup/selectionHelpers';
import { getSetting, setSetting } from '../helper/settingHelpers';
import {
    EditingResultType,
    extractBibleTitle,
} from '../helper/bible-helpers/serverBibleHelpers2';
import { BibleTargetType } from '../bible-list/bibleRenderHelpers';
import { createContext, use } from 'react';

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

class LookupBibleItemController extends BibleItemsViewController {
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

    async setLookupContentFromBibleItem(bibleItem: BibleItem) {
        applyHistoryPendingText();
        this.applyTargetOrBibleKey(this.selectedBibleItem, bibleItem);
        const bibleText = await bibleItem.toTitle();
        this.inputText = bibleText;
    }

    async getEditingResult() {
        const editingResult = await extractBibleTitle(
            this.selectedBibleItem.bibleKey,
            this.inputText,
        );
        if (editingResult.result.bibleItem !== null) {
            editingResult.result.bibleItem.id = this.selectedBibleItem.id;
        }
        return editingResult;
    }

    applyTargetOrBibleKey(
        bibleItem: BibleItem,
        { target, bibleKey }: { target?: BibleTargetType; bibleKey?: string },
    ) {
        if (this.checkIsBibleItemSelected(bibleItem)) {
            if (
                bibleKey !== undefined &&
                bibleKey !== this.selectedBibleItem.bibleKey
            ) {
                super.applyTargetOrBibleKey(bibleItem, {
                    bibleKey,
                });
                this.setBibleKey(bibleKey);
                this.getEditingResult().then((editingResult) => {
                    const foundBibleItem = editingResult.result.bibleItem;
                    if (foundBibleItem !== null) {
                        foundBibleItem.toTitle().then((inputText) => {
                            this.inputText = inputText;
                        });
                    }
                });
            }
            return;
        }
        super.applyTargetOrBibleKey(bibleItem, {
            bibleKey,
            target,
        });
    }

    async editBibleItem(bibleItem: BibleItem) {
        const oldSelectedBibleItem = this.selectedBibleItem;
        this.selectedBibleItem = bibleItem;
        const foundBibleItem = (await this.getEditingResult()).result.bibleItem;
        if (foundBibleItem === null) {
            this.deleteBibleItem(oldSelectedBibleItem);
        } else {
            foundBibleItem.toTitle().then((inputText) => {
                attemptAddingHistory(foundBibleItem.bibleKey, inputText, true);
            });
        }
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
                              closeCurrentEditingBibleItem(this);
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
export default LookupBibleItemController;

export function useLookupBibleItemControllerContext() {
    const viewController = useBibleItemsViewControllerContext();
    if (viewController instanceof LookupBibleItemController === false) {
        throw new Error(
            'useBibleLookupViewControllerContext must be used within a' +
                ' BibleItemViewControllerContext',
        );
    }
    return viewController;
}

export const EditingResultContext = createContext<EditingResultType | null>(
    null,
);
export function useEditingResultContext() {
    const editingResult = use(EditingResultContext);
    if (editingResult === null) {
        throw new Error('EditingResultContext is null');
    }
    return editingResult;
}
