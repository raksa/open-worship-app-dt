import EventHandler from '../event/EventHandler';
import { getSetting, setSetting } from '../helper/settingHelper';
import { showAppContextMenu } from '../others/AppContextMenu';
import { AllDisplayType } from '../server/displayHelper';
import appProvider from './appProvider';
import PresentBGManager from './PresentBGManager';

export type PresentManagerEventType = 'select' | 'update' | 'visible' | 'display-id';
const messageUtils = appProvider.messageUtils;
const settingName = 'present-display-';
export default class PresentManager extends EventHandler<PresentManagerEventType> {
    static eventNamePrefix: string = 'present-m';
    readonly presentBGManager: PresentBGManager;
    readonly presentId: number;
    name: string;
    _isSelected: boolean = false;
    private _isShowing: boolean;
    static readonly _cache = new Map<string, PresentManager>();
    constructor(presentId: number) {
        super();
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
        this.addPropEvent('select');
        PresentManager.addPropEvent('select');
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
    static fireUpdateEvent() {
        this.addPropEvent('update');
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
        this.addPropEvent('update');
        PresentManager.fireUpdateEvent();
    }
    static fireVisibleEvent() {
        this.addPropEvent('visible');
    }
    fireVisibleEvent() {
        this.addPropEvent('visible');
        PresentManager.fireUpdateEvent();
    }
    static getInstanceByKey(key: string) {
        return this.getInstance(+key);
    }
    static getAllInstances() {
        return Array.from(this._cache.values());
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
            }));
        });
    }
}
