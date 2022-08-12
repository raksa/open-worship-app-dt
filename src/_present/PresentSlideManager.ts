import EventHandler from '../event/EventHandler';
import { getSetting, setSetting } from '../helper/settingHelper';
import { SlideItemType } from '../slide-list/SlideItem';
import { genHtmlSlideItem } from '../slide-presenting/items/SlideItemRenderer';
import appProviderPresent from './appProviderPresent';
import { sendPresentMessage } from './presentHelpers';
import PresentManager from './PresentManager';
import PresentTransitionEffect from './transition-effect/PresentTransitionEffect';

export type SlideListType = {
    [key: string]: SlideItemType;
};

export type PresentSlideManagerEventType = 'update';

const settingName = 'present-slide-';
export default class PresentSlideManager extends EventHandler<PresentSlideManagerEventType> {
    static eventNamePrefix: string = 'present-slide-m';
    readonly presentId: number;
    private _slideItemJson: SlideItemType | null = null;
    private _div: HTMLDivElement | null = null;
    constructor(presentId: number) {
        super();
        this.presentId = presentId;
        if (appProviderPresent.isMain) {
            const allSlideList = PresentSlideManager.getSlideList();
            this._slideItemJson = allSlideList[this.key] || null;
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
        return PresentTransitionEffect.getInstance('slide');
    }
    get presentManager() {
        return PresentManager.getInstance(this.presentId);
    }
    get key() {
        return this.presentId.toString();
    }
    get slideItemJson() {
        return this._slideItemJson;
    }
    set slideItemJson(slide: SlideItemType | null) {
        this._slideItemJson = slide;
        this.render();
        const allSlideList = PresentSlideManager.getSlideList();
        if (slide === null) {
            delete allSlideList[this.key];
        } else {
            allSlideList[this.key] = slide;
        }
        PresentSlideManager.setSlideList(allSlideList);
        this.syncPresent();
        this.fireUpdate();
    }
    syncPresent() {
        sendPresentMessage({
            presentId: this.presentId,
            type: 'slide',
            data: this.slideItemJson,
        });
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
                return JSON.parse(str);
            } catch (error) {
                console.error(error);
            }
        }
        return {};
    }
    static setSlideList(slideList: SlideListType) {
        const str = JSON.stringify(slideList);
        setSetting(settingName, str);
    }
    static async slideSelect(slideItemJson: SlideItemType,
        e: React.MouseEvent<HTMLElement, MouseEvent>) {
        const chosenPresentManagers = await PresentManager.contextChooseInstances(e);
        chosenPresentManagers.forEach((presentManager) => {
            if (presentManager.presentSlideManager.slideItemJson?.id !== slideItemJson.id) {
                presentManager.presentSlideManager.slideItemJson = slideItemJson;
            } else {
                presentManager.presentSlideManager.slideItemJson = null;
            }
        });
        PresentSlideManager.fireUpdateEvent();
    }
    render() {
        if (this.div === null) {
            return;
        }
        const aminData = this.ptEffect.styleAnim;
        if (this.slideItemJson !== null) {
            const newDiv = genHtmlSlideItem(this.slideItemJson.canvasItems);
            const divHaftScale = document.createElement('div');
            divHaftScale.appendChild(newDiv);
            const parentWidth = this.presentManager.width;
            const parentHeight = this.presentManager.height;
            const width = this.slideItemJson.metadata.width;
            const height = this.slideItemJson.metadata.height;
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
}
