import EventHandler from '../../event/EventHandler';
import { DragTypeEnum, DroppedDataType } from '../../helper/DragInf';
import { getWindowDim } from '../../helper/helpers';
import { log } from '../../helper/loggerHelpers';
import { setSetting } from '../../helper/settingHelpers';
import ScreenAlertManager from './ScreenAlertManager';
import ScreenBackgroundManager from './ScreenBackgroundManager';
import ScreenFullTextManager from './ScreenFullTextManager';
import {
    getAllShowingScreenIds, getScreenManagersInstanceSetting,
    hideScreen, setDisplay, showScreen,
} from '../screenHelpers';
import ScreenManagerInf from '../preview/ScreenManagerInf';
import ScreenSlideManager from './ScreenSlideManager';
import ScreenEffectManager from './ScreenEffectManager';
import ColorNoteInf from '../../helper/ColorNoteInf';
import {
    deleteScreenManagerCache, getDisplayIdByScreenId, saveScreenManagersSetting,
    SCREEN_MANAGER_SETTING_NAME,
} from './screenManagerHelpers';

export type ScreenManagerEventType = (
    'instance' | 'update' | 'visible' | 'display-id' | 'resize'
);

export default class ScreenManager
    extends EventHandler<ScreenManagerEventType>
    implements ScreenManagerInf, ColorNoteInf {

    static readonly eventNamePrefix: string = 'screen-m';
    readonly screenBackgroundManager: ScreenBackgroundManager;
    readonly screenSlideManager: ScreenSlideManager;
    readonly screenFullTextManager: ScreenFullTextManager;
    readonly screenAlertManager: ScreenAlertManager;
    readonly slideEffectManager: ScreenEffectManager;
    readonly backgroundEffectManager: ScreenEffectManager;
    readonly screenId: number;
    isDeleted: boolean;
    width: number;
    height: number;
    name: string;
    _isSelected: boolean = false;
    private _isShowing: boolean;
    private _colorNote: string | null = null;
    noSyncGroupMap: Map<string, boolean>;

    constructor(screenId: number) {
        super();
        this.isDeleted = false;
        const dim = getWindowDim();
        this.width = dim.width;
        this.height = dim.height;
        this.screenId = screenId;
        this.noSyncGroupMap = new Map();
        this.name = `screen-${screenId}`;
        this.screenBackgroundManager = new ScreenBackgroundManager(this);
        this.screenSlideManager = new ScreenSlideManager(this);
        this.screenFullTextManager = new ScreenFullTextManager(this);
        this.screenAlertManager = new ScreenAlertManager(this);
        this.slideEffectManager = new ScreenEffectManager(this, 'slide');
        this.backgroundEffectManager = new ScreenEffectManager(
            this, 'background',
        );
        const ids = getAllShowingScreenIds();
        this._isShowing = ids.some((id) => {
            return id === screenId;
        });
        const screenManagersSetting = getScreenManagersInstanceSetting();
        const instanceSetting = screenManagersSetting.find((item) => {
            return item.screenId === screenId;
        });
        if (instanceSetting) {
            this._isSelected = instanceSetting.isSelected;
            this._colorNote = instanceSetting.colorNote;
        }
    }

    async getColorNote() {
        return this._colorNote;
    }

    async setColorNote(color: string | null) {
        this._colorNote = color;
        await saveScreenManagersSetting();
        ScreenBackgroundManager.enableSyncGroup(this.screenId);
        ScreenSlideManager.enableSyncGroup(this.screenId);
        ScreenFullTextManager.enableSyncGroup(this.screenId);
        ScreenAlertManager.enableSyncGroup(this.screenId);
        this.sendSyncScreen();
    }

    checkIsSyncGroupEnabled(Class: { eventNamePrefix: string }) {
        const key = Class.eventNamePrefix;
        return !this.noSyncGroupMap.get(key);
    }

    get key() {
        return this.screenId.toString();
    }

    get displayId() {
        return getDisplayIdByScreenId(this.screenId);
    }

    set displayId(id: number) {
        setSetting(
            `${SCREEN_MANAGER_SETTING_NAME}-pid-${this.screenId}`,
            id.toString(),
        );
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
        saveScreenManagersSetting();
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
    sendSyncScreen() {
        this.slideEffectManager.sendSyncScreen();
        this.backgroundEffectManager.sendSyncScreen();
        this.screenBackgroundManager.sendSyncScreen();
        this.screenSlideManager.sendSyncScreen();
        this.screenFullTextManager.sendSyncScreen();
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

    fireUpdateEvent() {
        this.addPropEvent('update');
        ScreenManager.fireUpdateEvent();
    }
    fireInstanceEvent() {
        this.addPropEvent('instance');
        ScreenManager.fireInstanceEvent();
    }
    fireVisibleEvent() {
        this.addPropEvent('visible');
        ScreenManager.fireVisibleEvent();
    }

    fireResizeEvent() {
        this.addPropEvent('resize');
        ScreenManager.fireVisibleEvent();
    }
    clear() {
        this.screenBackgroundManager.clear();
        this.screenFullTextManager.clear();
        this.screenSlideManager.clear();
        this.screenAlertManager.clear();
        this.fireUpdateEvent();
    }
    async delete() {
        this.isDeleted = true;
        this.clear();
        this.hide();
        this.slideEffectManager.delete();
        this.backgroundEffectManager.delete();
        this.screenBackgroundManager.delete();
        this.screenSlideManager.delete();
        this.screenFullTextManager.delete();
        this.screenAlertManager.delete();
        deleteScreenManagerCache(this.key);
        await saveScreenManagersSetting(this.screenId);
        this.fireInstanceEvent();
    }

    static fireUpdateEvent() {
        this.addPropEvent('update');
    }
    static fireInstanceEvent() {
        this.addPropEvent('instance');
    }
    static fireVisibleEvent() {
        this.addPropEvent('visible');
    }
    static fireResizeEvent() {
        this.addPropEvent('resize');
    }

    receiveScreenDropped(droppedData: DroppedDataType) {
        if ([
            DragTypeEnum.BACKGROUND_COLOR,
            DragTypeEnum.BACKGROUND_IMAGE,
            DragTypeEnum.BACKGROUND_VIDEO,
        ].includes(droppedData.type)) {
            this.screenBackgroundManager.receiveScreenDropped(droppedData);
        } else if (droppedData.type === DragTypeEnum.SLIDE_ITEM) {
            this.screenSlideManager.receiveScreenDropped(droppedData);
        } else if ([
            DragTypeEnum.BIBLE_ITEM,
            DragTypeEnum.LYRIC_ITEM,
        ].includes(droppedData.type)) {
            this.screenFullTextManager.receiveScreenDropped(droppedData);
        } else {
            log(droppedData);
        }
    }
}
