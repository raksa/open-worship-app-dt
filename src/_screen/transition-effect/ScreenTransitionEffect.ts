import EventHandler from '../../event/EventHandler';
import { getSetting, setSetting } from '../../helper/settingHelpers';
import { sendScreenMessage } from '../screenEventHelpers';
import {
    ScreenMessageType,
    PTEffectDataType,
} from '../screenHelpers';
import ScreenManager from '../ScreenManager';
import {
    ScreenTransitionEffectType,
    PTFEventType,
    styleAnimList,
    TargetType,
    transitionEffect,
} from './transitionEffectHelpers';

const cache = new Map<string, ScreenTransitionEffect>();
class ScreenTransitionEffect extends EventHandler<PTFEventType> {
    readonly screenId: number;
    readonly target: TargetType;
    private _effectType: ScreenTransitionEffectType;
    constructor(screenId: number, target: TargetType) {
        super();
        this.screenId = screenId;
        this.target = target;
        const effectType = getSetting(this.settingName, '');
        this._effectType = Object.keys(transitionEffect).includes(effectType)
            ? effectType as ScreenTransitionEffectType : 'none';
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
        ScreenTransitionEffect.sendSyncScreen();
        this.addPropEvent('update');
    }
    get styleAnim() {
        return styleAnimList[this.effectType](this.target);
    }
    get style() {
        return this.styleAnim.style;
    }
    get sssPropsIn() {
        return this.styleAnim.animIn;
    }
    get sssPropsOut() {
        return this.styleAnim.animOut;
    }
    get duration() {
        return this.styleAnim.duration;
    }
    static sendSyncScreen() {
        ScreenManager.getAllInstances().forEach((screenManager) => {
            const {
                screenBackgroundManager, screenSlideManager,
            } = screenManager;
            const data: PTEffectDataType[] = [{
                target: screenBackgroundManager.ptEffectTarget,
                effect: screenBackgroundManager.ptEffect.effectType,
            }, {
                target: screenSlideManager.ptEffectTarget,
                effect: screenSlideManager.ptEffect.effectType,
            }];
            sendScreenMessage({
                screenId: screenManager.screenId,
                type: 'effect',
                data,
            });
        });
    }
    static receiveSyncScreen(message: ScreenMessageType) {
        const { data, screenId } = message;
        data.forEach(({ target, effect }: PTEffectDataType) => {
            this.getInstance(screenId, target).effectType = effect;
        });
    }
    static getInstance(screenId: number, target: TargetType) {
        const key = `${screenId}-${target}`;
        if (!cache.has(key)) {
            const screenManager = new ScreenTransitionEffect(screenId, target);
            cache.set(key, screenManager);
        }
        return cache.get(key) as ScreenTransitionEffect;
    }
}

export default ScreenTransitionEffect;
