import EventHandler from '../event/EventHandler';
import { AnyObjectType } from '../helper/helpers';
import { getSetting, setSetting } from '../helper/settingHelper';
import { AllDisplayType } from '../server/displayHelper';
import appProvider from './appProvider';
import PresentBGManager, {
    BackgroundSrcType,
} from './PresentBGManager';

export type PMEventType = 'update' | 'visible' | 'display-id';
type ListenerType<T> = (data: T) => void;
export type RegisteredEventType<T> = {
    type: PMEventType,
    listener: ListenerType<T>,
};
const messageUtils = appProvider.messageUtils;
const settingName = 'present-display-';
export default class PresentManager extends EventHandler<PMEventType> {
    static readonly eventHandler = new EventHandler<PMEventType>();
    readonly presentBGManager: PresentBGManager;
    readonly presentId: number;
    readonly isMain: boolean = true;
    _isSelected: boolean = false;
    private _isShowing: boolean;
    static readonly _cache: Map<string, PresentManager> = new Map();
    constructor(presentId: number, isPresent?: boolean) {
        super();
        this.presentId = presentId;
        this.isMain = !isPresent;
        this.presentBGManager = new PresentBGManager(presentId);
        const ids = PresentManager.getAllShowingPresentIds();
        this._isShowing = ids.some((id) => id === presentId);
    }
    get key() {
        return this.presentId.toString();
    }
    get displayId() {
        const defaultDisplay = PresentManager.getDefaultPresentDisplay();
        const str = getSetting(`${settingName}-pid-${this.presentId}`,
            defaultDisplay.id.toString());
        if (isNaN(+str)) {
            return defaultDisplay.id;
        }
        const id = +str;
        const { displays } = PresentManager.getAllDisplays();
        return displays.find((display) => {
            return display.id === id;
        })?.id || defaultDisplay.id;
    }
    set displayId(id: number) {
        setSetting(`${settingName}-pid-${this.presentId}`, id.toString());
        if (this.isShowing) {
            messageUtils.sendData('main:app:set-present-display', {
                presentId: this.presentId,
                displayId: id,
            });
        }
        const data = {
            presentId: this.presentId,
            displayId: id,
        };
        this._addPropEvent('display-id', data);
        PresentManager.eventHandler._addPropEvent('display-id', data);
    }
    get isSelected() {
        return this._isSelected;
    }
    set isSelected(isSelected: boolean) {
        this._isSelected = isSelected;
    }
    get isShowing() {
        return this._isShowing;
    }
    set isShowing(isShowing: boolean) {
        this._isShowing = isShowing;
        if (isShowing) {
            messageUtils.sendData('main:app:show-present', {
                presentId: this.presentId,
                displayId: this.displayId,
            });
        } else {
            messageUtils.sendData('app:hide-present', this.presentId);
        }
        this.fireVisibleEvent();
    }
    get bgSrc() {
        return this.presentBGManager.bgSrc;
    }
    set bgSrc(bgSrc: BackgroundSrcType | null) {
        this.presentBGManager.bgSrc = bgSrc;
        this.sendMessage('background', bgSrc);
        this.fireUpdateEvent();
    }
    close() {
        messageUtils.sendData('app:hide-present', this.presentId);
    }
    sendMessage(type: PresentType, data: AnyObjectType | null) {
        if (!this.isMain) {
            return;
        }
        const channel1 = messageUtils.channels.presentMessageChannel;
        messageUtils.sendData(channel1, {
            presentId: this.presentId,
            type, data,
        });
    }
    static fireUpdateEvent() {
        this.eventHandler._addPropEvent('update');
    }
    static getAllShowingPresentIds(): number[] {
        return messageUtils.sendSyncData('main:app:get-presents');
    }
    static getAllDisplays(): AllDisplayType {
        return messageUtils.sendSyncData('main:app:get-displays');
    }
    static getDefaultPresentDisplay() {
        const { primaryDisplay, displays } = this.getAllDisplays();
        return displays.find((display) => {
            return display.id === primaryDisplay.id;
        }) || primaryDisplay;
    }
    fireUpdateEvent() {
        this._addPropEvent('update');
        PresentManager.fireUpdateEvent();
    }
    static fireVisibleEvent() {
        this.eventHandler._addPropEvent('visible');
    }
    fireVisibleEvent() {
        this._addPropEvent('visible');
        PresentManager.fireUpdateEvent();
    }
    registerEventListener(types: PMEventType[], listener: ListenerType<any>):
        RegisteredEventType<any>[] {
        return types.map((type) => {
            this._addOnEventListener(type, listener);
            return { type, listener };
        });
    }
    unregisterEventListener(regEvents: RegisteredEventType<any>[]) {
        regEvents.forEach(({ type, listener }) => {
            this._removeOnEventListener(type, listener);
        });
    }
    static registerEventListener(types: PMEventType[], listener: ListenerType<any>):
        RegisteredEventType<any>[] {
        return types.map((type) => {
            this.eventHandler._addOnEventListener(type, listener);
            return { type, listener };
        });
    }
    static unregisterEventListener(regEvents: RegisteredEventType<any>[]) {
        regEvents.forEach(({ type, listener }) => {
            this.eventHandler._removeOnEventListener(type, listener);
        });
    }
    static getAllKeys() {
        return Array.from(this._cache.keys());
    }
    static getInstanceByKey(key: string, isPresent?: boolean) {
        return this.getInstance(+key, isPresent);
    }
    static getInstance(presentId: number, isPresent?: boolean) {
        const key = presentId.toString();
        if (!this._cache.has(key)) {
            const presentManager = new PresentManager(presentId, isPresent);
            this._cache.set(key, presentManager);
        }
        return this._cache.get(key) as PresentManager;
    }
    static getSelectedInstances() {
        return Array.from(this._cache.values())
            .filter((presentManager) => {
                return presentManager.isSelected;
            });
    }
}

type PresentType = 'background' | 'display-change' | 'visible';
export type PresentMessageType = {
    presentId: number,
    type: PresentType,
    data: AnyObjectType | null,
};
const channel = messageUtils.channels.presentMessageChannel;
appProvider.messageUtils.listenForData(channel,
    (_, message: PresentMessageType) => {
        const { presentId, type, data } = message;
        const presentManager = PresentManager.getInstance(presentId);
        if (type === 'background') {
            presentManager.bgSrc = data as any;
        } else if (type === 'visible' && data !== null) {
            presentManager.isShowing = data.isShowing;
        }
    });
