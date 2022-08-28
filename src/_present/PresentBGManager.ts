import EventHandler from '../event/EventHandler';
import { AnyObjectType, getImageDim, getVideoDim } from '../helper/helpers';
import { getSetting, setSetting } from '../helper/settingHelper';
import appProviderPresent from './appProviderPresent';
import { genHtmlBG } from './PresentBackground';
import { sendPresentMessage } from './presentEventHelpers';
import { PresentMessageType } from './presentHelpers';
import PresentManager from './PresentManager';
import PresentManagerInf from './PresentManagerInf';
import PresentTransitionEffect from './transition-effect/PresentTransitionEffect';
import { TargetType } from './transition-effect/transitionEffectHelpers';

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
export default class PresentBGManager extends EventHandler<PresentBGManagerEventType>
    implements PresentManagerInf {
    static eventNamePrefix: string = 'present-bg-m';
    readonly presentId: number;
    private _bgSrc: BackgroundSrcType | null = null;
    private _div: HTMLDivElement | null = null;
    ptEffectTarget: TargetType = 'background';
    constructor(presentId: number) {
        super();
        this.presentId = presentId;
        if (appProviderPresent.isMain) {
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
        return PresentTransitionEffect.getInstance(
            this.presentId, this.ptEffectTarget);
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
        this.sendSyncPresent();
        this.fireUpdate();
    }
    sendSyncPresent() {
        sendPresentMessage({
            presentId: this.presentId,
            type: 'background',
            data: this.bgSrc,
        });
    }
    static receiveSyncPresent(message: PresentMessageType) {
        const { data, presentId } = message;
        const presentManager = PresentManager.getInstance(presentId);
        presentManager.presentBGManager.bgSrc = data;
    }
    fireUpdate() {
        this.addPropEvent('update');
        PresentBGManager.fireUpdateEvent();
    }
    static fireUpdateEvent() {
        this.addPropEvent('update');
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
        const bgSrcList = this.getBGSrcList();
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
    static async initBGSrcDim(src: string, bgType: BackgroundType) {
        const bgSrc: BackgroundSrcType = {
            type: bgType,
            src,
        };
        const [width, height] = await this.extractDim(bgSrc);
        if (width !== undefined && height !== undefined) {
            bgSrc.width = width;
            bgSrc.height = height;
        }
        return bgSrc;
    }
    static async bgSrcSelect(src: string,
        event: React.MouseEvent<HTMLElement, MouseEvent>,
        bgType: BackgroundType) {
        const selectedBGSrcList = this.getSelectBGSrcList(src, bgType);
        if (selectedBGSrcList.length > 0) {
            selectedBGSrcList.forEach(([key]) => {
                PresentManager.getInstanceByKey(key)
                    .presentBGManager.bgSrc = null;
            });
            return;
        }
        const chosenPresentManagers = await PresentManager.contextChooseInstances(event);
        chosenPresentManagers.forEach(async (presentManager) => {
            const bgSrc = await this.initBGSrcDim(src, bgType);
            presentManager.presentBGManager.bgSrc = bgSrc;
        });
        this.fireUpdateEvent();
    }
    static async extractDim(bgSrc: BackgroundSrcType)
        : Promise<[number | undefined, number | undefined]> {
        if (bgSrc.type === 'image') {
            try {
                return await getImageDim(bgSrc.src);
            } catch (error) {
                appProviderPresent.appUtils.handleError(error);
            }
        } else if (bgSrc.type === 'video') {
            try {
                return await getVideoDim(bgSrc.src);
            } catch (error) {
                appProviderPresent.appUtils.handleError(error);
            }
        }
        return [undefined, undefined];
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
    get containerStyle(): React.CSSProperties {
        return {
            pointerEvents: 'none',
            position: 'absolute',
            width: `${this.presentManager.width}px`,
            height: `${this.presentManager.height}px`,
            overflow: 'hidden',
        };
    }
    static startPresentDrag(event: React.DragEvent<HTMLDivElement>,
        src: string, type: string) {
        const data = {
            present: {
                target: 'background',
                type,
                src,
            },
        };
        event.dataTransfer.setData('text/plain',
            JSON.stringify(data));
    }
    async receivePresentDrag(presentData: AnyObjectType) {
        if (['image', 'video'].includes(presentData.type)
            && presentData.src !== '') {
            const bgSrc = await PresentBGManager.initBGSrcDim(
                presentData.src, presentData.type);
            this.bgSrc = bgSrc;
        }
    }
    delete() {
        this.bgSrc = null;
    }
}
