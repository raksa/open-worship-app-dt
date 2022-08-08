import EventHandler from '../event/EventHandler';
import { getSetting, setSetting } from '../helper/settingHelper';

const transitionEffect = ['none', 'fade', 'slide', 'zoom'] as const;
export type PresentTransitionEffectType = typeof transitionEffect[number];
export type PTFEventType = 'update';

class PresentTransitionEffect extends EventHandler<PTFEventType> {
    readonly target: string;
    private _effectType: PresentTransitionEffectType;
    static readonly _cache = new Map<string, PresentTransitionEffect>();
    constructor(target: string) {
        super();
        this.target = target;
        const effectType = getSetting('present-transition-effect-', '');
        this._effectType = transitionEffect.includes(effectType as any)
            ? effectType as PresentTransitionEffectType : transitionEffect[0];
    }
    get effectType(): PresentTransitionEffectType {
        return this._effectType;
    }
    set effectType(value: PresentTransitionEffectType) {
        this._effectType = value;
        setSetting('present-transition-effect-', value);
    }
    static getInstance(target: string) {
        if (!this._cache.has(target)) {
            const presentManager = new PresentTransitionEffect(target);
            this._cache.set(target, presentManager);
        }
        return this._cache.get(target) as PresentTransitionEffect;
    }
}

export default PresentTransitionEffect;
