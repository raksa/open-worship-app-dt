import { CSSProperties } from 'react';

import BibleItem from '../../bible-list/BibleItem';
import { DroppedDataType, DragTypeEnum } from '../../helper/DragInf';
import {
    AnyObjectType,
    bringDomToNearestView,
    bringDomToTopView,
    cloneJson,
    isValidJson,
} from '../../helper/helpers';
import { getSetting, setSetting } from '../../helper/settingHelpers';
import bibleScreenHelper from '../bibleScreenHelpers';
import {
    ScreenBibleManagerEventType,
    SCREEN_BIBLE_SETTING_PREFIX,
    renderScreenBibleManager,
    bibleItemJsonToFtData,
    onSelectIndex,
} from '../screenBibleHelpers';
import {
    BasicScreenMessageType,
    BibleItemDataType,
    genScreenMouseEvent,
    getBibleListOnScreenSetting,
    ScreenMessageType,
} from '../screenHelpers';
import * as loggerHelpers from '../../helper/loggerHelpers';
import { handleError } from '../../helper/errorHelpers';
import { screenManagerSettingNames } from '../../helper/constants';
import { unlocking } from '../../server/appHelpers';
import ScreenEventHandler from './ScreenEventHandler';
import ScreenManagerBase from './ScreenManagerBase';
import { getAllScreenManagerBases } from './screenManagerBaseHelpers';
import appProvider from '../../server/appProvider';
import { applyAttachBackground } from './screenBackgroundHelpers';
import { BibleItemType } from '../../bible-list/bibleItemHelpers';

let textStyle: AnyObjectType = {};
class ScreenBibleManager extends ScreenEventHandler<ScreenBibleManagerEventType> {
    static readonly eventNamePrefix: string = 'screen-ft-m';
    private _ftItemData: BibleItemDataType | null = null;
    private _div: HTMLDivElement | null = null;
    private _syncScrollTimeout: any = null;
    private _divScrollListenerBind: (() => void) | null = null;
    public isToTop = false;
    applyBibleViewData = (_bibleData: BibleItemDataType | null) => {};
    handleBibleViewVersesHighlighting = (
        _kjvVerseKey: string,
        _isToTop: boolean,
    ) => {};

    constructor(screenManagerBase: ScreenManagerBase) {
        super(screenManagerBase);
        if (appProvider.isPagePresenter) {
            const allBibleDataList = getBibleListOnScreenSetting();
            this._ftItemData = allBibleDataList[this.key] ?? null;

            const str = getSetting(
                `${SCREEN_BIBLE_SETTING_PREFIX}-style-text`,
                '',
            );
            try {
                if (isValidJson(str, true)) {
                    const style = JSON.parse(str);
                    if (typeof style !== 'object') {
                        loggerHelpers.error(style);
                        throw new Error('Invalid style data');
                    }
                    textStyle = style;
                }
            } catch (error) {
                handleError(error);
            }
        }
    }

    get isShowing() {
        return this.bibleItemData !== null;
    }

    private _divScrollListener() {
        if (this.div === null) {
            return;
        }
        this.scroll = this.div.scrollTop / this.div.scrollHeight;
        this.sendSyncScroll();
    }

    get isLineSync() {
        const settingKey = `${SCREEN_BIBLE_SETTING_PREFIX}-line-sync-${this.screenId}`;
        return getSetting(settingKey) === 'true';
    }

    set isLineSync(isLineSync: boolean) {
        setSetting(
            `${SCREEN_BIBLE_SETTING_PREFIX}-line-sync-${this.screenId}`,
            `${isLineSync}`,
        );
        this.bibleItemData = cloneJson(this.bibleItemData);
    }

    get div() {
        return this._div;
    }

    set div(div: HTMLDivElement | null) {
        this._div = div;
        this._div?.addEventListener('wheel', (event) => {
            if (event.ctrlKey) {
                event.preventDefault();
                const isUp = event.deltaY < 0;
                ScreenBibleManager.changeTextStyleTextFontSize(isUp);
            }
        });
        this.registerScrollListener();
        this.render();
    }

    get bibleItemData() {
        return this._ftItemData;
    }

    set bibleItemData(bibleItemData: BibleItemDataType | null) {
        this._ftItemData = bibleItemData;
        this.applyBibleViewData(bibleItemData);
        this.render();
        unlocking(`set-${screenManagerSettingNames.FULL_TEXT}`, () => {
            const allBibleDataList = getBibleListOnScreenSetting();
            if (bibleItemData === null) {
                delete allBibleDataList[this.key];
            } else {
                allBibleDataList[this.key] = bibleItemData;
            }
            const string = JSON.stringify(allBibleDataList);
            setSetting(screenManagerSettingNames.FULL_TEXT, string);
        });
        this.sendSyncScreen();
        this.fireUpdateEvent();
    }

    getRenderedBibleKeys() {
        if (this._ftItemData === null) {
            return [];
        }
        return (this._ftItemData.bibleItemData?.renderedList ?? []).map(
            ({ bibleKey }) => bibleKey,
        );
    }

