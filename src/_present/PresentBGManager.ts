import EventHandler from '../event/EventHandler';
import { getImageDim, getVideoDim } from '../helper/helpers';
import { getSetting, setSetting } from '../helper/settingHelper';
import appProvider from './appProvider';
import { genHtmlBG } from './PresentBackground';
import { sendPresentMessage } from './presentHelpers';
import PresentManager from './PresentManager';
import PresentTransitionEffect from './transition-effect/PresentTransitionEffect';

const backgroundTypeList = ['color', 'image', 'video'] as const;
export type BackgroundType = typeof backgroundTypeList[number];
export type BackgroundSrcType = {
    type: BackgroundType;
    src: string;
    width?: number;
    height?: number;
};
export type BGSrcListType = {
    [key: string]: BackgroundSrcType;
};

export type PresentBGManagerEventType = 'update';

const settingName = 'present-bg-';
export default class PresentBGManager extends EventHandler<PresentBGManagerEventType> {
    static eventNamePrefix: string = 'present-bg-m';
    readonly presentId: number;
    _bgSrc: BackgroundSrcType | null = null;
    _div: HTMLDivElement | null = null;
    constructor(presentId: number) {
        super();
        this.presentId = presentId;
        if (appProvider.isMain) {
            const allBGSrcList = PresentBGManager.getBGSrcList();
            this._bgSrc = allBGSrcList[this.key] || null;
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
        return PresentTransitionEffect.getInstance('background');
    }
    get presentManager() {
        return PresentManager.getInstance(this.presentId);
    }
    get key() {
        return this.presentId.toString();
    }
    get bgSrc() {
        return this._bgSrc;
    }
    set bgSrc(bgSrc: BackgroundSrcType | null) {
        this._bgSrc = bgSrc;
        this.render();
        const allBGSrcList = PresentBGManager.getBGSrcList();
        if (bgSrc === null) {
            delete allBGSrcList[this.key];
        } else {
            allBGSrcList[this.key] = bgSrc;
        }
        PresentBGManager.setBGSrcList(allBGSrcList);
        this.syncPresent();
        this.fireUpdate();
    }
    syncPresent() {
        sendPresentMessage({
            presentId: this.presentId,
            type: 'background',
            data: this.bgSrc,
        });
    }
    fireUpdate() {
        this.addPropEvent('update');
        PresentManager.getInstance(this.presentId).fireUpdateEvent();
        PresentBGManager.fireUpdateEvent();
    }
    static fireUpdateEvent() {
        this.addPropEvent('update');
        PresentManager.fireUpdateEvent();
    }
    static getBGSrcList(): BGSrcListType {
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
    static setBGSrcList(bgSrcList: BGSrcListType) {
        const str = JSON.stringify(bgSrcList);
        setSetting(settingName, str);
    }
    static getBGSrcListByType(bgType: BackgroundType) {
        const bgSrcList = PresentBGManager.getBGSrcList();
        return Object.entries(bgSrcList).filter(([_, bgSrc]) => {
            return bgSrc.type === bgType;
        });
    }
    static getSelectBGSrcList(src: string, bgType: BackgroundType) {
        const keyBGSrcList = this.getBGSrcListByType(bgType);
        return keyBGSrcList.filter(([_, bgSrc]) => {
            return bgSrc.src === src;
        });
    }
    static async bgSrcSelect(src: string,
        e: React.MouseEvent<HTMLElement, MouseEvent>,
        bgType: BackgroundType) {
        const selectedBGSrcList = this.getSelectBGSrcList(src, bgType);
        if (selectedBGSrcList.length > 0) {
            selectedBGSrcList.forEach(([key]) => {
                PresentManager.getInstanceByKey(key)
                    .presentBGManager.bgSrc = null;
            });
            return;
        }
        const chosenPresentManagers = await PresentManager.contextChooseInstances(e);
        chosenPresentManagers.forEach(async (presentManager) => {
            const bgSrc: BackgroundSrcType = {
                type: bgType,
                src,
            };
            const [width, height] = await PresentBGManager.extractDim(bgSrc);
            if (width !== undefined && height !== undefined) {
                bgSrc.width = width;
                bgSrc.height = height;
            }
            presentManager.presentBGManager.bgSrc = bgSrc;
        });
        PresentBGManager.fireUpdateEvent();
    }
    static async extractDim(bgSrc: BackgroundSrcType)
        : Promise<[number | undefined, number | undefined]> {
        if (bgSrc.type === 'image') {
            try {
                return await getImageDim(bgSrc.src);
            } catch (error) {
                console.log(error);
            }
        } else if (bgSrc.type === 'video') {
            try {
                return await getVideoDim(bgSrc.src);
            } catch (error) {
                console.log(error);
            }
        }
        return [undefined, undefined];
    }
    calMediaSizes(bgSrc: BackgroundSrcType) {
        const { width, height } = bgSrc;
        if (width === undefined || height === undefined) {
            return {
                width: this.presentManager.width,
                height: this.presentManager.height,
                offsetH: 0,
                offsetV: 0,
            };
        }
        const parentWidth = this.presentManager.width;
        const parentHeight = this.presentManager.height;
        const scale = Math.max(parentWidth / width,
            parentHeight / height);
        const newWidth = width * scale;
        const newHeight = height * scale;
        const offsetH = (newWidth - parentWidth) / 2;
        const offsetV = (newHeight - parentHeight) / 2;
        return {
            width: newWidth,
            height: newHeight,
            offsetH,
            offsetV,
        };
    }
    render() {
        if (this.div === null) {
            return;
        }
        const aminData = this.ptEffect.styleAnim;
        if (this.bgSrc !== null) {
            const newDiv = genHtmlBG(this.bgSrc, this.presentManager);
            const childList = Array.from(this.div.children);
            this.div.appendChild(newDiv);
            aminData.animIn(newDiv).then(() => {
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
    get backgroundStyle(): React.CSSProperties {
        return {
            pointerEvents: 'none',
            position: 'absolute',
            width: `${this.presentManager.width}px`,
            height: `${this.presentManager.height}px`,
            overflow: 'hidden',
        };
    }
}
