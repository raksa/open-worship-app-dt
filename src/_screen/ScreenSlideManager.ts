import { CSSProperties } from 'react';

import EventHandler from '../event/EventHandler';
import { DragTypeEnum, DroppedDataType } from '../helper/DragInf';
import { getSetting, setSetting } from '../helper/settingHelpers';
import { PdfImageDataType } from '../pdf/PdfController';
import SlideItem, { SlideItemType } from '../slide-list/SlideItem';
import { genPdfSlideItem } from '../slide-presenter/items/SlideItemPdfRender';
import { genHtmlSlideItem } from '../slide-presenter/items/SlideItemRenderer';
import appProviderScreen from './appProviderScreen';
import { sendScreenMessage } from './screenEventHelpers';
import {
    getSlideListOnScreenSetting, ScreenMessageType, SlideItemDataType,
    SlideListType,
} from './screenHelpers';
import ScreenManager from './ScreenManager';
// TODO: cyclic dependency ScreenManager<->ScreenSlideManager
import ScreenManagerInf from './ScreenManagerInf';
import ScreenTransitionEffect
    from './transition-effect/ScreenTransitionEffect';
import { TargetType } from './transition-effect/transitionEffectHelpers';
import { screenManagerSettingNames } from '../helper/constants';

export type ScreenSlideManagerEventType = 'update';

const PDF_FULL_WIDTH_SETTING_NAME = 'pdf-full-width';

export function checkIsPDFFullWidth() {
    const originalSettingName = getSetting(PDF_FULL_WIDTH_SETTING_NAME);
    return originalSettingName === 'true';
}
export function setIsPDFFullWidth(b: boolean) {
    setSetting(PDF_FULL_WIDTH_SETTING_NAME, `${b}`);
}

export default class ScreenSlideManager extends
    EventHandler<ScreenSlideManagerEventType>
    implements ScreenManagerInf {

    static readonly eventNamePrefix: string = 'screen-slide-m';
    readonly screenId: number;
    private _slideItemData: SlideItemDataType | null = null;
    private _div: HTMLDivElement | null = null;
    ptEffectTarget: TargetType = 'slide';
    constructor(screenId: number) {
        super();
        this.screenId = screenId;
        if (appProviderScreen.isPagePresenter) {
            const allSlideList = getSlideListOnScreenSetting();
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
        return ScreenTransitionEffect.getInstance(
            this.screenId, this.ptEffectTarget);
    }
    get screenManager() {
        return ScreenManager.getInstance(this.screenId);
    }
    get key() {
        return this.screenId.toString();
    }
    get slideItemData() {
        return this._slideItemData;
    }
    static get isPDFFullWidth() {
        return checkIsPDFFullWidth();
    }
    static set isPDFFullWidth(isFullWidth: boolean) {
        setIsPDFFullWidth(isFullWidth);
    }
    set slideItemData(slideItemData: SlideItemDataType | null) {
        this._slideItemData = slideItemData;
        this.render();
        const allSlideList = getSlideListOnScreenSetting();
        if (slideItemData === null) {
            delete allSlideList[this.key];
        } else {
            allSlideList[this.key] = slideItemData;
        }
        ScreenSlideManager.setSlideList(allSlideList);
        this.sendSyncScreen();
        this.fireUpdate();
    }
    sendSyncScreen() {
        sendScreenMessage({
            screenId: this.screenId,
            type: 'slide',
            data: this.slideItemData,
        });
    }
    static receiveSyncScreen(message: ScreenMessageType) {
        const { data, screenId } = message;
        const screenManager = ScreenManager.getInstance(screenId);
        if (screenManager === null) {
            return;
        }
        screenManager.screenSlideManager.slideItemData = data;
    }
    fireUpdate() {
        this.addPropEvent('update');
        ScreenSlideManager.fireUpdate();
    }
    static fireUpdate() {
        this.addPropEvent('update');
    }
    static setSlideList(slideList: SlideListType) {
        const str = JSON.stringify(slideList);
        setSetting(screenManagerSettingNames.SLIDE, str);
    }
    static getDataList(slideFilePath?: string, slideItemId?: number) {
        const dataList = getSlideListOnScreenSetting();
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
        const chosenScreenManagers = (
            await ScreenManager.contextChooseInstances(event)
        );
        chosenScreenManagers.forEach((screenManager) => {
            const { screenSlideManager } = screenManager;
            const { slideItemData } = screenSlideManager;
            const willSelected = `${slideFilePath}:${slideItemJson.id}`;
            const slideItemId = slideItemData?.slideItemJson.id;
            const selected = `${slideItemData?.slideFilePath}:${slideItemId}`;
            if (selected !== willSelected) {
                screenSlideManager.slideItemData = {
                    slideFilePath,
                    slideItemJson,
                };
                screenManager.screenFTManager.delete();
            } else {
                screenSlideManager.slideItemData = null;
            }
        });
    }
    renderPdf(pdfImageData: PdfImageDataType) {
        const { screenManager } = this;
        if (screenManager === null || this.div === null) {
            return;
        }
        Array.from(this.div.children).forEach((child) => {
            child.remove();
        });
        const isFullWidth = checkIsPDFFullWidth();
        const { src: pdfImageSrc } = pdfImageData;
        const content = genPdfSlideItem(pdfImageSrc, isFullWidth);
        const divContainer = document.createElement('div');
        Object.assign(divContainer.style, {
            width: '100%',
            height: '100%',
            overflow: isFullWidth ? 'auto' : 'hidden',
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
        if (this.screenManager !== null && slideItemData !== null) {
            if (slideItemData.slideItemJson.pdfImageData) {
                this.renderPdf(slideItemData.slideItemJson.pdfImageData);
                return;
            }
            const { slideItemJson } = slideItemData;
            const content = genHtmlSlideItem(slideItemJson.canvasItems);
            const divHaftScale = document.createElement('div');
            divHaftScale.appendChild(content);
            const parentWidth = this.screenManager.width;
            const parentHeight = this.screenManager.height;
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
                if (appProviderScreen.isScreen) {
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
        const { screenManager } = this;
        if (screenManager === null) {
            return {};
        }
        return {
            position: 'absolute',
            width: `${screenManager.width}px`,
            height: `${screenManager.height}px`,
            overflow: 'hidden',
        };
    }
    async receiveScreenDrag(droppedData: DroppedDataType) {
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