    private _setMetadata(key: string, value: any) {
        if (this._ftItemData !== null) {
            (this._ftItemData as any)[key] = value;
            if (!appProvider.isPageScreen) {
                unlocking(
                    `set-meta-${screenManagerSettingNames.FULL_TEXT}`,
                    () => {
                        const allBibleDataList = getBibleListOnScreenSetting();
                        allBibleDataList[this.key] = this._ftItemData as any;
                        const string = JSON.stringify(allBibleDataList);
                        setSetting(screenManagerSettingNames.FULL_TEXT, string);
                    },
                );
            }
        }
    }

    get containerStyle(): CSSProperties {
        return {
            position: 'absolute',
            width: `${this.screenManagerBase.width}px`,
            height: `${this.screenManagerBase.height}px`,
            overflowX: 'hidden',
            overflowY: 'auto',
        };
    }

    get selectedIndex() {
        return this._ftItemData === null
            ? null
            : this._ftItemData.selectedIndex;
    }

    set selectedIndex(selectedIndex: number | null) {
        this._setMetadata('selectedIndex', selectedIndex);
        this.renderSelectedIndex();
    }

    get scroll() {
        return this.bibleItemData?.scroll ?? 0;
    }

    set scroll(scroll: number) {
        this._setMetadata('scroll', scroll);
    }

    registerScrollListener() {
        this.unregisterScrollListener();
        this._divScrollListenerBind = this._divScrollListener.bind(this);
        this.div?.addEventListener('scroll', this._divScrollListenerBind);
    }

    unregisterScrollListener() {
        if (this._divScrollListenerBind === null) {
            return;
        }
        this.div?.removeEventListener('scroll', this._divScrollListenerBind);
        this._divScrollListenerBind = null;
    }

    async sendSyncScroll() {
        this.screenManagerBase.sendScreenMessage(
            {
                screenId: this.screenId,
                type: 'full-text-scroll',
                data: {
                    scroll: this.scroll,
                },
            },
            true,
        );
    }

    static receiveSyncScroll(message: ScreenMessageType) {
        const { data, screenId } = message;
        const screenBibleManager = this.getInstance(screenId);
        if (screenBibleManager === null) {
            return;
        }
        if (screenBibleManager._syncScrollTimeout !== null) {
            clearTimeout(screenBibleManager._syncScrollTimeout);
        }
        screenBibleManager.unregisterScrollListener();
        const reRegisterScrollListener = () => {
            if (screenBibleManager._syncScrollTimeout !== null) {
                clearTimeout(screenBibleManager._syncScrollTimeout);
            }
            screenBibleManager._syncScrollTimeout = null;
            screenBibleManager.registerScrollListener();
        };
        screenBibleManager._syncScrollTimeout = setTimeout(
            reRegisterScrollListener,
            3e3,
        );
        screenBibleManager.scroll = data.scroll;
        screenBibleManager.renderScroll();
    }

    sendSyncSelectedIndex() {
        this.screenManagerBase.sendScreenMessage(
            {
                screenId: this.screenId,
                type: 'full-text-selected-index',
                data: {
                    selectedIndex: this.selectedIndex,
                },
            },
            true,
        );
    }

    static receiveSyncSelectedIndex(message: ScreenMessageType) {
        const { data, screenId } = message;
        const screenBibleManager = this.getInstance(screenId);
        if (screenBibleManager === null) {
            return;
        }
        screenBibleManager.selectedIndex = data.selectedIndex;
    }

    toSyncMessage(): BasicScreenMessageType {
        return {
            type: 'full-text',
            data: this.bibleItemData,
        };
    }

    applyFullDataSrcWithSyncGroup(bibleData: BibleItemDataType | null) {
        ScreenBibleManager.enableSyncGroup(this.screenId);
        this.bibleItemData = bibleData;
    }

    receiveSyncScreen(message: ScreenMessageType) {
        this.bibleItemData = message.data;
    }

    fireUpdateEvent() {
        super.fireUpdateEvent();
        ScreenBibleManager.fireUpdateEvent();
    }

    static readonly maxTextStyleTextFontSize = 200;
    static get textStyleTextFontSize() {
        const textStyle = this.textStyle;
        return typeof textStyle.fontSize !== 'number' ? 25 : textStyle.fontSize;
    }

    static changeTextStyleTextFontSize(isUp: boolean) {
        let fontSize = this.textStyleTextFontSize;
        fontSize += isUp ? 1 : -1;
        this.applyTextStyle({
            fontSize: Math.min(
                this.maxTextStyleTextFontSize,
                Math.max(1, fontSize),
            ),
        });
    }

    static get textStyleTextColor(): string {
        const textStyle = this.textStyle;
        return typeof textStyle.color !== 'string'
            ? '#ffffff'
            : textStyle.color;
    }

