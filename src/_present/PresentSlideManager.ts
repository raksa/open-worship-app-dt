import { CSSProperties } from 'react';

import EventHandler from '../event/EventHandler';
import { DragTypeEnum, DroppedDataType } from '../helper/DragInf';
import { isValidJsonString } from '../helper/helpers';
import { getSetting, setSetting } from '../helper/settingHelper';
import { PdfImageDataType } from '../pdf/PdfController';
import SlideItem, { SlideItemType } from '../slide-list/SlideItem';
import { genPdfSlideItem } from '../slide-presenting/items/SlideItemPdfRender';
import { genHtmlSlideItem } from '../slide-presenting/items/SlideItemRenderer';
import appProviderPresent from './appProviderPresent';
import { sendPresentMessage } from './presentEventHelpers';
import { PresentMessageType } from './presentHelpers';
import PresentManager from './PresentManager';
import PresentManagerInf from './PresentManagerInf';
import PresentTransitionEffect
    from './transition-effect/PresentTransitionEffect';
import { TargetType } from './transition-effect/transitionEffectHelpers';
import { handleError } from '../helper/errorHelpers';

export type SlideItemDataType = {
    slideFilePath: string;
    slideItemJson: SlideItemType
};
export type SlideListType = {
    [key: string]: SlideItemDataType;
};

export type PresentSlideManagerEventType = 'update';

