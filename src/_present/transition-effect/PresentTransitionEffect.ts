import EventHandler from '../../event/EventHandler';
import { getSetting, setSetting } from '../../helper/settingHelper';
import {
    PresentMessageType,
    PTEffectDataType,
    sendPresentMessage,
} from '../presentHelpers';
import PresentManager from '../PresentManager';
import {
    PresentTransitionEffectType,
    PTFEventType,
    styleAnimList,
    TargetType,
    transitionEffect,
} from './transitionEffectHelpers';

class PresentTransitionEffect extends EventHandler<PTFEventType> {
    readonly presentId: number;
    readonly target: TargetType;
    private _effectType: PresentTransitionEffectType;
    static readonly _cache = new Map<string, PresentTransitionEffect>();
    constructor(presentId: number, target: TargetType) {
        super();
        this.presentId = presentId;
        this.target = target;
        const effectType = getSetting(this.settingName, '');
        this._effectType = Object.keys(transitionEffect).includes(effectType)
            ? effectType as PresentTransitionEffectType : 'none';
    }
    get settingName() {
        return `pt-effect-${this.presentId}-${this.target}`;
    }
    get effectType(): PresentTransitionEffectType {
        return this._effectType;
    }
    set effectType(value: PresentTransitionEffectType) {
        this._effectType = value;
        setSetting(this.settingName, value);
        PresentTransitionEffect.sendSyncPresent();
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
    static sendSyncPresent() {
        PresentManager.getAllInstances().forEach((presentManager) => {
            const {
                presentBGManager,
                presentSlideManager,
            } = presentManager;
            const data: PTEffectDataType[] = [{
                target: presentBGManager.ptEffectTarget,
                effect: presentBGManager.ptEffect.effectType,
            }, {
                target: presentSlideManager.ptEffectTarget,
                effect: presentSlideManager.ptEffect.effectType,
            }];
            sendPresentMessage({
                presentId: presentManager.presentId,
                type: 'effect',
                data,
            });
        });
    }
    static receiveSyncPresent(message: PresentMessageType) {
        const { data, presentId } = message;
        data.forEach(({ target, effect }: PTEffectDataType) => {
            this.getInstance(presentId, target).effectType = effect;
        });
    }
    static getInstance(presentId: number, target: TargetType) {
        const key = `${presentId}-${target}`;
        if (!this._cache.has(key)) {
            const presentManager = new PresentTransitionEffect(presentId, target);
            this._cache.set(key, presentManager);
        }
        return this._cache.get(key) as PresentTransitionEffect;
    }
}

export default PresentTransitionEffect;