    static get textStyleTextTextShadow(): string {
        const textStyle = this.textStyle;
        return typeof textStyle.textShadow !== 'string'
            ? 'none'
            : textStyle.textShadow;
    }

    static get textStyleText(): string {
        return `
            font-size: ${this.textStyleTextFontSize}px;
            color: ${this.textStyleTextColor};
            text-shadow: ${this.textStyleTextTextShadow};
        `;
    }

    static get textStyle(): AnyObjectType {
        return textStyle;
    }

    static set textStyle(style: AnyObjectType) {
        textStyle = style;
        const str = JSON.stringify(style);
        setSetting(`${SCREEN_BIBLE_SETTING_PREFIX}-style-text`, str);
        this.sendSynTextStyle();
        this.addPropEvent('text-style');
    }

    static applyTextStyle(style: AnyObjectType) {
        const textStyle = this.textStyle;
        Object.assign(textStyle, style);
        this.textStyle = textStyle;
    }

    static sendSynTextStyle() {
        getAllScreenManagerBases().forEach((screenManagerBase) => {
            screenManagerBase.sendScreenMessage({
                screenId: screenManagerBase.screenId,
                type: 'full-text-text-style',
                data: {
                    textStyle: this.textStyle,
                },
            });
        });
    }

    static receiveSyncTextStyle(message: ScreenMessageType) {
        const { data } = message;
        this.textStyle = data.textStyle;
    }

    async applyNewBibleItemJson(
        bibleItemJson: BibleItemType,
        filePath: string | undefined,
    ) {
        const bibleKeys = this.getRenderedBibleKeys();
        const newBibleItemData = await bibleItemJsonToFtData(
            bibleItemJson,
            bibleKeys,
        );
        this.applyFullDataSrcWithSyncGroup(newBibleItemData);
        if (filePath !== undefined) {
            applyAttachBackground(
                this.screenId,
                filePath,
                bibleItemJson.id.toString(),
            );
        }
    }

    static async handleBibleItemSelecting(
        event: React.MouseEvent | null,
        bibleItem: BibleItem,
        isForceChoosing = false,
    ) {
        const bibleItemJson = bibleItem.toJson();
        const screenIds = await this.chooseScreenIds(
            genScreenMouseEvent(event) as any,
            isForceChoosing,
        );
        const filePath = bibleItem.filePath;
        screenIds.forEach(async (screenId) => {
            const screenBibleManager = this.getInstance(screenId);
            screenBibleManager.applyNewBibleItemJson(bibleItemJson, filePath);
        });
    }

    render() {
        renderScreenBibleManager(this);
    }

    renderScroll(isImmediate?: boolean) {
        if (this.div === null) {
            return;
        }
        const scrollTop = this.scroll * this.div.scrollHeight;
        if (isImmediate) {
            this.div.scrollTop = scrollTop;
        }
        this.div.scroll({
            behavior: 'smooth',
            top: scrollTop,
            left: 0,
        });
    }

    handleScreenVersesHighlighting(kjvVerseKey: string, isToTop: boolean) {
        let index = -1;
        this.bibleItemData?.bibleItemData?.renderedList[0]?.verses.forEach(
            (verse, i) => {
                if (verse.kjvVerseKey === kjvVerseKey) {
                    index = i;
                }
            },
        );
        if (index === -1) {
            return;
        }
        onSelectIndex(this, index, isToTop);
    }

    renderSelectedIndex() {
        if (this.div === null) {
            return;
        }
        bibleScreenHelper.removeClassName(this.div, 'selected');
        const isToTop = this.isToTop;
        this.isToTop = false;
        const selectedBlocks = bibleScreenHelper.resetClassName(
            this.div,
            'selected',
            true,
            `${this.selectedIndex}`,
        );
        selectedBlocks.forEach((block: any) => {
            if (isToTop) {
                bringDomToTopView(block);
                this.handleBibleViewVersesHighlighting(
                    block.dataset.kjvVerseKey,
                    true,
                );
            } else {
                bringDomToNearestView(block);
                this.handleBibleViewVersesHighlighting(
                    block.dataset.kjvVerseKey,
                    false,
                );
            }
        });
    }

    async receiveScreenDropped(droppedData: DroppedDataType) {
        if (droppedData.type === DragTypeEnum.BIBLE_ITEM) {
            const bibleItem: BibleItem = droppedData.item;
            this.applyNewBibleItemJson(
                bibleItem.toJson(),
                droppedData.item.filePath,
            );
        } else {
            loggerHelpers.log(droppedData);
        }
    }

    static receiveSyncScreen(message: ScreenMessageType) {
        const { screenId } = message;
        const screenBibleManager = this.getInstance(screenId);
        screenBibleManager.receiveSyncScreen(message);
    }

    clear() {
        this.applyFullDataSrcWithSyncGroup(null);
    }

    static getInstance(screenId: number) {
        return super.getInstanceBase<ScreenBibleManager>(screenId);
    }
}

export default ScreenBibleManager;
