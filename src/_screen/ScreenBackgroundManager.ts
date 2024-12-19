import { CSSProperties } from 'react';

import EventHandler from '../event/EventHandler';
import { DragTypeEnum, DroppedDataType } from '../helper/DragInf';
import {
    getImageDim, getVideoDim,
} from '../helper/helpers';
import { setSetting } from '../helper/settingHelpers';
import appProviderScreen from './appProviderScreen';
import { genHtmlBackground } from './ScreenBackground';
import { sendScreenMessage } from './screenEventHelpers';
import {
    BackgroundSrcType, BackgroundType, getBackgroundSrcListOnScreenSetting,
    ScreenMessageType,
} from './screenHelpers';
import ScreenManager from './ScreenManager';
import ScreenManagerInf from './ScreenManagerInf';
import ScreenTransitionEffect
    from './transition-effect/ScreenTransitionEffect';
import { TargetType } from './transition-effect/transitionEffectHelpers';
import { handleError } from '../helper/errorHelpers';
import { screenManagerSettingNames } from '../helper/constants';
import { chooseScreenManagerInstances } from './screenManagerHelpers';
import { unlocking } from '../server/appHelpers';

export type ScreenBackgroundManagerEventType = 'update';

export default class ScreenBackgroundManager
    extends EventHandler<ScreenBackgroundManagerEventType>
    implements ScreenManagerInf {

    static readonly eventNamePrefix: string = 'screen-bg-m';
    readonly screenId: number;
    private _backgroundSrc: BackgroundSrcType | null = null;
    private _div: HTMLDivElement | null = null;
    ptEffectTarget: TargetType = 'background';
    constructor(screenId: number) {
        super();
        this.screenId = screenId;
        if (appProviderScreen.isPagePresenter) {
            const allBackgroundSrcList = getBackgroundSrcListOnScreenSetting();
            this._backgroundSrc = allBackgroundSrcList[this.key] || null;
        }
    }
    get isShowing() {
        return this.backgroundSrc !== null;
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
    get backgroundSrc() {
        return this._backgroundSrc;
    }
    set backgroundSrc(backgroundSrc: BackgroundSrcType | null) {
        this._backgroundSrc = backgroundSrc;
        this.render();
        unlocking(screenManagerSettingNames.BACKGROUND, () => {
            const allBackgroundSrcList = getBackgroundSrcListOnScreenSetting();
            if (backgroundSrc === null) {
                delete allBackgroundSrcList[this.key];
            } else {
                allBackgroundSrcList[this.key] = backgroundSrc;
            }
            const str = JSON.stringify(allBackgroundSrcList);
            setSetting(screenManagerSettingNames.BACKGROUND, str);
        });
        this.sendSyncScreen();
        this.fireUpdate();
    }
    sendSyncScreen() {
        sendScreenMessage({
            screenId: this.screenId,
            type: 'background',
            data: this.backgroundSrc,
        });
    }
    static receiveSyncScreen(message: ScreenMessageType) {
        const { data, screenId } = message;
        const screenManager = ScreenManager.getInstance(screenId);
        if (screenManager === null) {
            return;
        }
        screenManager.screenBackgroundManager.backgroundSrc = data;
    }

    fireUpdate() {
        this.addPropEvent('update');
        ScreenBackgroundManager.fireUpdateEvent();
    }

    static fireUpdateEvent() {
        this.addPropEvent('update');
    }

    static getBackgroundSrcListByType(backgroundType: BackgroundType) {
        const backgroundSrcList = getBackgroundSrcListOnScreenSetting();
        return Object.entries(backgroundSrcList).filter(
            ([_, backgroundSrc]) => {
                return backgroundSrc.type === backgroundType;
            },
        );
    }

    static getSelectBackgroundSrcList(
        src: string, backgroundType: BackgroundType,
    ) {
        const keyBackgroundSrcList = this.getBackgroundSrcListByType(
            backgroundType,
        );
        return keyBackgroundSrcList.filter(([_, backgroundSrc]) => {
            return backgroundSrc.src === src;
        });
    }
    static async initBackgroundSrcDim(
        src: string, backgroundType: BackgroundType,
    ) {
        const backgroundSrc: BackgroundSrcType = {
            type: backgroundType,
            src,
        };
        const [width, height] = await this.extractDim(backgroundSrc);
        if (width !== undefined && height !== undefined) {
            backgroundSrc.width = width;
            backgroundSrc.height = height;
        }
        return backgroundSrc;
    }
    applyBackgroundSrcWithSyncGroup(backGroundSrc: BackgroundSrcType | null) {
        const screenManager = this.screenManager;
        if (screenManager !== null) {
            screenManager.isNoSyncGroup = false;
        }
        this.backgroundSrc = backGroundSrc;
    }
    static async backgroundSrcSelect(
        src: string | null, event: React.MouseEvent<HTMLElement, MouseEvent>,
        backgroundType: BackgroundType,
    ) {
        if (src !== null) {
            const selectedBackgroundSrcList = this.getSelectBackgroundSrcList(
                src, backgroundType,
            );
            if (selectedBackgroundSrcList.length > 0) {
                selectedBackgroundSrcList.forEach(([key]) => {
                    const screenManager = ScreenManager.getInstanceByKey(key);
                    if (screenManager === null) {
                        return;
                    }
                    const { screenBackgroundManager } = screenManager;
                    screenBackgroundManager.applyBackgroundSrcWithSyncGroup(
                        null,
                    );
                });
                return;
            }
        }
        const chosenScreenManagers = await chooseScreenManagerInstances(event);
        const setSrc = async (screenManager: ScreenManager) => {
            const backgroundSrc = (
                src ? await this.initBackgroundSrcDim(src, backgroundType) :
                    null
            );
            const { screenBackgroundManager } = screenManager;
            screenBackgroundManager.applyBackgroundSrcWithSyncGroup(
                backgroundSrc,
            );
        };
        chosenScreenManagers.forEach((screenManager) => {
            setSrc(screenManager);
        });
        this.fireUpdateEvent();
    }
    static async extractDim(backgroundSrc: BackgroundSrcType)
        : Promise<[number | undefined, number | undefined]> {
        if (backgroundSrc.type === 'image') {
            try {
                return await getImageDim(backgroundSrc.src);
            } catch (error) {
                handleError(error);
            }
        } else if (backgroundSrc.type === 'video') {
            try {
                return await getVideoDim(backgroundSrc.src);
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
        if (this.screenManager !== null && this.backgroundSrc !== null) {
            const newDiv = genHtmlBackground(
                this.backgroundSrc, this.screenManager,
            );
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
        const backgroundTypeMap: { [key: string]: BackgroundType } = {
            [DragTypeEnum.BACKGROUND_IMAGE]: 'image',
            [DragTypeEnum.BACKGROUND_VIDEO]: 'video',
        };
        if (type in backgroundTypeMap) {
            const backgroundSrc = (
                await ScreenBackgroundManager.initBackgroundSrcDim(
                    item.src, backgroundTypeMap[type],
                )
            );
            this.backgroundSrc = backgroundSrc;
        } else if (type === DragTypeEnum.BACKGROUND_COLOR) {
            this.backgroundSrc = {
                type: 'color',
                src: item,
            };
        }
    }
    clear() {
        this.backgroundSrc = null;
    }
}