const settingName = 'present-slide-';
export default class PresentSlideManager extends
    EventHandler<PresentSlideManagerEventType>
    implements PresentManagerInf {
    static readonly eventNamePrefix: string = 'present-slide-m';
    readonly presentId: number;
    private _slideItemData: SlideItemDataType | null = null;
    private _div: HTMLDivElement | null = null;
    ptEffectTarget: TargetType = 'slide';
    constructor(presentId: number) {
        super();
        this.presentId = presentId;
        if (appProviderPresent.isMain) {
            const allSlideList = PresentSlideManager.getSlideList();
            this._slideItemData = allSlideList[this.key] || null;
        }
    }
    get div() {
        return this._div;
    }
    set div(div: HTMLDivElement | null) {
        this._div = div;
        this.render();
    }
    get ptEffect() {
        return PresentTransitionEffect.getInstance(
            this.presentId, this.ptEffectTarget);
    }
    get presentManager() {
        return PresentManager.getInstance(this.presentId);
    }
    get key() {
        return this.presentId.toString();
    }
    get slideItemData() {
        return this._slideItemData;
    }
    set slideItemData(slideItemData: SlideItemDataType | null) {
        this._slideItemData = slideItemData;
        this.render();
        const allSlideList = PresentSlideManager.getSlideList();
        if (slideItemData === null) {
            delete allSlideList[this.key];
        } else {
            allSlideList[this.key] = slideItemData;
        }
        PresentSlideManager.setSlideList(allSlideList);
        this.sendSyncPresent();
        this.fireUpdate();
    }
    sendSyncPresent() {
        sendPresentMessage({
            presentId: this.presentId,
            type: 'slide',
            data: this.slideItemData,
        });
    }
    static receiveSyncPresent(message: PresentMessageType) {
        const { data, presentId } = message;
        const presentManager = PresentManager.getInstance(presentId);
        if (presentManager === null) {
            return;
        }
        presentManager.presentSlideManager.slideItemData = data;
    }
    fireUpdate() {
        this.addPropEvent('update');
        PresentSlideManager.fireUpdate();
    }
    static fireUpdate() {
        this.addPropEvent('update');
    }
    static getSlideList(): SlideListType {
        const str = getSetting(settingName, '');
        try {
            if (!isValidJsonString(str, true)) {
                return {};
            }
            const json = JSON.parse(str);
            Object.values(json).forEach((item: any) => {
                if (typeof item.slideFilePath !== 'string') {
                    throw new Error('Invalid slide path');
                }
                SlideItem.validate(item.slideItemJson);
            });
            return json;
        } catch (error) {
            handleError(error);
        }
        return {};
    }
    static setSlideList(slideList: SlideListType) {
        const str = JSON.stringify(slideList);
        setSetting(settingName, str);
    }
    static getDataList(slideFilePath?: string, slideItemId?: number) {
        const dataList = this.getSlideList();
        return Object.entries(dataList).filter(([_, data]) => {
            if (
                slideFilePath !== undefined &&
                data.slideFilePath !== slideFilePath
            ) {
                return false;
            }
            if (
                slideItemId !== undefined &&
                data.slideItemJson.id !== slideItemId
            ) {
                return false;
            }
            return true;
        });
    }
    static async slideSelect(slideFilePath: string,
        slideItemJson: SlideItemType,
        event: React.MouseEvent<HTMLElement, MouseEvent>) {
        const chosenPresentManagers = await PresentManager
            .contextChooseInstances(event);
        chosenPresentManagers.forEach((presentManager) => {
            const { presentSlideManager } = presentManager;
            const { slideItemData } = presentSlideManager;
            const willSelected = `${slideFilePath}:${slideItemJson.id}`;
            const slideItemId = slideItemData?.slideItemJson.id;
            const selected = `${slideItemData?.slideFilePath}:${slideItemId}`;
            if (selected !== willSelected) {
                presentSlideManager.slideItemData = {
                    slideFilePath,
                    slideItemJson,
                };
            } else {
                presentSlideManager.slideItemData = null;
            }
        });
    }
    renderPdf(pdfImageData: PdfImageDataType) {
        const { presentManager } = this;
        if (presentManager === null || this.div === null) {
            return;
        }
        Array.from(this.div.children).forEach((child) => {
            child.remove();
        });
        const { src: pdfImageSrc } = pdfImageData;
        const parentWidth = presentManager.width;
        const content = genPdfSlideItem(parentWidth, pdfImageSrc);
        const divContainer = document.createElement('div');
        Object.assign(divContainer.style, {
            width: '100%',
            height: '100%',
            overflow: 'auto',
        });
        divContainer.appendChild(content);
        this.div.appendChild(divContainer);
    }
    render() {
        if (this.div === null) {
            return;
        }
        const aminData = this.ptEffect.styleAnim;
        const slideItemData = this.slideItemData;
        if (this.presentManager !== null && slideItemData !== null) {
            if (slideItemData.slideItemJson.pdfImageData) {
                this.renderPdf(slideItemData.slideItemJson.pdfImageData);
                return;
            }
            const { slideItemJson } = slideItemData;
            const content = genHtmlSlideItem(slideItemJson.canvasItems);
            const divHaftScale = document.createElement('div');
            divHaftScale.appendChild(content);
            const parentWidth = this.presentManager.width;
            const parentHeight = this.presentManager.height;
            const width = slideItemJson.metadata.width;
            const height = slideItemJson.metadata.height;
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
            const childList = Array.from(this.div.children);
            this.div.appendChild(divContainer);
            aminData.animIn(divContainer).then(() => {
                childList.forEach((child) => {
                    child.remove();
                });
                if (appProviderPresent.isPresent) {
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
            });
        } else if (this.div.lastChild !== null) {
            const targetDiv = this.div.lastChild as HTMLDivElement;
            aminData.animOut(targetDiv).then(() => {
                targetDiv.remove();
            });
        }
    }
    get containerStyle(): CSSProperties {
        const { presentManager } = this;
        if (presentManager === null) {
            return {};
        }
        return {
            position: 'absolute',
            width: `${presentManager.width}px`,
            height: `${presentManager.height}px`,
            overflow: 'hidden',
        };
    }
    async receivePresentDrag(droppedData: DroppedDataType) {
        if (droppedData.type === DragTypeEnum.SLIDE_ITEM) {
            const slideItem = droppedData.item as SlideItem;
            this.slideItemData = {
                slideFilePath: slideItem.filePath,
                slideItemJson: slideItem.toJson(),
            };
        }
    }
    delete() {
        this.slideItemData = null;
    }
}
