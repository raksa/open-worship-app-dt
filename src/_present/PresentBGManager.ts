import EventHandler from '../event/EventHandler';
import { getImageDim, getVideoDim } from '../helper/helpers';
import { getSetting, setSetting } from '../helper/settingHelper';
import appProvider from './appProvider';
import { genHtmlBG } from './PresentBackground';
import { sendPresentMessage } from './presentHelpers';
import PresentManager from './PresentManager';
import PresentTransitionEffect from './PresentTransitionEffect';

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
                const parentWidth = presentManager.width;
                const parentHeight = presentManager.height;
                const scale = Math.max(parentWidth / width,
                    parentHeight / height);
                bgSrc.width = width * scale;
                bgSrc.height = height * scale;
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
        if (bgSrc.width === undefined
            || bgSrc.height === undefined) {
            return {
                width: this.presentManager.width,
                height: this.presentManager.height,
                offsetH: 0,
                offsetV: 0,
            };
        }
        const offsetH = (bgSrc.width - this.presentManager.width) / 2;
        const offsetV = (bgSrc.height - this.presentManager.height) / 2;
        return {
            width: bgSrc.width,
            height: bgSrc.height,
            offsetH,
            offsetV,
        };
    }
    render() {
        if (this.div === null) {
            return;
        }
        if (this.bgSrc === null) {
            const lastChild = this.div.lastChild;
            if (lastChild !== null) {
                Object.assign((lastChild as HTMLDivElement).style,
                    this.ptEffect.cssPropsOut);
                setTimeout(() => {
                    lastChild.remove();
                }, this.ptEffect.duration);
            }
        } else {
            const div = genHtmlBG(this.bgSrc, this.presentManager);
            this.div.appendChild(div);
            setTimeout(() => {
                const childCount = this.div?.childElementCount || 0;
                if (childCount > 1) {
                    this.div?.firstChild?.remove();
                }
            }, this.ptEffect.duration);
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
