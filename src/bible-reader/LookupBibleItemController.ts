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
import CacheManager from '../others/CacheManager';
import { unlocking } from '../server/appHelpers';
import { AnyObjectType } from '../helper/helpers';
import { BibleItemType } from '../bible-list/bibleItemHelpers';

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

class EditingBibleItem extends BibleItem {
    get metadata() {
        throw new Error('metadata is not available');
    }
    set metadata(_metadata: AnyObjectType) {
        throw new Error('metadata is not available');
    }
    get target() {
        throw new Error('target is not available');
    }
    set target(_target: BibleTargetType) {
        throw new Error('target is not available');
    }
    static fromJson(json: BibleItemType) {
        this.validate(json);
        return new EditingBibleItem(json.id, json);
    }
}

const editingResultCacher = new CacheManager<EditingResultType>(3);
class LookupBibleItemController extends BibleItemsViewController {
    setInputText = (_: string) => {};
    setBibleKey = (_: string) => {};
    onLookupAddBibleItem = () => {};

    constructor() {
        super('lookup');
        if (this.straightBibleItems.length === 0) {
            const bibleItem = this.bibleItemFromJson({
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
    bibleItemFromJson(json: any): BibleItem {
        if (json.id === this.getSavedBibleId()) {
            return EditingBibleItem.fromJson(json);
        }
        return super.bibleItemFromJson(json);
    }
    getSavedBibleId() {
        const settingId = getSetting(
            this.toSettingName('-selected-bible-item'),
        );
        const bibleItemId = settingId ? parseInt(settingId) : -1;
        return bibleItemId;
    }
    get selectedBibleItem() {
        const bibleItemId = this.getSavedBibleId();
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
        const cachedKey = `${this.selectedBibleItem.bibleKey}-${this.inputText}`;
        return unlocking(cachedKey, async () => {
            const cachedEditingResult =
                await editingResultCacher.get(cachedKey);
            if (cachedEditingResult !== null) {
                return cachedEditingResult;
            }
            const editingResult = await extractBibleTitle(
                this.selectedBibleItem.bibleKey,
                this.inputText,
            );
            if (editingResult.result.bibleItem !== null) {
                editingResult.result.bibleItem.id = this.selectedBibleItem.id;
            }
            await editingResultCacher.set(cachedKey, editingResult);
            return editingResult;
        });
    }

    private async setEditingData(
        bibleKey: string | null,
        target: BibleTargetType | null,
    ) {
        const selectedBibleItem = this.selectedBibleItem;
        const editingResult = await this.getEditingResult();
        if (bibleKey !== null && bibleKey !== selectedBibleItem.bibleKey) {
            super.applyTargetOrBibleKey(selectedBibleItem, {
                bibleKey,
            });
            this.setBibleKey(bibleKey);
        }
        const foundBibleItem = editingResult.result.bibleItem;
        if (foundBibleItem === null) {
            return;
        }
        if (bibleKey !== null) {
            foundBibleItem.bibleKey = bibleKey;
        }
        if (target !== null) {
            foundBibleItem.target = target;
        }
        const title = await foundBibleItem.toTitle();
        this.inputText = title;
    }

    applyTargetOrBibleKey(
        bibleItem: BibleItem,
        { target, bibleKey }: { target?: BibleTargetType; bibleKey?: string },
    ) {
        if (this.checkIsBibleItemSelected(bibleItem)) {
            this.setEditingData(bibleKey ?? null, target ?? null);
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
        const editingResult = await this.getEditingResult();
        const foundBibleItem = editingResult.result.bibleItem;
        if (foundBibleItem === null) {
            showSimpleToast(
                'Jumping Chapter',
                'Unable to find the target bible item',
            );
            return;
        }
        const nextTarget = await foundBibleItem.getJumpingChapter(isNext);
        if (nextTarget === null) {
            showSimpleToast(
                `Try ${isNext ? 'Next' : 'Previous'} Chapter`,
                `Unable to find ${isNext ? 'next' : 'previous'} chapter`,
            );
            return;
        }
        foundBibleItem.target = nextTarget;
        const title = await foundBibleItem.toTitle();
        this.inputText = title;
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
