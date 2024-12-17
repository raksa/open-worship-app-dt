import { createContext, use } from 'react';

import EventHandler from '../event/EventHandler';
import { DragTypeEnum, DroppedDataType } from '../helper/DragInf';
import { getWindowDim } from '../helper/helpers';
import { log } from '../helper/loggerHelpers';
import { getSetting, setSetting } from '../helper/settingHelpers';
import { showAppContextMenu } from '../others/AppContextMenu';
import ScreenAlertManager from './ScreenAlertManager';
import ScreenBackgroundManager from './ScreenBackgroundManager';
import ScreenFullTextManager from './ScreenFullTextManager';
import {
    getAllDisplays, getAllShowingScreenIds, getScreenManagersInstanceSetting,
    hideScreen, ScreenMessageType, setDisplay, showScreen,
} from './screenHelpers';
import ScreenManagerInf from './ScreenManagerInf';
import ScreenSlideManager from './ScreenSlideManager';
import ScreenTransitionEffect from
    './transition-effect/ScreenTransitionEffect';
import { screenManagerSettingNames } from '../helper/constants';

export type ScreenManagerEventType = (
    'instance' | 'update' | 'visible' | 'display-id' | 'resize'
);
const settingName = 'screen-display-';

export const ScreenManagerContext = createContext<ScreenManager | null>(null);
export function useScreenManagerContext(): ScreenManager {
    const screenManager = use(ScreenManagerContext);
    if (screenManager === null) {
        throw new Error(
            'useScreenManager must be used within a ScreenManager ' +
            'Context Provider',
        );
    }
    return screenManager;
}

