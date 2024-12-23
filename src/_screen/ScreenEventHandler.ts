import EventHandler from '../event/EventHandler';
import { sendScreenMessage } from './screenEventHelpers';
import { BasicScreenMessageType, ScreenMessageType } from './screenHelpers';
import ScreenManager from './ScreenManager';

export default abstract class
    ScreenEventHandler<T extends string>
    extends EventHandler<T> {

    static readonly eventNamePrefix: string = 'screen-em';
    readonly screenId: number;
    constructor(screenId: number) {
        super();
        this.screenId = screenId;
    }

    abstract get isShowing(): boolean;

    get screenManager() {
        return ScreenEventHandler.getScreenManager(this.screenId);
    }

    get key() {
        return this.screenId.toString();
    }

    abstract toSyncMessage(): BasicScreenMessageType;

    sendSyncScreen() {
        sendScreenMessage({
            screenId: this.screenId,
            ...this.toSyncMessage(),
        });
    }

    abstract receiveSyncScreen(message: ScreenMessageType): void;

    static getScreenManager(screenId: number) {
        const screenManager = ScreenManager.getInstance(screenId);
        if (screenManager === null) {
            const ghostScreenManager = new ScreenManager(new Date().getTime());
            ghostScreenManager.isDeleted = true;
            return ScreenManager.createGhostInstance();
        }
        return screenManager;
    }

    static receiveSyncScreen(_message: ScreenMessageType) {
        throw new Error('receiveSyncScreen is not implemented.');
    }

    abstract render(): void;

    fireUpdateEvent() {
        this.addPropEvent('update' as T);
    }

    static fireUpdateEvent() {
        this.addPropEvent('update');
    }

    abstract clear(): void;

    static disableSyncGroup(screenId: number) {
        const screenManager = this.getScreenManager(screenId);
        screenManager.noSyncGroupMap.set(this.eventNamePrefix, true);
    }

    static enableSyncGroup(screenId: number) {
        const screenManager = this.getScreenManager(screenId);
        screenManager.noSyncGroupMap.set(this.eventNamePrefix, false);
    }

}
