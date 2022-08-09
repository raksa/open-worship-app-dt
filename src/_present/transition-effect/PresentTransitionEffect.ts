import EventHandler from '../../event/EventHandler';
import { getSetting, setSetting } from '../../helper/settingHelper';
import {
    PresentTransitionEffectType,
    PTFEventType,
    styleAnimList,
    TargetType,
    transitionEffect,
} from './transitionEffectHelpers';

class PresentTransitionEffect extends EventHandler<PTFEventType> {
    readonly target: TargetType;
    private _effectType: PresentTransitionEffectType;
    static readonly _cache = new Map<TargetType, PresentTransitionEffect>();
    constructor(target: TargetType) {
        super();
        this.target = target;
        const effectType = getSetting('present-transition-effect-', '');
        this._effectType = Object.keys(transitionEffect).includes(effectType)
            ? effectType as PresentTransitionEffectType : 'none';
    }
    get effectType(): PresentTransitionEffectType {
        return this._effectType;
    }
    set effectType(value: PresentTransitionEffectType) {
        this._effectType = value;
        setSetting('present-transition-effect-', value);
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
    static getInstance(target: TargetType) {
        if (!this._cache.has(target)) {
            const presentManager = new PresentTransitionEffect(target);
            this._cache.set(target, presentManager);
        }
        return this._cache.get(target) as PresentTransitionEffect;
    }
}

export default PresentTransitionEffect;
