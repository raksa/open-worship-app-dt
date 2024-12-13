import { CSSProperties } from 'react';

import BibleItem from '../bible-list/BibleItem';
import EventHandler from '../event/EventHandler';
import {
    DroppedDataType, DragTypeEnum,
} from '../helper/DragInf';
import {
    AnyObjectType, isValidJson,
} from '../helper/helpers';
import { getSetting, setSetting } from '../helper/settingHelpers';
import Lyric from '../lyric-list/Lyric';
import appProviderScreen from './appProviderScreen';
import fullTextScreenHelper from './fullTextScreenHelpers';
import { sendScreenMessage } from './screenEventHelpers';
import {
    ScreenFTManagerEventType, SCREEN_FT_SETTING_PREFIX, renderPFTManager,
    bibleItemToFtData,
} from './screenFTHelpers';
import {
    FTItemDataType,
    FTListType,
    genScreenMouseEvent, getFTListOnScreenSetting, ScreenMessageType,
} from './screenHelpers';
import ScreenManager from './ScreenManager';
import ScreenManagerInf from './ScreenManagerInf';
import * as loggerHelpers from '../helper/loggerHelpers';
import { handleError } from '../helper/errorHelpers';
import { screenManagerSettingNames } from '../helper/constants';

let textStyle: AnyObjectType = {};
export default class ScreenFTManager
    extends EventHandler<ScreenFTManagerEventType>
    implements ScreenManagerInf {

    static readonly eventNamePrefix: string = 'screen-ft-m';
    readonly screenId: number;
    private _ftItemData: FTItemDataType | null = null;
    private _div: HTMLDivElement | null = null;
    private _syncScrollTimeout: any = null;
    private _divScrollListenerBind: (() => void) | null = null;

    constructor(screenId: number) {
        super();
        this.screenId = screenId;
        if (appProviderScreen.isPagePresenter) {
            const allFTList = getFTListOnScreenSetting();
            this._ftItemData = allFTList[this.key] || null;

            const str = getSetting(
                `${SCREEN_FT_SETTING_PREFIX}-style-text`, '',
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
    private _divScrollListener() {
        if (this.div === null) {
            return;
        }
        this.scroll = this.div.scrollTop / this.div.scrollHeight;
        this.sendSyncScroll();
    };
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
        return this._div || null;
    }
    set div(div: HTMLDivElement | null) {
        this._div = div;
        this._div?.addEventListener('wheel', (event) => {
            if (event.ctrlKey) {
                event.preventDefault();
                const isUp = event.deltaY < 0;
                ScreenFTManager.changeTextStyleTextFontSize(isUp);
            }
        });
        this.registerScrollListener();
        this.render();
    }
    get screenManager() {
        return ScreenManager.getInstance(this.screenId);
    }
    get key() {
        return this.screenId.toString();
    }
    get ftItemData() {
        return this._ftItemData;
    }
    set ftItemData(ftItemData: FTItemDataType | null) {
        this._ftItemData = ftItemData;
        this.render();
        const allFTList = getFTListOnScreenSetting();
        if (ftItemData === null) {
            delete allFTList[this.key];
        } else {
            allFTList[this.key] = ftItemData;
        }
        ScreenFTManager.setFTList(allFTList);
        this.sendSyncData();
        this.fireUpdate();
    }
    private _setMetadata(key: string, value: any) {
        if (this._ftItemData !== null) {
            (this._ftItemData as any)[key] = value;
            if (!appProviderScreen.isScreen) {
                const allFTList = getFTListOnScreenSetting();
                allFTList[this.key] = this._ftItemData;
                ScreenFTManager.setFTList(allFTList);
            }
        }
    }
    get containerStyle(): CSSProperties {
        const { screenManager } = this;
        if (screenManager === null) {
            return {};
        }
        return {
            position: 'absolute',
            width: `${screenManager.width}px`,
            height: `${screenManager.height}px`,
            overflowX: 'hidden',
            overflowY: 'auto',
        };
    }
    get selectedIndex() {
        return (
            this._ftItemData === null ? null : this._ftItemData.selectedIndex
        );
    }
    set selectedIndex(selectedIndex: number | null) {
        this._setMetadata('selectedIndex', selectedIndex);
        this.renderSelectedIndex();
    }
    get scroll() {
        return this.ftItemData?.scroll || 0;
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
        this.div?.removeEventListener(
            'scroll', this._divScrollListenerBind,
        );
        this._divScrollListenerBind = null;
    }
    async sendSyncScroll() {
        sendScreenMessage({
            screenId: this.screenId,
            type: 'full-text-scroll',
            data: {
                scroll: this.scroll,
            },
        }, true);
    }
    static receiveSyncScroll(message: ScreenMessageType) {
        const { data, screenId } = message;
        const screenFTManager = this.getInstanceByScreenId(screenId);
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
            reRegisterScrollListener, 3e3,
        );
        screenFTManager.scroll = data.scroll;
        screenFTManager.renderScroll();
    }
    sendSyncSelectedIndex() {
        sendScreenMessage({
            screenId: this.screenId,
            type: 'full-text-selected-index',
            data: {
                selectedIndex: this.selectedIndex,
            },
        }, true);
    }
    static setFTList(ftList: FTListType) {
        const str = JSON.stringify(ftList);
        setSetting(screenManagerSettingNames.FT, str);
    }
    static receiveSyncSelectedIndex(message: ScreenMessageType) {
        const { data, screenId } = message;
        const screenFTManager = this.getInstanceByScreenId(screenId);
        if (screenFTManager === null) {
            return;
        }
        screenFTManager.selectedIndex = data.selectedIndex;
    }
    sendSyncData() {
        sendScreenMessage({
            screenId: this.screenId,
            type: 'full-text',
            data: this.ftItemData,
        });
    }
    static receiveSyncData(message: ScreenMessageType) {
        const { data, screenId } = message;
        const screenFTManager = this.getInstanceByScreenId(screenId);
        if (screenFTManager === null) {
            return;
        }
        screenFTManager.ftItemData = data;
    }
    fireUpdate() {
        this.addPropEvent('update');
        ScreenFTManager.fireUpdateEvent();
    }
    static fireUpdateEvent() {
        this.addPropEvent('update');
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
                this.maxTextStyleTextFontSize, Math.max(1, fontSize),
            ),
        });
    }
    static get textStyleTextColor(): string {
        const textStyle = this.textStyle;
        return typeof textStyle.color !== 'string' ?
            '#ffffff' : textStyle.color;
    }
    static get textStyleTextTextShadow(): string {
        const textStyle = this.textStyle;
        return typeof textStyle.textShadow !== 'string' ?
            'none' : textStyle.textShadow;
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
        ScreenManager.getAllInstances().forEach((screenManager) => {
            sendScreenMessage({
                screenId: screenManager.screenId,
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
    static async ftBibleItemSelect(
        event: React.MouseEvent | null, bibleItems: BibleItem[],
    ) {
        const chosenScreenManagers = (
            await ScreenManager.contextChooseInstances(
                genScreenMouseEvent(event) as any,
            )
        );
        const ftItemData = await bibleItemToFtData(bibleItems);
        chosenScreenManagers.forEach((screenManager) => {
            const { screenFTManager } = screenManager;
            screenFTManager.ftItemData = ftItemData;
        });
    }
    static async ftLyricSelect(event: React.MouseEvent | null, lyric: Lyric) {
        const chosenScreenManagers = (
            await ScreenManager.contextChooseInstances(
                genScreenMouseEvent(event) as any,
            )
        );
        const renderedList = fullTextScreenHelper.genLyricRenderList(lyric);
        const ftItemData: FTItemDataType = {
            type: 'lyric',
            lyricData: {
                renderedList,
            },
            scroll: 0,
            selectedIndex: null,
        };
        chosenScreenManagers.forEach((screenManager) => {
            const { screenFTManager } = screenManager;
            screenFTManager.ftItemData = ftItemData;
        });
    }
    render() {
        renderPFTManager(this);
    }
    renderScroll(isQuick?: boolean) {
        if (this.div === null) {
            return;
        }
        const scrollTop = this.scroll * this.div.scrollHeight;
        if (isQuick) {
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
            this.div, 'selected', true, `${this.selectedIndex}`,
        );
    }
    async receiveScreenDrag(droppedData: DroppedDataType) {
        if (droppedData.type === DragTypeEnum.BIBLE_ITEM) {
            const newFtItemData = await bibleItemToFtData([droppedData.item]);
            this.ftItemData = newFtItemData;
        } else {
            loggerHelpers.log(droppedData);
        }
    }
    static getInstanceByScreenId(screenId: number) {
        const screenManager = ScreenManager.getInstance(screenId);
        if (screenManager === null) {
            return null;
        }
        return screenManager.screenFTManager;
    }
    sendSyncScreen() {
        this.sendSyncData();
    }
    delete() {
        this.ftItemData = null;
    }
}
