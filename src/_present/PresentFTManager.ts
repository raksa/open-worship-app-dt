import React from 'react';
import BibleItem, { BibleItemType } from '../bible-list/BibleItem';
import EventHandler from '../event/EventHandler';
import { AnyObjectType } from '../helper/helpers';
import { getSetting, setSetting } from '../helper/settingHelper';
import appProviderPresent from './appProviderPresent';
import fullTextPresentHelper from './fullTextPresentHelper';
import { sendPresentMessage } from './presentEventHelpers';
import {
    PresentFTManagerEventType,
    FTItemDataType,
    settingName,
    getFTList,
    setFTList,
    renderPFTManager,
    bibleItemToFtData,
    FfDataType,
    genMouseEvent,
} from './presentFTHelpers';
import { PresentDragTargetType, PresentMessageType } from './presentHelpers';
import PresentManager from './PresentManager';

export default class PresentFTManager extends EventHandler<PresentFTManagerEventType> {
    static eventNamePrefix: string = 'present-ft-m';
    readonly presentId: number;
    private _ftItemData: FTItemDataType | null = null;
    private static _textStyle: AnyObjectType = {};
    static isLineSync = false;
    private _div: HTMLDivElement | null = null;
    private _syncScrollTimeout: any = null;
    private _divScrollListener;
    constructor(presentId: number) {
        super();
        this.presentId = presentId;
        if (appProviderPresent.isMain) {
            const allFTList = getFTList();
            this._ftItemData = allFTList[this.key] || null;

            const str = getSetting(`${settingName}-style-text`, '{}');
            try {
                const style = JSON.parse(str);
                if (typeof style !== 'object') {
                    console.log(style);
                    throw new Error('Invalid style data');
                }
                PresentFTManager._textStyle = style;
            } catch (error) {
                appProviderPresent.appUtils
                    .handleError(error);
            }
        }
        this._divScrollListener = () => {
            if (this.div === null) {
                return;
            }
            this.scroll = this.div.scrollTop / this.div.scrollHeight;
            this.sendSyncScroll();
        };
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
                PresentFTManager.changeTextStyleTextFontSize(isUp);
            }
        });
        this.registerScrollListener();
        this.render();
    }
    get presentManager() {
        return PresentManager.getInstance(this.presentId);
    }
    get key() {
        return this.presentId.toString();
    }
    get ftItemData() {
        return this._ftItemData;
    }
    set ftItemData(ftItemData: FTItemDataType | null) {
        this._ftItemData = ftItemData;
        this.render();
        const allFTList = getFTList();
        if (ftItemData === null) {
            delete allFTList[this.key];
        } else {
            allFTList[this.key] = ftItemData;
        }
        setFTList(allFTList);
        this.sendSyncData();
        this.fireUpdate();
    }
    private _setMetadata(key: string, value: any) {
        if (this._ftItemData !== null) {
            (this._ftItemData as any)[key] = value;
            if (!appProviderPresent.isPresent) {
                const allFTList = getFTList();
                allFTList[this.key] = this._ftItemData;
                setFTList(allFTList);
            }
        }
    }
    get containerStyle(): React.CSSProperties {
        return {
            position: 'absolute',
            width: `${this.presentManager.width}px`,
            height: `${this.presentManager.height}px`,
            overflowX: 'hidden',
            overflowY: 'auto',
        };
    }
    get selectedIndex() {
        return this._ftItemData === null ? null :
            this._ftItemData.selectedIndex;
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
        this.div?.addEventListener('scroll', this._divScrollListener);
    }
    unregisterScrollListener() {
        this.div?.removeEventListener('scroll', this._divScrollListener);
    }
    sendSyncScroll() {
        sendPresentMessage({
            presentId: this.presentId,
            type: 'full-text-scroll',
            data: {
                scroll: this.scroll,
            },
        }, true);
    }
    static receiveSyncScroll(message: PresentMessageType) {
        const { data, presentId } = message;
        const presentFTManager = this.getInstanceByPresentId(presentId);
        if (presentFTManager._syncScrollTimeout !== null) {
            clearTimeout(presentFTManager._syncScrollTimeout);
        }
        presentFTManager.unregisterScrollListener();
        presentFTManager._syncScrollTimeout = setTimeout(() => {
            presentFTManager._syncScrollTimeout = null;
            presentFTManager.registerScrollListener();
        }, 1e3);
        presentFTManager.scroll = data.scroll;
        presentFTManager.renderScroll();
    }
    sendSyncSelectedIndex() {
        sendPresentMessage({
            presentId: this.presentId,
            type: 'full-text-selected-index',
            data: {
                selectedIndex: this.selectedIndex,
            },
        }, true);
    }
    static receiveSyncSelectedIndex(message: PresentMessageType) {
        const { data, presentId } = message;
        const presentFTManager = this.getInstanceByPresentId(presentId);
        presentFTManager.selectedIndex = data.selectedIndex;
    }
    sendSyncData() {
        sendPresentMessage({
            presentId: this.presentId,
            type: 'full-text',
            data: this.ftItemData,
        });
    }
    static receiveSyncData(message: PresentMessageType) {
        const { data, presentId } = message;
        const presentFTManager = this.getInstanceByPresentId(presentId);
        presentFTManager.ftItemData = data;
    }
    fireUpdate() {
        this.addPropEvent('update');
        PresentFTManager.fireUpdateEvent();
    }
    static fireUpdateEvent() {
        this.addPropEvent('update');
    }
    static maxTextStyleTextFontSize = 200;
    static get textStyleTextFontSize() {
        const textStyle = this.textStyle;
        return typeof textStyle.fontSize !== 'number' ? 25 : textStyle.fontSize;
    }
    static changeTextStyleTextFontSize(isUp: boolean) {
        let fontSize = this.textStyleTextFontSize;
        fontSize += isUp ? 1 : -1;
        this.applyTextStyle({
            fontSize: Math.min(this.maxTextStyleTextFontSize,
                Math.max(1, fontSize)),
        });
    }
    static get textStyleTextColor(): string {
        const textStyle = this.textStyle;
        return typeof textStyle.color !== 'string' ? '#ffffff' : textStyle.color;
    }
    static get textStyleTextTextShadow(): string {
        const textStyle = this.textStyle;
        return typeof textStyle.textShadow !== 'string' ? 'none' : textStyle.textShadow;
    }
    static get textStyleText(): string {
        return `
            font-size: ${this.textStyleTextFontSize}px;
            color: ${this.textStyleTextColor};
            text-shadow: ${this.textStyleTextTextShadow};
        `;
    }
    static get textStyle(): AnyObjectType {
        return this._textStyle;
    }
    static set textStyle(style: AnyObjectType) {
        this._textStyle = style;
        const str = JSON.stringify(style);
        setSetting(`${settingName}-style-text`, str);
        this.sendSynTextStyle();
        this.addPropEvent('text-style');
    }
    static applyTextStyle(style: AnyObjectType) {
        const textStyle = this.textStyle;
        Object.assign(textStyle, style);
        this.textStyle = textStyle;
    }
    static sendSynTextStyle() {
        PresentManager.getAllInstances().forEach((presentManager) => {
            sendPresentMessage({
                presentId: presentManager.presentId,
                type: 'full-text-text-style',
                data: {
                    textStyle: this.textStyle,
                },
            });
        });
    }
    static receiveSyncTextStyle(message: PresentMessageType) {
        const { data } = message;
        this.textStyle = data.textStyle;
    }
    static async ftBibleSelect(event: React.MouseEvent | null, bibleItems: BibleItem[]) {
        const chosenPresentManagers = await PresentManager.contextChooseInstances(
            genMouseEvent(event) as any,
        );
        const ftItemData = await bibleItemToFtData(bibleItems);
        chosenPresentManagers.forEach(async (presentManager) => {
            const { presentFTManager } = presentManager;
            presentFTManager.ftItemData = ftItemData;
        });
        PresentFTManager.fireUpdateEvent();
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
        fullTextPresentHelper.removeClassName(this.div, 'selected');
        fullTextPresentHelper.resetClassName(this.div, 'selected',
            true, `${this.selectedIndex}`);
    }
    static startPresentDrag(bibleItemData: BibleItemType) {
        const copiedBibleItemJson = JSON.parse(JSON.stringify(bibleItemData));
        const target: PresentDragTargetType = 'full-text';
        const type: FfDataType = 'bible';
        (bibleItemData as any).present = {
            target,
            type,
            bibleItem: copiedBibleItemJson,
        };
    }
    async receivePresentDrag(present: AnyObjectType) {
        try {
            if (present.type === 'bible') {
                const newBibleItems = [
                    BibleItem.fromJson(present.bibleItem),
                ];
                const newFtItemData = await bibleItemToFtData(newBibleItems);
                this.ftItemData = newFtItemData;
            }
        } catch (error) {
            appProviderPresent.appUtils.handleError(error);
        }
    }
    static getInstanceByPresentId(presentId: number) {
        const presentManager = PresentManager.getInstance(presentId);
        return presentManager.presentFTManager;
    }
    sendSyncPresent() {
        this.sendSyncData();
    }
}
