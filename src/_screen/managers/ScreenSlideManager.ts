import { CSSProperties } from 'react';

import { DroppedDataType } from '../../helper/DragInf';
import { getSetting, setSetting } from '../../helper/settingHelpers';
import { SlideItemType } from '../../slide-list/Slide';
import { genPdfSlide } from '../../slide-presenter/items/PdfSlideRenderContentComp';
import { genHtmlSlideItem } from '../../slide-presenter/items/SlideItemRenderer';
import appProviderScreen from '../appProviderScreen';
import {
    BasicScreenMessageType,
    ScreenMessageType,
    VaryAppDocumentItemScreenDataType,
} from '../screenHelpers';
import { screenManagerSettingNames } from '../../helper/constants';
import { unlocking } from '../../server/appHelpers';
import ScreenEventHandler from './ScreenEventHandler';
import ScreenManagerBase from './ScreenManagerBase';
import ScreenEffectManager from './ScreenEffectManager';
import { getAppDocumentListOnScreenSetting } from '../preview/screenPreviewerHelpers';
import {
    toKeyByFilePath,
    VaryAppDocumentItemDataType,
    VaryAppDocumentItemType,
} from '../../slide-list/appDocumentHelpers';
import PDFSlide, { PDFSlideType } from '../../slide-list/PDFSlide';

export type ScreenSlideManagerEventType = 'update';

const PDF_FULL_WIDTH_SETTING_NAME = 'pdf-full-width';

export function checkIsPdfFullWidth() {
    const originalSettingName = getSetting(PDF_FULL_WIDTH_SETTING_NAME);
    return originalSettingName === 'true';
}
export function setIsPdfFullWidth(isPdfFullWidth: boolean) {
    setSetting(PDF_FULL_WIDTH_SETTING_NAME, `${isPdfFullWidth}`);
}

class ScreenSlideManager extends ScreenEventHandler<ScreenSlideManagerEventType> {
    static readonly eventNamePrefix: string = 'screen-slide-m';
    private _varyAppDocumentItemData: VaryAppDocumentItemScreenDataType | null =
        null;
    private _div: HTMLDivElement | null = null;
    slideEffectManager: ScreenEffectManager;

    constructor(
        screenManagerBase: ScreenManagerBase,
        slideEffectManager: ScreenEffectManager,
    ) {
        super(screenManagerBase);
        this.slideEffectManager = slideEffectManager;
        if (appProviderScreen.isPagePresenter) {
            const allSlideList = getAppDocumentListOnScreenSetting();
            this._varyAppDocumentItemData = allSlideList[this.key] || null;
        }
    }

    get isShowing() {
        return this.varyAppDocumentItemData !== null;
    }

    get div() {
        return this._div;
    }

    set div(div: HTMLDivElement | null) {
        this._div = div;
        this.render();
    }

    get varyAppDocumentItemData() {
        return this._varyAppDocumentItemData;
    }

    static get isPdfFullWidth() {
        return checkIsPdfFullWidth();
    }

    static set isPdfFullWidth(isFullWidth: boolean) {
        setIsPdfFullWidth(isFullWidth);
    }

    set varyAppDocumentItemData(
        appDocumentItemData: VaryAppDocumentItemScreenDataType | null,
    ) {
        this._varyAppDocumentItemData = appDocumentItemData;
        unlocking(screenManagerSettingNames.SLIDE, () => {
            const allSlideList = getAppDocumentListOnScreenSetting();
            if (appDocumentItemData === null) {
                delete allSlideList[this.key];
            } else {
                allSlideList[this.key] = appDocumentItemData;
            }
            const string = JSON.stringify(allSlideList);
            setSetting(screenManagerSettingNames.SLIDE, string);
        });
        this.render();
        this.sendSyncScreen();
        this.fireUpdateEvent();
    }

    toSyncMessage() {
        return {
            type: 'slide',
            data: this.varyAppDocumentItemData,
        } as BasicScreenMessageType;
    }

    receiveSyncScreen(message: ScreenMessageType) {
        this.varyAppDocumentItemData = message.data;
    }

    fireUpdateEvent() {
        super.fireUpdateEvent();
        ScreenSlideManager.fireUpdateEvent();
    }

    static getDataList(filePath?: string, varyAppDocumentItemId?: number) {
        const dataList = getAppDocumentListOnScreenSetting();
        return Object.entries(dataList).filter(([_, data]) => {
            if (filePath !== undefined && data.filePath !== filePath) {
                return false;
            }
            if (
                varyAppDocumentItemId !== undefined &&
                data.itemJson.id !== varyAppDocumentItemId
            ) {
                return false;
            }
            return true;
        });
    }

    applySlideItemSrcWithSyncGroup(
        varyAppDocumentItemScreenData: VaryAppDocumentItemScreenDataType | null,
    ) {
        ScreenSlideManager.enableSyncGroup(this.screenId);
        this.varyAppDocumentItemData = varyAppDocumentItemScreenData;
    }

    toSlideItemData(
        filePath: string,
        itemJson: VaryAppDocumentItemDataType,
    ): VaryAppDocumentItemScreenDataType {
        return { filePath, itemJson };
    }

