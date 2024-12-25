import EventHandler from '../../event/EventHandler';
import { getSetting, setSetting } from '../../helper/settingHelpers';
import { sendScreenMessage } from '../managers/screenEventHelpers';
import {
    ScreenMessageType, PTEffectDataType,
} from '../screenHelpers';
import ScreenManager from '../managers/ScreenManager';
import {
    ScreenTransitionEffectType, PTFEventType, styleAnimList, TargetType,
    transitionEffect,
} from '../transitionEffectHelpers';
import {
    createScreenManagerGhostInstance, getScreenManagerInstanceForce,
} from './screenManagerHelpers';

class ScreenEffectManager extends EventHandler<PTFEventType> {
    screenManager: ScreenManager;
    readonly target: TargetType;
    private _effectType: ScreenTransitionEffectType;
    constructor(screenManager: ScreenManager, target: TargetType) {
        super();
        this.screenManager = screenManager;
        this.target = target;
        const effectType = getSetting(this.settingName, '');
        this._effectType = (
            Object.keys(transitionEffect).includes(effectType)
                ? effectType as ScreenTransitionEffectType : 'none'
        );
    }
    get screenId() {
        return this.screenManager.screenId;
    }

    get settingName() {
        return `pt-effect-${this.screenId}-${this.target}`;
    }

    get effectType(): ScreenTransitionEffectType {
        return this._effectType;
    }
    set effectType(value: ScreenTransitionEffectType) {
        this._effectType = value;
        setSetting(this.settingName, value);
        this.sendSyncScreen();
        this.addPropEvent('update');
    }
    get styleAnim() {
        return styleAnimList[this.effectType](this.target);
    }
    get style() {
        return this.styleAnim.style;
    }
    get duration() {
        return this.styleAnim.duration;
    }

    sendSyncScreen() {
        sendScreenMessage({
            screenId: this.screenId, type: 'effect', data: {
                target: this.target,
                effect: this.effectType,
            } as PTEffectDataType,
        });
    }

    static receiveSyncScreen(message: ScreenMessageType) {
        const screenManager = getScreenManagerInstanceForce(message.screenId);
        if (screenManager === null) {
            return;
        }
        const data = message.data as PTEffectDataType;
        if (data.target === 'background') {
            screenManager.backgroundEffectManager.effectType = data.effect;
        } else if (data.target === 'slide') {
            screenManager.slideEffectManager.effectType = data.effect;
        }
    }

    delete() {
        this.screenManager = createScreenManagerGhostInstance(this.screenId);
    }

}

export default ScreenEffectManager;
