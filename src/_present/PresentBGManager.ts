import { CSSProperties } from 'react';

import EventHandler from '../event/EventHandler';
import { DragTypeEnum, DroppedDataType } from '../helper/DragInf';
import {
    getImageDim, getVideoDim, isValidJsonString,
} from '../helper/helpers';
import { getSetting, setSetting } from '../helper/settingHelper';
import appProviderPresent from './appProviderPresent';
import { genHtmlBG } from './PresentBackground';
import { sendPresentMessage } from './presentEventHelpers';
import { PresentMessageType } from './presentHelpers';
import PresentManager from './PresentManager';
import PresentManagerInf from './PresentManagerInf';
import PresentTransitionEffect
    from './transition-effect/PresentTransitionEffect';
import { TargetType } from './transition-effect/transitionEffectHelpers';
import { handleError } from '../helper/errorHelpers';

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
export default class PresentBGManager
    extends EventHandler<PresentBGManagerEventType>
    implements PresentManagerInf {
    static readonly eventNamePrefix: string = 'present-bg-m';
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
        if (presentManager === null) {
            return;
        }
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
        if (isValidJsonString(str, true)) {
            const json = JSON.parse(str);
            const items = Object.values(json);
            if (items.every((item: any) => {
                return item.type && item.src;
            })) {
                return json;
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
    static async bgSrcSelect(src: string | null,
        event: React.MouseEvent<HTMLElement, MouseEvent>,
        bgType: BackgroundType) {
        if (src !== null) {
            const selectedBGSrcList = this.getSelectBGSrcList(src, bgType);
            if (selectedBGSrcList.length > 0) {
                selectedBGSrcList.forEach(([key]) => {
                    const presentManager = PresentManager.getInstanceByKey(key);
                    if (presentManager === null) {
                        return;
                    }
                    presentManager.presentBGManager.bgSrc = null;
                });
                return;
            }
        }
        const chosenPresentManagers = await PresentManager
            .contextChooseInstances(event);
        const setSrc = async (presentManager: PresentManager) => {
            const bgSrc = src ? await this.initBGSrcDim(src, bgType) : null;
            presentManager.presentBGManager.bgSrc = bgSrc;
        };
        chosenPresentManagers.forEach((presentManager) => {
            setSrc(presentManager);
        });
        this.fireUpdateEvent();
    }
    static async extractDim(bgSrc: BackgroundSrcType)
        : Promise<[number | undefined, number | undefined]> {
        if (bgSrc.type === 'image') {
            try {
                return await getImageDim(bgSrc.src);
            } catch (error) {
                handleError(error);
            }
        } else if (bgSrc.type === 'video') {
            try {
                return await getVideoDim(bgSrc.src);
            } catch (error) {
                handleError(error);
            }
        }
        return [undefined, undefined];
    }
    render() {
        if (this.div === null) {
            return;
        }
        const aminData = this.ptEffect.styleAnim;
        if (this.presentManager !== null && this.bgSrc !== null) {
            const newDiv = genHtmlBG(this.bgSrc, this.presentManager);
            const childList = Array.from(this.div.children);
            this.div.appendChild(newDiv);
            aminData.animIn(newDiv).then(() => {
                childList.forEach((child) => {
                    child.remove();
                });
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
            pointerEvents: 'none',
            position: 'absolute',
            width: `${presentManager.width}px`,
            height: `${presentManager.height}px`,
            overflow: 'hidden',
        };
    }
    async receivePresentDrag({ type, item }: DroppedDataType) {
        const bgTypeMap: { [key: string]: BackgroundType } = {
            [DragTypeEnum.BG_IMAGE]: 'image',
            [DragTypeEnum.BG_VIDEO]: 'video',
        };
        if (type in bgTypeMap) {
            const bgSrc = await PresentBGManager.initBGSrcDim(
                item.src, bgTypeMap[type]);
            this.bgSrc = bgSrc;
        } else if (type === DragTypeEnum.BG_COLOR) {
            this.bgSrc = {
                type: 'color',
                src: item,
            };
        }
    }
    delete() {
        this.bgSrc = null;
    }
}
