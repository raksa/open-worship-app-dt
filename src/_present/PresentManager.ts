import EventHandler from '../event/EventHandler';
import { getWindowDim, isValidJson } from '../helper/helpers';
import { getSetting, setSetting } from '../helper/settingHelper';
import { showAppContextMenu } from '../others/AppContextMenu';
import PresentAlertManager from './PresentAlertManager';
import PresentBGManager from './PresentBGManager';
import PresentFTManager from './PresentFTManager';
import {
    PresentDragTargetType,
    getAllDisplays,
    getAllShowingPresentIds,
    hidePresent,
    PresentMessageType,
    setDisplay,
    showPresent,
} from './presentHelpers';
import PresentManagerInf from './PresentManagerInf';
import PresentSlideManager from './PresentSlideManager';
import PresentTransitionEffect from './transition-effect/PresentTransitionEffect';

export type PresentManagerEventType = 'instance' | 'update'
    | 'visible' | 'display-id' | 'resize';
const settingName = 'present-display-';

export default class PresentManager extends EventHandler<PresentManagerEventType>
    implements PresentManagerInf {
    static eventNamePrefix: string = 'present-m';
    readonly presentBGManager: PresentBGManager;
    readonly presentSlideManager: PresentSlideManager;
    readonly presentFTManager: PresentFTManager;
    readonly presentAlertManager: PresentAlertManager;
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
        this.presentSlideManager = new PresentSlideManager(presentId);
        this.presentFTManager = new PresentFTManager(presentId);
        this.presentAlertManager = new PresentAlertManager(presentId);
        const ids = getAllShowingPresentIds();
        this._isShowing = ids.some((id) => id === presentId);
    }
    get key() {
        return this.presentId.toString();
    }
    static getDisplayById(displayId: number) {
        const { displays } = getAllDisplays();
        return displays.find((display) => {
            return display.id === displayId;
        })?.id || 0;
    }
    static getDisplayByPresentId(presentId: number) {
        const displayId = this.getDisplayIdByPresentId(presentId);
        const { displays } = getAllDisplays();
        return displays.find((display) => {
            return display.id === displayId;
        }) || this.getDefaultPresentDisplay();
    }
    static getDisplayIdByPresentId(presentId: number) {
        const defaultDisplay = PresentManager.getDefaultPresentDisplay();
        const str = getSetting(`${settingName}-pid-${presentId}`,
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
        return PresentManager.getDisplayIdByPresentId(this.presentId);
    }
    set displayId(id: number) {
        setSetting(`${settingName}-pid-${this.presentId}`, id.toString());
        if (this.isShowing) {
            setDisplay({
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
        PresentManager.savePresentManagersSetting();
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
    setSyncPresent() {
        PresentTransitionEffect.sendSyncPresent();
        this.presentBGManager.sendSyncPresent();
        this.presentSlideManager.sendSyncPresent();
        this.presentFTManager.sendSyncPresent();
        this.presentAlertManager.sendSyncPresent();
        PresentFTManager.sendSynTextStyle();
    }
    show() {
        return showPresent({
            presentId: this.presentId,
            displayId: this.displayId,
        });
    }
    hide() {
        hidePresent(this.presentId);
    }
    static getDefaultPresentDisplay() {
        const { primaryDisplay, displays } = getAllDisplays();
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
        this.presentBGManager.delete();
        this.presentFTManager.delete();
        this.presentSlideManager.delete();
        this.presentAlertManager.delete();
        this.hide();
        PresentManager._cache.delete(this.key);
        PresentManager.savePresentManagersSetting();
        this.fireInstanceEvent();
    }
    static receiveSyncPresent(message: PresentMessageType) {
        const { type, data, presentId } = message;
        const presentManager = PresentManager.getInstance(presentId);
        if (type === 'init') {
            presentManager.setSyncPresent();
        } else if (type === 'background') {
            PresentBGManager.receiveSyncPresent(message);
        } else if (type === 'slide') {
            PresentSlideManager.receiveSyncPresent(message);
        } else if (type === 'full-text') {
            PresentFTManager.receiveSyncData(message);
        } else if (type === 'full-text-scroll') {
            PresentFTManager.receiveSyncScroll(message);
        } else if (type === 'full-text-selected-index') {
            PresentFTManager.receiveSyncSelectedIndex(message);
        } else if (type === 'full-text-text-style') {
            PresentFTManager.receiveSyncTextStyle(message);
        } else if (type === 'alert') {
            PresentAlertManager.receiveSyncPresent(message);
        } else if (type === 'effect') {
            PresentTransitionEffect.receiveSyncPresent(message);
        } else if (type === 'visible') {
            presentManager.isShowing = data?.isShowing;
        } else {
            console.log(message);
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
        return getAllShowingPresentIds().map((presentId) => {
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
    static contextChooseInstances(event: React.MouseEvent) {
        return new Promise<PresentManager[]>((resolve) => {
            const selectedPresentManagers = this.getSelectedInstances();
            if (selectedPresentManagers.length > 0) {
                return resolve(selectedPresentManagers);
            }
            const allPresentManagers = PresentManager.getAllInstances();
            showAppContextMenu(event as any, allPresentManagers.map((presentManager) => {
                return {
                    title: presentManager.name,
                    onClick: () => {
                        resolve([presentManager]);
                    },
                };
            })).then(() => resolve([]));
        });
    }
    static getPresentManagersSetting() {
        let presentManagers = this.getAllInstances();
        const str = getSetting(`${settingName}instances`, '');
        if (isValidJson(str, true)) {
            const json = JSON.parse(str);
            json.forEach(({ presentId, isSelected }: any) => {
                if (typeof presentId === 'number') {
                    const presentManager = this.getInstance(presentId);
                    presentManager._isSelected = !!isSelected;
                    if (presentManagers.every((pm) => {
                        return pm.presentId !== presentId;
                    })) {
                        presentManagers.push(presentManager);
                    }
                }
            });
        }
        if (presentManagers.length === 0) {
            presentManagers = [this.getInstance(0)];
        }
        if (presentManagers.length === 1) {
            presentManagers[0]._isSelected = true;
        }
        return presentManagers;
    }
    static savePresentManagersSetting() {
        const presentManagers = this.getAllInstances();
        const json = presentManagers.map((presentManager) => {
            return {
                presentId: presentManager.presentId,
                isSelected: presentManager.isSelected,
            };
        });
        setSetting(`${settingName}instances`, JSON.stringify(json));
    }
    receivePresentDrag(presentData: {
        target: PresentDragTargetType,
    }) {
        if (presentData.target === 'background') {
            this.presentBGManager.receivePresentDrag(presentData);
        } else if (presentData.target === 'slide') {
            this.presentSlideManager.receivePresentDrag(presentData);
        } else if (presentData.target === 'full-text') {
            this.presentFTManager.receivePresentDrag(presentData);
        } else {
            console.log(presentData);
        }
    }
}