const cache = new Map<string, any>();
export default class ScreenManager
    extends EventHandler<ScreenManagerEventType>
    implements ScreenManagerInf {

    static readonly eventNamePrefix: string = 'screen-m';
    readonly screenBackgroundManager: ScreenBackgroundManager;
    readonly screenSlideManager: ScreenSlideManager;
    readonly screenFTManager: ScreenFullTextManager;
    readonly screenAlertManager: ScreenAlertManager;
    readonly screenId: number;
    width: number;
    height: number;
    name: string;
    private _isSelected: boolean = false;
    private _isShowing: boolean;

    constructor(screenId: number) {
        super();
        const dim = getWindowDim();
        this.width = dim.width;
        this.height = dim.height;
        this.screenId = screenId;
        this.name = `screen-${screenId}`;
        this.screenBackgroundManager = new ScreenBackgroundManager(screenId);
        this.screenSlideManager = new ScreenSlideManager(screenId);
        this.screenFTManager = new ScreenFullTextManager(screenId);
        this.screenAlertManager = new ScreenAlertManager(screenId);
        const ids = getAllShowingScreenIds();
        this._isShowing = ids.some((id) => id === screenId);
    }
    get key() {
        return this.screenId.toString();
    }
    static getDisplayById(displayId: number) {
        const { displays } = getAllDisplays();
        return displays.find((display) => {
            return display.id === displayId;
        })?.id || 0;
    }
    static getDisplayByScreenId(screenId: number) {
        const displayId = this.getDisplayIdByScreenId(screenId);
        const { displays } = getAllDisplays();
        return displays.find((display) => {
            return display.id === displayId;
        }) || this.getDefaultScreenDisplay();
    }
    static getDisplayIdByScreenId(screenId: number) {
        const defaultDisplay = ScreenManager.getDefaultScreenDisplay();
        const str = getSetting(`${settingName}-pid-${screenId}`,
            defaultDisplay.id.toString());
        if (isNaN(parseInt(str, 10))) {
            return defaultDisplay.id;
        }
        const id = parseInt(str, 10);
        const { displays } = getAllDisplays();
        return displays.find((display) => {
            return display.id === id;
        })?.id || defaultDisplay.id;
    }
    // TODO: implement multiple display support
    get displayId() {
        return ScreenManager.getDisplayIdByScreenId(this.screenId);
    }
    set displayId(id: number) {
        setSetting(`${settingName}-pid-${this.screenId}`, id.toString());
        if (this.isShowing) {
            setDisplay({
                screenId: this.screenId,
                displayId: id,
            });
        }
        const data = {
            screenId: this.screenId,
            displayId: id,
        };
        this.addPropEvent('display-id', data);
        ScreenManager.addPropEvent('display-id', data);
    }
    get isSelected() {
        return this._isSelected;
    }
    set isSelected(isSelected: boolean) {
        this._isSelected = isSelected;
        ScreenManager.saveScreenManagersSetting();
        this.fireInstanceEvent();
    }
    get isShowing() {
        return this._isShowing;
    }
    set isShowing(isShowing: boolean) {
        this._isShowing = isShowing;
        if (isShowing) {
            this.show();
        } else {
            this.hide();
        }
        this.fireVisibleEvent();
    }
    setSyncScreen() {
        ScreenTransitionEffect.sendSyncScreen();
        this.screenBackgroundManager.sendSyncScreen();
        this.screenSlideManager.sendSyncScreen();
        this.screenFTManager.sendSyncScreen();
        this.screenAlertManager.sendSyncScreen();
        ScreenFullTextManager.sendSynTextStyle();
    }
    show() {
        return showScreen({
            screenId: this.screenId,
            displayId: this.displayId,
        });
    }
    hide() {
        hideScreen(this.screenId);
    }
    static getDefaultScreenDisplay() {
        const { primaryDisplay, displays } = getAllDisplays();
        return displays.find((display) => {
            return display.id !== primaryDisplay.id;
        }) || primaryDisplay;
    }
    fireUpdateEvent() {
        this.addPropEvent('update');
        ScreenManager.fireUpdateEvent();
    }
    static fireUpdateEvent() {
        this.addPropEvent('update');
    }
    fireInstanceEvent() {
        this.addPropEvent('instance');
        ScreenManager.fireInstanceEvent();
    }
    static fireInstanceEvent() {
        this.addPropEvent('instance');
    }
    fireVisibleEvent() {
        this.addPropEvent('visible');
        ScreenManager.fireVisibleEvent();
    }
    static fireVisibleEvent() {
        this.addPropEvent('visible');
    }
    fireResizeEvent() {
        this.addPropEvent('resize');
        ScreenManager.fireVisibleEvent();
    }
    static fireResizeEvent() {
        this.addPropEvent('resize');
    }
    delete() {
        this.screenBackgroundManager.delete();
        this.screenFTManager.delete();
        this.screenSlideManager.delete();
        this.screenAlertManager.delete();
        this.hide();
        cache.delete(this.key);
        ScreenManager.saveScreenManagersSetting();
        this.fireInstanceEvent();
    }
    static receiveSyncScreen(message: ScreenMessageType) {
        const { type, data, screenId } = message;
        const screenManager = ScreenManager.getInstance(screenId);
        if (screenManager === null) {
            return;
        }
        if (type === 'init') {
            screenManager.setSyncScreen();
        } else if (type === 'background') {
            ScreenBackgroundManager.receiveSyncScreen(message);
        } else if (type === 'slide') {
            ScreenSlideManager.receiveSyncScreen(message);
        } else if (type === 'full-text') {
            ScreenFullTextManager.receiveSyncData(message);
        } else if (type === 'full-text-scroll') {
            ScreenFullTextManager.receiveSyncScroll(message);
        } else if (type === 'full-text-selected-index') {
            ScreenFullTextManager.receiveSyncSelectedIndex(message);
        } else if (type === 'full-text-text-style') {
            ScreenFullTextManager.receiveSyncTextStyle(message);
        } else if (type === 'alert') {
            ScreenAlertManager.receiveSyncScreen(message);
        } else if (type === 'effect') {
            ScreenTransitionEffect.receiveSyncScreen(message);
        } else if (type === 'visible') {
            screenManager.isShowing = data?.isShowing;
        } else {
            log(message);
        }
    }
    static getInstanceByKey(key: string) {
        const screenId = parseInt(key, 10);
        return this.getInstance(screenId);
    }
    static getAllInstances(): ScreenManager[] {
        const cachedInstances = Array.from(cache.values());
        if (cachedInstances.length > 0) {
            return cachedInstances;
        }
        return getAllShowingScreenIds().map((screenId) => {
            return this.createInstance(screenId);
        });
    }
    static createInstance(screenId: number) {
        const key = screenId.toString();
        if (!cache.has(key)) {
            const screenManager = new ScreenManager(screenId);
            cache.set(key, screenManager);
            ScreenManager.saveScreenManagersSetting();
        }
        return cache.get(key) as ScreenManager;
    }
    static getInstance(screenId: number) {
        const key = screenId.toString();
        if (cache.has(key)) {
            return cache.get(key) as ScreenManager;
        }
        return null;
    }
    static getSelectedInstances() {
        return Array.from(cache.values()).filter((screenManager) => {
            return screenManager.isSelected;
        });
    }
    static contextChooseInstances(event: React.MouseEvent) {
        return new Promise<ScreenManager[]>((resolve) => {
            const selectedScreenManagers = this.getSelectedInstances();
            if (selectedScreenManagers.length > 0) {
                return resolve(selectedScreenManagers);
            }
            const allScreenManagers = ScreenManager.getAllInstances();
            showAppContextMenu(
                event as any, allScreenManagers.map((screenManager,
                ) => {
                    return {
                        menuTitle: screenManager.name,
                        onClick: () => {
                            resolve([screenManager]);
                        },
                    };
                })).then(() => resolve([]));
        });
    }
    static getScreenManagersSetting() {
        const instanceSetting = getScreenManagersInstanceSetting();
        if (instanceSetting.length > 0) {
            instanceSetting.forEach(({ screenId, isSelected }: any) => {
                if (typeof screenId === 'number') {
                    const screenManager = this.createInstance(screenId);
                    screenManager._isSelected = !!isSelected;
                }
            });
        } else {
            this.createInstance(0);
        }
        const screenManagers = this.getAllInstances();
        if (screenManagers.length === 1) {
            screenManagers[0]._isSelected = true;
        }
        return screenManagers;
    }
    static saveScreenManagersSetting() {
        const screenManagers = this.getAllInstances();
        const json = screenManagers.map((screenManager) => {
            return {
                screenId: screenManager.screenId,
                isSelected: screenManager.isSelected,
            };
        });
        setSetting(screenManagerSettingNames.MANAGERS, JSON.stringify(json));
    }
    receiveScreenDrag(droppedData: DroppedDataType) {
        if ([
            DragTypeEnum.BACKGROUND_COLOR,
            DragTypeEnum.BACKGROUND_IMAGE,
            DragTypeEnum.BACKGROUND_VIDEO,
        ].includes(droppedData.type)) {
            this.screenBackgroundManager.receiveScreenDrag(droppedData);
        } else if (droppedData.type === DragTypeEnum.SLIDE_ITEM) {
            this.screenSlideManager.receiveScreenDrag(droppedData);
        } else if ([
            DragTypeEnum.BIBLE_ITEM,
            DragTypeEnum.LYRIC_ITEM,
        ].includes(droppedData.type)) {
            this.screenFTManager.receiveScreenDrag(droppedData);
        } else {
            log(droppedData);
        }
    }
}
