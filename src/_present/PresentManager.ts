import EventHandler from '../event/EventHandler';
import { getWindowDim } from '../helper/helpers';
import { getSetting, setSetting } from '../helper/settingHelper';
import { showAppContextMenu } from '../others/AppContextMenu';
import { AllDisplayType } from '../server/displayHelper';
import appProviderPresent from './appProviderPresent';
import PresentBGManager from './PresentBGManager';

export type PresentManagerEventType = 'instance' | 'update'
    | 'visible' | 'display-id' | 'resize';
const messageUtils = appProviderPresent.messageUtils;
const settingName = 'present-display-';

export default class PresentManager extends EventHandler<PresentManagerEventType> {
    static eventNamePrefix: string = 'present-m';
    readonly presentBGManager: PresentBGManager;
    readonly presentId: number;
    width: number;
    height: number;
    name: string;
    _isSelected: boolean = false;
    private _isShowing: boolean;
    static readonly _cache = new Map<string, PresentManager>();
    constructor(presentId: number) {
        super();
        const dim = getWindowDim();
        this.width = dim.width;
        this.height = dim.height;
        this.presentId = presentId;
        this.name = `present-${presentId}`;
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
        this.addPropEvent('display-id', data);
        PresentManager.addPropEvent('display-id', data);
    }
    get isSelected() {
        return this._isSelected;
    }
    set isSelected(isSelected: boolean) {
        this._isSelected = isSelected;
        this.fireInstanceEvent();
    }
    get isShowing() {
        return this._isShowing;
    }
    set isShowing(isShowing: boolean) {
        this._isShowing = isShowing;
        if (isShowing) {
            this.show().then(() => {
                this.presentBGManager.syncPresent();
            });
        } else {
            this.hide();
        }
        this.fireVisibleEvent();
    }
    show() {
        return new Promise<void>((resolve) => {
            const replyEventName = 'app:main-' + Date.now();
            messageUtils.listenOnceForData(replyEventName, () => {
                resolve();
            });
            messageUtils.sendData('main:app:show-present', {
                presentId: this.presentId,
                displayId: this.displayId,
                replyEventName,
            });
        });
    }
    hide() {
        messageUtils.sendData('app:hide-present', this.presentId);
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
            return display.id !== primaryDisplay.id;
        }) || primaryDisplay;
    }
    fireUpdateEvent() {
        this.addPropEvent('update');
        PresentManager.fireUpdateEvent();
    }
    static fireUpdateEvent() {
        this.addPropEvent('update');
    }
    fireInstanceEvent() {
        this.addPropEvent('instance');
        PresentManager.fireInstanceEvent();
    }
    static fireInstanceEvent() {
        this.addPropEvent('instance');
    }
    fireVisibleEvent() {
        this.addPropEvent('visible');
        PresentManager.fireVisibleEvent();
    }
    static fireVisibleEvent() {
        this.addPropEvent('visible');
    }
    fireResizeEvent() {
        this.addPropEvent('resize');
        PresentManager.fireVisibleEvent();
    }
    static fireResizeEvent() {
        this.addPropEvent('resize');
    }
    delete() {
        this.hide();
        this.presentBGManager.bgSrc = null;
        PresentManager._cache.delete(this.key);
        this.fireInstanceEvent();
    }
    static getInstanceByKey(key: string) {
        return this.getInstance(+key);
    }
    static getAllInstances() {
        const cachedInstances = Array.from(this._cache.values());
        if (cachedInstances.length > 0) {
            return cachedInstances;
        }
        return this.getAllShowingPresentIds().map((presentId) => {
            return this.getInstance(presentId);
        });
    }
    static getInstance(presentId: number) {
        const key = presentId.toString();
        if (!this._cache.has(key)) {
            const presentManager = new PresentManager(presentId);
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
    static contextChooseInstances(e: React.MouseEvent<HTMLElement, MouseEvent>) {
        return new Promise<PresentManager[]>((resolve) => {
            const selectedPresentManagers = this.getSelectedInstances();
            if (selectedPresentManagers.length > 0) {
                return resolve(selectedPresentManagers);
            }
            const allPresentManagers = PresentManager.getAllInstances();
            showAppContextMenu(e, allPresentManagers.map((presentManager) => {
                return {
                    title: presentManager.name,
                    onClick: () => {
                        resolve([presentManager]);
                    },
                };
            })).then(() => resolve([]));
        });
    }
}
