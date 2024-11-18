import { CSSProperties } from 'react';

import EventHandler from '../event/EventHandler';
import { DragTypeEnum, DroppedDataType } from '../helper/DragInf';
import {
    getImageDim, getVideoDim,
} from '../helper/helpers';
import { setSetting } from '../helper/settingHelper';
import appProviderScreen from './appProviderScreen';
import { genHtmlBG } from './ScreenBackground';
import { sendScreenMessage } from './screenEventHelpers';
import {
    BackgroundSrcType, BackgroundType, BGSrcListType,
    getBGSrcListOnScreenSetting, ScreenMessageType,
} from './screenHelpers';
import ScreenManager from './ScreenManager';
import ScreenManagerInf from './ScreenManagerInf';
import ScreenTransitionEffect
    from './transition-effect/ScreenTransitionEffect';
import { TargetType } from './transition-effect/transitionEffectHelpers';
import { handleError } from '../helper/errorHelpers';
import { screenManagerSettingNames } from '../helper/constants';

export type ScreenBGManagerEventType = 'update';

export default class ScreenBGManager
    extends EventHandler<ScreenBGManagerEventType>
    implements ScreenManagerInf {

    static readonly eventNamePrefix: string = 'screen-bg-m';
    readonly screenId: number;
    private _bgSrc: BackgroundSrcType | null = null;
    private _div: HTMLDivElement | null = null;
    ptEffectTarget: TargetType = 'background';
    constructor(screenId: number) {
        super();
        this.screenId = screenId;
        if (appProviderScreen.isMain) {
            const allBGSrcList = getBGSrcListOnScreenSetting();
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
        return ScreenTransitionEffect.getInstance(
            this.screenId, this.ptEffectTarget);
    }
    get screenManager() {
        return ScreenManager.getInstance(this.screenId);
    }
    get key() {
        return this.screenId.toString();
    }
    get bgSrc() {
        return this._bgSrc;
    }
    set bgSrc(bgSrc: BackgroundSrcType | null) {
        this._bgSrc = bgSrc;
        this.render();
        const allBGSrcList = getBGSrcListOnScreenSetting();
        if (bgSrc === null) {
            delete allBGSrcList[this.key];
        } else {
            allBGSrcList[this.key] = bgSrc;
        }
        ScreenBGManager.setBGSrcList(allBGSrcList);
        this.sendSyncScreen();
        this.fireUpdate();
    }
    sendSyncScreen() {
        sendScreenMessage({
            screenId: this.screenId,
            type: 'background',
            data: this.bgSrc,
        });
    }
    static receiveSyncScreen(message: ScreenMessageType) {
        const { data, screenId } = message;
        const screenManager = ScreenManager.getInstance(screenId);
        if (screenManager === null) {
            return;
        }
        screenManager.screenBGManager.bgSrc = data;
    }
    fireUpdate() {
        this.addPropEvent('update');
        ScreenBGManager.fireUpdateEvent();
    }
    static fireUpdateEvent() {
        this.addPropEvent('update');
    }
    static setBGSrcList(bgSrcList: BGSrcListType) {
        const str = JSON.stringify(bgSrcList);
        setSetting(screenManagerSettingNames.BG, str);
    }
    static getBGSrcListByType(bgType: BackgroundType) {
        const bgSrcList = getBGSrcListOnScreenSetting();
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
                    const screenManager = ScreenManager.getInstanceByKey(key);
                    if (screenManager === null) {
                        return;
                    }
                    screenManager.screenBGManager.bgSrc = null;
                });
                return;
            }
        }
        const chosenScreenManagers = (
            await ScreenManager.contextChooseInstances(event)
        );
        const setSrc = async (screenManager: ScreenManager) => {
            const bgSrc = src ? await this.initBGSrcDim(src, bgType) : null;
            screenManager.screenBGManager.bgSrc = bgSrc;
        };
        chosenScreenManagers.forEach((screenManager) => {
            setSrc(screenManager);
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
        if (this.screenManager !== null && this.bgSrc !== null) {
            const newDiv = genHtmlBG(this.bgSrc, this.screenManager);
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
        const { screenManager } = this;
        if (screenManager === null) {
            return {};
        }
        return {
            pointerEvents: 'none',
            position: 'absolute',
            width: `${screenManager.width}px`,
            height: `${screenManager.height}px`,
            overflow: 'hidden',
        };
    }
    async receiveScreenDrag({ type, item }: DroppedDataType) {
        const bgTypeMap: { [key: string]: BackgroundType } = {
            [DragTypeEnum.BG_IMAGE]: 'image',
            [DragTypeEnum.BG_VIDEO]: 'video',
        };
        if (type in bgTypeMap) {
            const bgSrc = await ScreenBGManager.initBGSrcDim(
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
