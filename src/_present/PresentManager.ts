import EventHandler from '../event/EventHandler';
import { AllDisplayType } from '../server/displayHelper';
import appProvider from './appProvider';
import PresentBGManager, {
    BackgroundSrcType,
    BGSrcListType,
} from './PresentBGManager';

export type PMEventType = 'update' | 'visible';
type ListenerType<T> = (data: T) => void;
export type RegisteredEventType<T> = {
    type: PMEventType,
    listener: ListenerType<T>,
};
const messageUtils = appProvider.messageUtils;
export default class PresentManager extends EventHandler<PMEventType> {
    static readonly eventHandler = new EventHandler<PMEventType>();
    readonly presentBGManager: PresentBGManager;
    readonly presentId: number;
    _isSelected: boolean = false;
    private _isShowing: boolean = false;
    static readonly _cache: Map<string, PresentManager> = new Map();
    constructor(presentId: number) {
        super();
        this.presentId = presentId;
        this.presentBGManager = new PresentBGManager();
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
        const allDisplays = PresentManager.getAllDisplays();
        debugger;
        console.log(allDisplays);
        messageUtils.sendData(this._isShowing ?
            'main:app:show-present' :
            'main:app:hide-present', this.presentId);
        this.fireVisibleEvent();
    }
    static fireUpdateEvent() {
        this.eventHandler._addPropEvent('update');
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
    static getInstance(presentId: number) {
        const key = presentId.toString();
        if (!this._cache.has(key)) {
            const presentManager = new PresentManager(presentId);
            this._cache.set(key, presentManager);
            presentManager.presentBGManager.bgSrc = this.getBGSrcById(key);
        }
        return this._cache.get(key) as PresentManager;
    }
    static getSelectedInstances(): [string, PresentManager][] {
        return Array.from(this._cache.keys())
            .filter((key) => {
                return this._cache.get(key)?.isSelected;
            }).map((key) => {
                return [key, this._cache.get(key) as PresentManager];
            });
    }
    static getBGSrcList() {
        return PresentBGManager.getBGSrcList();
    }
    static setBGSrcList(bgSrcList: BGSrcListType) {
        Array.from(this._cache.keys()).forEach((key) => {
            this.setBGSrcByKey(key, null);
        });
        Object.keys(bgSrcList).forEach((key) => {
            this.setBGSrcByKey(key, bgSrcList[key]);
        });
        this.fireUpdateEvent();
    }
    static getBGSrcById(key: string) {
        return PresentBGManager.getBGSrcByKey(key);
    }
    static setBGSrcByKey(key: string, bgSrc: BackgroundSrcType | null) {
        PresentBGManager.setBGSrcByKey(key, bgSrc);
        const presentManager = this.getInstance(+key);
        presentManager.presentBGManager.bgSrc = bgSrc;
        this.fireUpdateEvent();
    }
    static setBGSrcByKeys(keys: string[], bgSrc: BackgroundSrcType | null) {
        keys.forEach((key) => {
            this.setBGSrcByKey(key, bgSrc);
        });
        this.fireUpdateEvent();
    }
    static setBGSrc(bgSrc: BackgroundSrcType) {
        this.getSelectedInstances().forEach(([key, presentManager]) => {
            presentManager.presentBGManager.bgSrc = bgSrc;
            this.setBGSrcByKey(key, bgSrc);
        });
    }
}

export type PresentMessageType = {
    presentId?: number,
    type: 'background',
    data: any,
};
appProvider.messageUtils.listenForData('app:present:message', (_,
    message: PresentMessageType) => {
    const { presentId, type, data } = message;
    if (type === 'background') {
        if (presentId !== undefined) {
            PresentManager.setBGSrcByKey(presentId.toString(), data);
        } else {
            const keys = PresentManager.getAllKeys();
            PresentManager.setBGSrcByKeys(keys, data || null);
        }
    };
});
