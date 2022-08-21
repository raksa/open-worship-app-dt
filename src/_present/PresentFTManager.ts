import React from 'react';
import BibleItem from '../bible-list/BibleItem';
import EventHandler from '../event/EventHandler';
import { AnyObjectType } from '../helper/helpers';
import { getSetting, setSetting } from '../helper/settingHelper';
import { checkIsValidate } from '../lang';
import { showAppContextMenu } from '../others/AppContextMenu';
import bibleHelper from '../server/bible-helpers/bibleHelpers';
import appProviderPresent from './appProviderPresent';
import fullTextPresentHelper, {
    BibleRenderedType,
} from './fullTextPresentHelper';
import { sendPresentMessage } from './presentEventHelpers';
import { PresentMessageType } from './presentHelpers';
import PresentManager from './PresentManager';

const ftDataType = [
    'bible', 'lyric',
] as const;
export type FTItemDataType = {
    ftFilePath: string;
    type: typeof ftDataType[number],
    id: number,
    renderedList: BibleRenderedType[],
    scroll: number,
    selectedIndex: number | null,
};
export type FTListType = {
    [key: string]: FTItemDataType;
};

export type PresentFTManagerEventType = 'update' | 'text-style' | 'change-bible';

const settingName = 'present-ft-';
export default class PresentFTManager extends EventHandler<PresentFTManagerEventType> {
    static eventNamePrefix: string = 'present-ft-m';
    readonly presentId: number;
    private _ftItemData: FTItemDataType | null = null;
    private static _textStyle: AnyObjectType = {};
    private static _isLineSync = false;
    private _div: HTMLDivElement | null = null;
    private _syncScrollTimeout: any = null;
    private _divScrollListener;
    constructor(presentId: number) {
        super();
        this.presentId = presentId;
        if (appProviderPresent.isMain) {
            const allFTList = PresentFTManager.getFTList();
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
        const allFTList = PresentFTManager.getFTList();
        if (ftItemData === null) {
            delete allFTList[this.key];
        } else {
            allFTList[this.key] = ftItemData;
        }
        PresentFTManager.setFTList(allFTList);
        this.sendSyncData();
        this.fireUpdate();
    }
    private _setMetadata(key: string, value: any) {
        if (this._ftItemData !== null) {
            (this._ftItemData as any)[key] = value;
            if (!appProviderPresent.isPresent) {
                const allFTList = PresentFTManager.getFTList();
                allFTList[this.key] = this._ftItemData;
                PresentFTManager.setFTList(allFTList);
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
    static getFTList(): FTListType {
        const str = getSetting(`${settingName}-ft-data`, '{}');
        if (str !== '') {
            try {
                const json = JSON.parse(str);
                const validateBible = (renderedList: any) => {
                    return !Array.isArray(renderedList)
                        || renderedList.some(({
                            locale, bibleName, title, verses,
                        }: any) => {
                            return !checkIsValidate(locale)
                                || typeof bibleName !== 'string'
                                || typeof title !== 'string'
                                || !Array.isArray(verses)
                                || verses.some(({ num, text }: any) => {
                                    return typeof num !== 'string'
                                        || typeof text !== 'string';
                                });
                        });
                };
                const validateLyric = (renderedList: any) => {
                    return !Array.isArray(renderedList)
                        || renderedList.some(({
                            locale, title, items,
                        }: any) => {
                            return !checkIsValidate(locale)
                                || typeof title !== 'string'
                                || !Array.isArray(items)
                                || items.some(({ text }: any) => {
                                    return typeof text !== 'string';
                                });
                        });
                };
                Object.values(json).forEach((item: any) => {
                    if (typeof item.ftFilePath !== 'string'
                        || typeof item.id !== 'number'
                        || !ftDataType.includes(item.type)
                        || (item.type === 'bible' && validateBible(item.renderedList))
                        || (item.type === 'lyric' && validateLyric(item.renderedList))) {
                        console.log(item);
                        throw new Error('Invalid full-text data');
                    }
                });
                return json;
            } catch (error) {
                appProviderPresent.appUtils
                    .handleError(error);
            }
        }
        return {};
    }
    static setFTList(ftList: FTListType) {
        const str = JSON.stringify(ftList);
        setSetting(`${settingName}-ft-data`, str);
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
    static getDataList(ftFilePath: string, ftItemId: number) {
        const dataList = this.getFTList();
        return Object.entries(dataList).filter(([_, data]) => {
            return data.ftFilePath === ftFilePath &&
                data.id === ftItemId;
        });
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
    static async ftBibleSelect(ftFilePath: string,
        id: number, bibleItems: BibleItem[],
        event: React.MouseEvent) {
            console.log(bibleItems);
            
        const chosenPresentManagers = await PresentManager.contextChooseInstances(event);
        const renderedList = await fullTextPresentHelper.genRenderList(bibleItems);
        chosenPresentManagers.forEach(async (presentManager) => {
            const { presentFTManager } = presentManager;
            const { ftItemData } = presentFTManager;
            const willSelected = `${ftFilePath}:${id}`;
            const selected = `${ftItemData?.ftFilePath}:${ftItemData?.id}`;
            if (selected !== willSelected) {
                presentFTManager.ftItemData = {
                    ftFilePath,
                    type: 'bible',
                    id,
                    renderedList,
                    scroll: 0,
                    selectedIndex: null,
                };
            } else {
                presentFTManager.ftItemData = null;
            }
        });
        PresentFTManager.fireUpdateEvent();
    }
    static bibleItemSelect(bibleItem: BibleItem, event: React.MouseEvent) {
        if (bibleItem.fileSource !== undefined) {
            const convertedItems = BibleItem.convertPresent(bibleItem,
                BibleItem.getBiblePresentingSetting());
            PresentFTManager.ftBibleSelect(bibleItem.fileSource.filePath,
                bibleItem.id, convertedItems, event);
        }
    }
    render() {
        if (this.div === null) {
            return;
        }
        const ftItemData = this.ftItemData;
        if (ftItemData !== null) {
            const newTable = fullTextPresentHelper.genHtmlFTItem(ftItemData.renderedList,
                PresentFTManager._isLineSync);
            fullTextPresentHelper.registerHighlight(newTable, {
                onSelectIndex: (selectedIndex) => {
                    this.selectedIndex = selectedIndex;
                    this.sendSyncSelectedIndex();
                },
                onBibleSelect: async (event: any, index) => {
                    const bibleItemingList = ftItemData.renderedList.map(({ bibleName }) => {
                        return bibleName;
                    });
                    const bibleList = await bibleHelper.getBibleListWithStatus();
                    const bibleListFiltered = bibleList.filter(([bibleName]) => {
                        return !bibleItemingList.includes(bibleName);
                    });
                    showAppContextMenu(event,
                        bibleListFiltered.map(([bibleName, isAvailable]) => {
                            return {
                                title: bibleName,
                                disabled: !isAvailable,
                                onClick: () => {
                                    // TODO: implement this select bible
                                    console.log(index, bibleName);
                                },
                            };
                        }));
                },
            });
            const divHaftScale = document.createElement('div');
            divHaftScale.appendChild(newTable);
            const parentWidth = this.presentManager.width;
            const parentHeight = this.presentManager.height;
            const { bounds } = PresentManager.getDisplayByPresentId(this.presentId);
            const width = bounds.width;
            const height = bounds.height;
            Object.assign(divHaftScale.style, {
                width: `${width}px`,
                height: `${height}px`,
                transform: 'translate(-50%, -50%)',
            });
            const scale = parentWidth / width;
            const divContainer = document.createElement('div');
            divContainer.appendChild(divHaftScale);
            Object.assign(divContainer.style, {
                position: 'absolute',
                width: `${parentWidth}px`,
                height: `${parentHeight}px`,
                transform: `scale(${scale},${scale}) translate(50%, 50%)`,
            });
            Array.from(this.div.children).forEach((child) => {
                child.remove();
            });
            this.div.appendChild(divContainer);
            this.renderScroll(true);
            this.renderSelectedIndex();
        } else {
            if (this.div.lastChild !== null) {
                const targetDiv = this.div.lastChild as HTMLDivElement;
                targetDiv.remove();
            }
        }
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
    static startPresentDrag(event: React.DragEvent<HTMLDivElement>,
        ftItemData: FTItemDataType) {
        const data = {
            present: {
                target: 'ft',
                ftItemData,
            },
        };
        event.dataTransfer.setData('text/plain',
            JSON.stringify(data));
    }
    async receivePresentDrag(presentData: AnyObjectType) {
        this.ftItemData = presentData.ftItemData;
    }
    static getInstanceByPresentId(presentId: number) {
        const presentManager = PresentManager.getInstance(presentId);
        return presentManager.presentFTManager;
    }
    sendSyncPresent() {
        this.sendSyncData();
    }
}
