import { CSSProperties } from 'react';
import EventHandler from '../event/EventHandler';
import { getSetting, setSetting } from '../helper/settingHelper';

const transitionEffect = ['none', 'fade', 'slide', 'zoom'] as const;
export type PresentTransitionEffectType = typeof transitionEffect[number];
export type PTFEventType = 'update';
const targetList = ['background', 'foreground'] as const;
export type TargetType = typeof targetList[number];

export type StyleAnimType = {
    style: string,
    cssPropsIn: CSSProperties;
    cssPropsOut: CSSProperties;
    duration: number;
}
export const styleAnimList: {
    [key: string]: StyleAnimType,
} = {
    fade: (() => {
        const duration = 1000;
        const cssProps = {
            animationDuration: `${duration / 1e3}s`,
            animationFillMode: 'forwards',
        };
        const animationNameIn = 'animation-fade-in';
        const animationNameOut = 'animation-fade-out';
        return {
            style: `
                @keyframes ${animationNameIn} {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }
                @keyframes ${animationNameOut} {
                    from {
                        opacity: 1;
                    }
                    to {
                        opacity: 0;
                    }
                }
            `,
            cssPropsIn: {
                ...cssProps,
                animationName: animationNameIn,
            },
            cssPropsOut: {
                ...cssProps,
                animationName: animationNameOut,
            },
            duration,
        };
    })(),
};

class PresentTransitionEffect extends EventHandler<PTFEventType> {
    readonly target: TargetType;
    private _effectType: PresentTransitionEffectType;
    static readonly _cache = new Map<TargetType, PresentTransitionEffect>();
    constructor(target: TargetType) {
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
    get styleAnim() {
        return styleAnimList['fade'];
    }
    get style() {
        return this.styleAnim.style;
    }
    get cssPropsIn() {
        return this.styleAnim.cssPropsIn;
    }
    get cssPropsOut() {
        return this.styleAnim.cssPropsOut;
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