    handleSlideSelecting(
        filePath: string,
        itemJson: VaryAppDocumentItemDataType,
    ) {
        const { varyAppDocumentItemData } = this;
        const selectedFilePath = varyAppDocumentItemData?.filePath ?? '';
        const selectedSlideItemId = varyAppDocumentItemData?.itemJson.id ?? '';
        const selected = toKeyByFilePath(
            selectedFilePath,
            selectedSlideItemId || -1,
        );
        const willSelected = toKeyByFilePath(filePath, itemJson.id);
        const newSlideData =
            selected !== willSelected
                ? this.toSlideItemData(filePath, itemJson)
                : null;
        this.applySlideItemSrcWithSyncGroup(newSlideData);
    }

    static async handleSlideSelecting(
        event: React.MouseEvent<HTMLElement, MouseEvent>,
        filePath: string,
        itemJson: VaryAppDocumentItemDataType,
        isForceChoosing = false,
    ) {
        const screenIds = await this.chooseScreenIds(event, isForceChoosing);
        screenIds.forEach((screenId) => {
            const screenSlideManager = this.getInstance(screenId);
            screenSlideManager.handleSlideSelecting(filePath, itemJson);
        });
    }

    renderPdf(divHaftScale: HTMLDivElement, pdfImageData: PDFSlideType) {
        if (!pdfImageData.imagePreviewSrc) {
            return null;
        }
        const isFullWidth = checkIsPdfFullWidth();
        const content = genPdfSlide(pdfImageData.imagePreviewSrc, isFullWidth);
        const parentWidth = this.screenManagerBase.width;
        const width = parentWidth;
        Object.assign(divHaftScale.style, {
            width: '100%',
            height: '100%',
            overflow: isFullWidth ? 'auto' : 'hidden',
            transform: 'translate(-50%, -50%)',
        });
        const scale = parentWidth / width;
        return { content, scale };
    }

    cleanupSlideContent(content: HTMLDivElement) {
        if (!appProviderScreen.isScreen) {
            return;
        }
        Array.from(content.children).forEach((child) => {
            child.querySelectorAll('svg').forEach((svg) => {
                svg.style.display = 'none';
            });
            child.querySelectorAll('video').forEach((video) => {
                video.loop = false;
                video.muted = false;
                video.play();
            });
        });
    }

    renderAppDocument(divHaftScale: HTMLDivElement, itemJson: SlideItemType) {
        const content = genHtmlSlideItem(itemJson.canvasItems);
        this.cleanupSlideContent(content);
        const { width, height } = itemJson.metadata;
        Object.assign(divHaftScale.style, {
            width: `${width}px`,
            height: `${height}px`,
            transform: 'translate(-50%, -50%)',
        });
        const scale = this.screenManagerBase.width / width;
        return { content, scale };
    }

    async clearJung(div: HTMLDivElement) {
        if (div.lastChild === null) {
            return;
        }
        const targetDiv = div.lastChild as HTMLDivElement;
        await this.slideEffectManager.styleAnim.animOut(targetDiv);
        targetDiv.remove();
    }

    render() {
        if (this.div === null) {
            return;
        }
        const div = this.div;
        if (this.varyAppDocumentItemData === null) {
            this.clearJung(div);
            return;
        }
        const divContainer = document.createElement('div');
        const divHaftScale = document.createElement('div');
        divContainer.appendChild(divHaftScale);
        const { itemJson } = this.varyAppDocumentItemData;

        const target = PDFSlide.tryValidate(itemJson)
            ? this.renderPdf(divHaftScale, itemJson as PDFSlideType)
            : this.renderAppDocument(divHaftScale, itemJson as SlideItemType);
        if (target === null) {
            return;
        }
        Array.from(div.children).forEach(async (child) => {
            await this.slideEffectManager.styleAnim.animOut(
                child as HTMLDivElement,
            );
            child.remove();
        });
        div.appendChild(divContainer);
        divHaftScale.appendChild(target.content);
        Object.assign(divContainer.style, {
            position: 'absolute',
            width: `${this.screenManagerBase.width}px`,
            height: `${this.screenManagerBase.height}px`,
            transform: `scale(${target.scale},${target.scale}) translate(50%, 50%)`,
        });
        this.slideEffectManager.styleAnim.animIn(divContainer);
    }

    get containerStyle(): CSSProperties {
        return {
            position: 'absolute',
            width: `${this.screenManagerBase.width}px`,
            height: `${this.screenManagerBase.height}px`,
            overflow: 'hidden',
        };
    }

    async receiveScreenDropped(droppedData: DroppedDataType) {
        const item: VaryAppDocumentItemType = droppedData.item;
        this.varyAppDocumentItemData = {
            filePath: item.filePath,
            itemJson: item.toJson(),
        };
    }

    static receiveSyncScreen(message: ScreenMessageType) {
        const { screenId } = message;
        const screenSlideManager = this.getInstance(screenId);
        screenSlideManager.receiveSyncScreen(message);
    }

    clear() {
        this.applySlideItemSrcWithSyncGroup(null);
    }

    static getInstance(screenId: number) {
        return super.getInstanceBase<ScreenSlideManager>(screenId);
    }
}

export default ScreenSlideManager;
