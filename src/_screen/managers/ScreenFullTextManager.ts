import { CSSProperties } from 'react';

import BibleItem from '../../bible-list/BibleItem';
import { DroppedDataType, DragTypeEnum } from '../../helper/DragInf';
import { AnyObjectType, isValidJson } from '../../helper/helpers';
import { getSetting, setSetting } from '../../helper/settingHelpers';
import appProviderScreen from '../appProviderScreen';
import fullTextScreenHelper from '../fullTextScreenHelpers';
import {
    ScreenFTManagerEventType,
    SCREEN_FT_SETTING_PREFIX,
    renderScreenFullTextManager,
    bibleItemToFtData,
} from '../screenFullTextHelpers';
import {
    BasicScreenMessageType,
    FullTextItemDataType,
    genScreenMouseEvent,
    getFullTextListOnScreenSetting,
    ScreenMessageType,
} from '../screenHelpers';
import * as loggerHelpers from '../../helper/loggerHelpers';
import { handleError } from '../../helper/errorHelpers';
import { screenManagerSettingNames } from '../../helper/constants';
import { unlocking } from '../../server/appHelpers';
import ScreenEventHandler from './ScreenEventHandler';
import ScreenManagerBase from './ScreenManagerBase';
import { getAllScreenManagerBases } from './screenManagerBaseHelpers';

let textStyle: AnyObjectType = {};
class ScreenFullTextManager extends ScreenEventHandler<ScreenFTManagerEventType> {
    static readonly eventNamePrefix: string = 'screen-ft-m';
    private _ftItemData: FullTextItemDataType | null = null;
    private _div: HTMLDivElement | null = null;
    private _syncScrollTimeout: any = null;
    private _divScrollListenerBind: (() => void) | null = null;

    constructor(screenManagerBase: ScreenManagerBase) {
        super(screenManagerBase);
        if (appProviderScreen.isPagePresenter) {
            const allFTList = getFullTextListOnScreenSetting();
            this._ftItemData = allFTList[this.key] ?? null;

            const str = getSetting(
                `${SCREEN_FT_SETTING_PREFIX}-style-text`,
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
        return this.fullTextItemData !== null;
    }

    private _divScrollListener() {
        if (this.div === null) {
            return;
        }
        this.scroll = this.div.scrollTop / this.div.scrollHeight;
        this.sendSyncScroll();
    }

    get isLineSync() {
        const screenId = this.screenId;
        const settingKey = `${SCREEN_FT_SETTING_PREFIX}-line-sync-${screenId}`;
        return getSetting(settingKey) === 'true';
    }

    set isLineSync(isLineSync: boolean) {
        setSetting(
            `${SCREEN_FT_SETTING_PREFIX}-line-sync-${this.screenId}`,
            `${isLineSync}`,
        );
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
                ScreenFullTextManager.changeTextStyleTextFontSize(isUp);
            }
        });
        this.registerScrollListener();
        this.render();
    }

    get fullTextItemData() {
        return this._ftItemData;
    }

    set fullTextItemData(ftItemData: FullTextItemDataType | null) {
        this._ftItemData = ftItemData;
        this.render();
        unlocking(`set-${screenManagerSettingNames.FULL_TEXT}`, () => {
            const allFTList = getFullTextListOnScreenSetting();
            if (ftItemData === null) {
                delete allFTList[this.key];
            } else {
                allFTList[this.key] = ftItemData;
            }
            const string = JSON.stringify(allFTList);
            setSetting(screenManagerSettingNames.FULL_TEXT, string);
        });
        this.sendSyncScreen();
        this.fireUpdateEvent();
    }

    private _setMetadata(key: string, value: any) {
        if (this._ftItemData !== null) {
            (this._ftItemData as any)[key] = value;
            if (!appProviderScreen.isScreen) {
                unlocking(
                    `set-meta-${screenManagerSettingNames.FULL_TEXT}`,
                    () => {
                        const allFTList = getFullTextListOnScreenSetting();
                        allFTList[this.key] = this._ftItemData as any;
                        const string = JSON.stringify(allFTList);
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
        return this.fullTextItemData?.scroll ?? 0;
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
        const screenFTManager = this.getInstance(screenId);
        if (screenFTManager === null) {
            return;
        }
        if (screenFTManager._syncScrollTimeout !== null) {
            clearTimeout(screenFTManager._syncScrollTimeout);
        }
        screenFTManager.unregisterScrollListener();
        const reRegisterScrollListener = () => {
            if (screenFTManager._syncScrollTimeout !== null) {
                clearTimeout(screenFTManager._syncScrollTimeout);
            }
            screenFTManager._syncScrollTimeout = null;
            screenFTManager.registerScrollListener();
        };
        screenFTManager._syncScrollTimeout = setTimeout(
            reRegisterScrollListener,
            3e3,
        );
        screenFTManager.scroll = data.scroll;
        screenFTManager.renderScroll();
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
        const screenFTManager = this.getInstance(screenId);
        if (screenFTManager === null) {
            return;
        }
        screenFTManager.selectedIndex = data.selectedIndex;
    }

    toSyncMessage(): BasicScreenMessageType {
        return {
            type: 'full-text',
            data: this.fullTextItemData,
        };
    }

    applyFullDataSrcWithSyncGroup(fullTextData: FullTextItemDataType | null) {
        ScreenFullTextManager.enableSyncGroup(this.screenId);
        this.fullTextItemData = fullTextData;
    }

    receiveSyncScreen(message: ScreenMessageType) {
        this.fullTextItemData = message.data;
    }

    fireUpdateEvent() {
        super.fireUpdateEvent();
        ScreenFullTextManager.fireUpdateEvent();
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
        setSetting(`${SCREEN_FT_SETTING_PREFIX}-style-text`, str);
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

    static async handleBibleItemSelecting(
        event: React.MouseEvent | null,
        bibleItems: BibleItem[],
        isForceChoosing = false,
    ) {
        const ftItemData = await bibleItemToFtData(bibleItems);
        const screenIds = await this.chooseScreenIds(
            genScreenMouseEvent(event) as any,
            isForceChoosing,
        );
        screenIds.forEach((screenId) => {
            const screenFullTextManager = this.getInstance(screenId);
            screenFullTextManager.applyFullDataSrcWithSyncGroup(ftItemData);
        });
    }

    render() {
        renderScreenFullTextManager(this);
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
            top: scrollTop,
            left: 0,
            behavior: 'smooth',
        });
    }

    renderSelectedIndex() {
        if (this.div === null) {
            return;
        }
        fullTextScreenHelper.removeClassName(this.div, 'selected');
        fullTextScreenHelper.resetClassName(
            this.div,
            'selected',
            true,
            `${this.selectedIndex}`,
        );
    }

    async receiveScreenDropped(droppedData: DroppedDataType) {
        if (droppedData.type === DragTypeEnum.BIBLE_ITEM) {
            const newFullTextItemData = await bibleItemToFtData([
                droppedData.item,
            ]);
            this.applyFullDataSrcWithSyncGroup(newFullTextItemData);
        } else {
            loggerHelpers.log(droppedData);
        }
    }

    static receiveSyncScreen(message: ScreenMessageType) {
        const { screenId } = message;
        const screenFullTextManager = this.getInstance(screenId);
        screenFullTextManager.receiveSyncScreen(message);
    }

    clear() {
        this.applyFullDataSrcWithSyncGroup(null);
    }

    static getInstance(screenId: number) {
        return super.getInstanceBase<ScreenFullTextManager>(screenId);
    }
}

export default ScreenFullTextManager;
