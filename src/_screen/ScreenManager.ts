import { createContext, useContext } from 'react';

import EventHandler from '../event/EventHandler';
import { DragTypeEnum, DroppedDataType } from '../helper/DragInf';
import { getWindowDim, isValidJson } from '../helper/helpers';
import { log } from '../helper/loggerHelpers';
import { getSetting, setSetting } from '../helper/settingHelper';
import { showAppContextMenu } from '../others/AppContextMenu';
import ScreenAlertManager from './ScreenAlertManager';
import ScreenBGManager from './ScreenBGManager';
import ScreenFTManager from './ScreenFTManager';
import {
    getAllDisplays, getAllShowingScreenIds, hideScreen, ScreenMessageType,
    setDisplay, showScreen,
} from './screenHelpers';
import ScreenManagerInf from './ScreenManagerInf';
import ScreenSlideManager from './ScreenSlideManager';
import ScreenTransitionEffect from
    './transition-effect/ScreenTransitionEffect';

export type ScreenManagerEventType = (
    'instance' | 'update' | 'visible' | 'display-id' | 'resize'
);
const settingName = 'screen-display-';

export const ScreenManagerContext = createContext<ScreenManager | null>(null);
export function useScreenManager(): ScreenManager {
    const screenManager = useContext(ScreenManagerContext);
    if (screenManager === null) {
        throw new Error(
            'useScreenManager must be used within a ScreenManager ' +
            'Context Provider',
        );
    }
    return screenManager;
}

export default class ScreenManager
    extends EventHandler<ScreenManagerEventType>
    implements ScreenManagerInf {

    static readonly eventNamePrefix: string = 'screen-m';
    readonly screenBGManager: ScreenBGManager;
    readonly screenSlideManager: ScreenSlideManager;
    readonly screenFTManager: ScreenFTManager;
    readonly screenAlertManager: ScreenAlertManager;
    readonly screenId: number;
    width: number;
    height: number;
    name: string;
    _isSelected: boolean = false;
    private _isShowing: boolean;
    static readonly _cache = new Map<string, ScreenManager>();

    constructor(screenId: number) {
        super();
        const dim = getWindowDim();
        this.width = dim.width;
        this.height = dim.height;
        this.screenId = screenId;
        this.name = `screen-${screenId}`;
        this.screenBGManager = new ScreenBGManager(screenId);
        this.screenSlideManager = new ScreenSlideManager(screenId);
        this.screenFTManager = new ScreenFTManager(screenId);
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
        if (isNaN(+str)) {
            return defaultDisplay.id;
        }
        const id = +str;
        const { displays } = getAllDisplays();
        return displays.find((display) => {
            return display.id === id;
        })?.id || defaultDisplay.id;
    }
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
        this.screenBGManager.sendSyncScreen();
        this.screenSlideManager.sendSyncScreen();
        this.screenFTManager.sendSyncScreen();
        this.screenAlertManager.sendSyncScreen();
        ScreenFTManager.sendSynTextStyle();
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
        this.screenBGManager.delete();
        this.screenFTManager.delete();
        this.screenSlideManager.delete();
        this.screenAlertManager.delete();
        this.hide();
        ScreenManager._cache.delete(this.key);
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
            ScreenBGManager.receiveSyncScreen(message);
        } else if (type === 'slide') {
            ScreenSlideManager.receiveSyncScreen(message);
        } else if (type === 'full-text') {
            ScreenFTManager.receiveSyncData(message);
        } else if (type === 'full-text-scroll') {
            ScreenFTManager.receiveSyncScroll(message);
        } else if (type === 'full-text-selected-index') {
            ScreenFTManager.receiveSyncSelectedIndex(message);
        } else if (type === 'full-text-text-style') {
            ScreenFTManager.receiveSyncTextStyle(message);
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
        return this.getInstance(+key);
    }
    static getAllInstances() {
        const cachedInstances = Array.from(this._cache.values());
        if (cachedInstances.length > 0) {
            return cachedInstances;
        }
        return getAllShowingScreenIds().map((screenId) => {
            return this.createInstance(screenId);
        });
    }
    static createInstance(screenId: number) {
        const key = screenId.toString();
        if (!this._cache.has(key)) {
            const screenManager = new ScreenManager(screenId);
            this._cache.set(key, screenManager);
            ScreenManager.saveScreenManagersSetting();
        }
        return this._cache.get(key) as ScreenManager;
    }
    static getInstance(screenId: number) {
        const key = screenId.toString();
        if (this._cache.has(key)) {
            return this._cache.get(key) as ScreenManager;
        }
        return null;
    }
    static getSelectedInstances() {
        return Array.from(this._cache.values())
            .filter((screenManager) => {
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
                        title: screenManager.name,
                        onClick: () => {
                            resolve([screenManager]);
                        },
                    };
                })).then(() => resolve([]));
        });
    }
    static getScreenManagersSetting() {
        const str = getSetting(`${settingName}instances`, '');
        if (isValidJson(str, true)) {
            const json = JSON.parse(str);
            if (json.length === 0) {
                this.createInstance(0);
            } else {
                json.forEach(({ screenId, isSelected }: any) => {
                    if (typeof screenId === 'number') {
                        const screenManager = this.createInstance(screenId);
                        screenManager._isSelected = !!isSelected;
                    }
                });
            }
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
        setSetting(`${settingName}instances`, JSON.stringify(json));
    }
    receiveScreenDrag(droppedData: DroppedDataType) {
        if ([
            DragTypeEnum.BG_COLOR,
            DragTypeEnum.BG_IMAGE,
            DragTypeEnum.BG_VIDEO,
        ].includes(droppedData.type)) {
            this.screenBGManager.receiveScreenDrag(droppedData);
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
