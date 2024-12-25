import EventHandler from '../../event/EventHandler';
import { getSetting, setSetting } from '../../helper/settingHelpers';
import { sendScreenMessage } from '../managers/screenEventHelpers';
import {
    ScreenMessageType, PTEffectDataType,
} from '../screenHelpers';
import {
    ScreenTransitionEffectType, PTFEventType, styleAnimList, TargetType,
    transitionEffect,
} from '../transitionEffectHelpers';
import ScreenManagerBase from './ScreenManagerBase';
import {
    createScreenManagerGhost, getScreenManagerForce,
} from './screenManagerHelpers';

class ScreenEffectManager extends EventHandler<PTFEventType> {
    screenManagerBase: ScreenManagerBase;
    readonly target: TargetType;
    private _effectType: ScreenTransitionEffectType;
    constructor(screenManagerBase: ScreenManagerBase, target: TargetType) {
        super();
        this.screenManagerBase = screenManagerBase;
        this.target = target;
        const effectType = getSetting(this.settingName, '');
        this._effectType = (
            Object.keys(transitionEffect).includes(effectType)
                ? effectType as ScreenTransitionEffectType : 'none'
        );
    }
    get screenId() {
        return this.screenManagerBase.screenId;
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
        const screenManagerBase = getScreenManagerForce(
            message.screenId,
        );
        if (screenManagerBase === null) {
            return;
        }
        const data = message.data as PTEffectDataType;
        if (data.target === 'background') {
            screenManagerBase.backgroundEffectManager.effectType = data.effect;
        } else if (data.target === 'slide') {
            screenManagerBase.slideEffectManager.effectType = data.effect;
        }
    }

    delete() {
        this.screenManagerBase = createScreenManagerGhost(
            this.screenId,
        );
    }

}

export default ScreenEffectManager;
