import EventHandler from '../../event/EventHandler';
import { getSetting, setSetting } from '../../helper/settingHelpers';
import { sendScreenMessage } from '../screenEventHelpers';
import {
    ScreenMessageType, PTEffectDataType,
} from '../screenHelpers';
import ScreenManager from '../ScreenManager';
import {
    ScreenTransitionEffectType, PTFEventType, styleAnimList, TargetType,
    transitionEffect,
} from './transitionEffectHelpers';

class ScreenEffectManager extends EventHandler<PTFEventType> {
    readonly screenId: number;
    readonly target: TargetType;
    private _effectType: ScreenTransitionEffectType;
    constructor(screenId: number, target: TargetType) {
        super();
        this.screenId = screenId;
        this.target = target;
        const effectType = getSetting(this.settingName, '');
        this._effectType = (
            Object.keys(transitionEffect).includes(effectType)
                ? effectType as ScreenTransitionEffectType : 'none'
        );
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
        const screenManager = ScreenManager.getInstance(message.screenId);
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

}

export default ScreenEffectManager;
