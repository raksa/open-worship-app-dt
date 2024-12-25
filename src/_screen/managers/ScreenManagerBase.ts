import EventHandler from '../../event/EventHandler';
import { DroppedDataType } from '../../helper/DragInf';
import { getWindowDim } from '../../helper/helpers';
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
import ColorNoteInf from '../../helper/ColorNoteInf';
import {
    getDisplayIdByScreenId, saveScreenManagersSetting,
    SCREEN_MANAGER_SETTING_NAME,
} from './screenManagerBaseHelpers';

export type ScreenManagerEventType = (
    'instance' | 'update' | 'visible' | 'display-id' | 'resize'
);

export default class ScreenManagerBase
    extends EventHandler<ScreenManagerEventType>
    implements ScreenManagerInf, ColorNoteInf {

    static readonly eventNamePrefix: string = 'screen-m';
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
        this.screenId = screenId;
        this.isDeleted = false;
        const dim = getWindowDim();
        this.width = dim.width;
        this.height = dim.height;
        this.noSyncGroupMap = new Map();
        this.name = `screen-${screenId}`;
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
    get key() {
        return this.screenId.toString();
    }

    get displayId() {
        return getDisplayIdByScreenId(this.screenId);
    }

    get isSelected() {
        return this._isSelected;
    }

    get isShowing() {
        return this._isShowing;
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
        ScreenManagerBase.addPropEvent('display-id', data);
    }

    set isSelected(isSelected: boolean) {
        this._isSelected = isSelected;
        saveScreenManagersSetting();
        this.fireInstanceEvent();
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
        ScreenManagerBase.fireUpdateEvent();
    }

    fireInstanceEvent() {
        this.addPropEvent('instance');
        ScreenManagerBase.fireInstanceEvent();
    }

    fireVisibleEvent() {
        this.addPropEvent('visible');
        ScreenManagerBase.fireVisibleEvent();
    }

    fireResizeEvent() {
        this.addPropEvent('resize');
        ScreenManagerBase.fireVisibleEvent();
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

    sendSyncScreen() {
        throw new Error('sendSyncScreen is not implemented.');
    }

    clear() {
        throw new Error('clear is not implemented.');
    }

    async delete() {
        throw new Error('delete is not implemented.');
    }

    receiveScreenDropped(_droppedData: DroppedDataType) {
        throw new Error('receiveScreenDropped is not implemented.');
    }
}
