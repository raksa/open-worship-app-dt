import EventHandler from '../../event/EventHandler';
import { sendScreenMessage } from './screenEventHelpers';
import { BasicScreenMessageType, ScreenMessageType } from '../screenHelpers';
import ScreenManagerBase from './ScreenManagerBase';
import {
    getScreenManagerForce, createScreenManagerGhost,
} from './screenManagerHelpers';

export default abstract class
    ScreenEventHandler<T extends string>
    extends EventHandler<T> {

    static readonly eventNamePrefix: string = 'screen-em';
    screenManagerBase: ScreenManagerBase;
    constructor(screenManagerBase: ScreenManagerBase) {
        super();
        this.screenManagerBase = screenManagerBase;
    }

    abstract get isShowing(): boolean;

    get screenId() {
        return this.screenManagerBase.screenId;
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
        const screenManagerBase = getScreenManagerForce(screenId);
        screenManagerBase.noSyncGroupMap.set(this.eventNamePrefix, true);
    }

    static enableSyncGroup(screenId: number) {
        const screenManagerBase = getScreenManagerForce(screenId);
        screenManagerBase.noSyncGroupMap.set(this.eventNamePrefix, false);
    }

    delete() {
        this.screenManagerBase = createScreenManagerGhost(
            this.screenId,
        );
    }

}
