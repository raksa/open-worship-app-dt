import EventHandler from '../event/EventHandler';
import { getSetting, setSetting } from '../helper/settingHelper';
import SlideItem, { SlideItemType } from '../slide-list/SlideItem';
import { genHtmlSlideItem } from '../slide-presenting/items/SlideItemRenderer';
import appProviderPresent from './appProviderPresent';
import { PresentMessageType, sendPresentMessage } from './presentHelpers';
import PresentManager from './PresentManager';
import PresentTransitionEffect from './transition-effect/PresentTransitionEffect';
import { TargetType } from './transition-effect/transitionEffectHelpers';

export type SlideItemDataType = {
    slideFilePath: string;
    slideItemJson: SlideItemType
};
export type SlideListType = {
    [key: string]: SlideItemDataType;
};

export type PresentSlideManagerEventType = 'update';

const settingName = 'present-slide-';
export default class PresentSlideManager extends EventHandler<PresentSlideManagerEventType> {
    static eventNamePrefix: string = 'present-slide-m';
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
        presentManager.presentSlideManager.slideItemData = data;
    }
    fireUpdate() {
        this.addPropEvent('update');
        PresentManager.getInstance(this.presentId).fireUpdateEvent();
        PresentSlideManager.fireUpdateEvent();
    }
    static fireUpdateEvent() {
        this.addPropEvent('update');
        PresentManager.fireUpdateEvent();
    }
    static getSlideList(): SlideListType {
        const str = getSetting(settingName, '');
        if (str !== '') {
            try {
                const json = JSON.parse(str);
                Object.values(json).forEach((item: any) => {
                    if (typeof item.slideFilePath !== 'string') {
                        throw new Error('Invalid slide path');
                    }
                    SlideItem.validate(item.slideItemJson);
                });
                return json;
            } catch (error) {
                appProviderPresent.appUtils
                    .handleError(error);
            }
        }
        return {};
    }
    static setSlideList(slideList: SlideListType) {
        const str = JSON.stringify(slideList);
        setSetting(settingName, str);
    }
    static async slideSelect(slideFilePath: string,
        slideItemJson: SlideItemType,
        event: React.MouseEvent<HTMLElement, MouseEvent>) {
        const chosenPresentManagers = await PresentManager.contextChooseInstances(event);
        chosenPresentManagers.forEach((presentManager) => {
            const { presentSlideManager } = presentManager;
            const { slideItemData } = presentSlideManager;
            const willSelected = `${slideFilePath}:${slideItemJson.id}`;
            const selected = `${slideItemData?.slideFilePath}:${slideItemData?.slideItemJson.id}`;
            if (selected !== willSelected) {
                presentSlideManager.slideItemData = {
                    slideFilePath,
                    slideItemJson,
                };
            } else {
                presentSlideManager.slideItemData = null;
            }
        });
        PresentSlideManager.fireUpdateEvent();
    }
    render() {
        if (this.div === null) {
            return;
        }
        const aminData = this.ptEffect.styleAnim;
        const slideItemData = this.slideItemData;
        if (slideItemData !== null) {
            const { slideItemJson } = slideItemData;
            const newDiv = genHtmlSlideItem(slideItemJson.canvasItems);
            const divHaftScale = document.createElement('div');
            divHaftScale.appendChild(newDiv);
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
                    Array.from(newDiv.children).forEach((child) => {
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
        } else {
            if (this.div.lastChild !== null) {
                const targetDiv = this.div.lastChild as HTMLDivElement;
                aminData.animOut(targetDiv).then(() => {
                    targetDiv.remove();
                });
            }
        }
    }
    get containerStyle(): React.CSSProperties {
        return {
            pointerEvents: 'none',
            position: 'absolute',
            width: `${this.presentManager.width}px`,
            height: `${this.presentManager.height}px`,
            overflow: 'hidden',
        };
    }
}
