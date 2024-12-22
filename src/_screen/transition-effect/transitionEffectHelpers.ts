import { useState } from 'react';

import { useAppEffect } from '../../helper/debuggerHelpers';
import ScreenTransitionEffect from './ScreenTransitionEffect';

export type StyleAnimType = {
    style: string,
    animIn: (_: HTMLElement) => Promise<void>;
    animOut: (_: HTMLElement) => Promise<void>;
    duration: number;
}

export const transitionEffect = {
    none: ['bi bi-asterisk'],
    fade: ['bi bi-fullscreen-exit'],
    move: ['bi bi-align-end'],
    zoom: ['bi bi-arrows-fullscreen'],
} as const;
export type ScreenTransitionEffectType = keyof typeof transitionEffect;
export type PTFEventType = 'update';
export const targetList = ['background', 'slide'] as const;
export type TargetType = typeof targetList[number];

const easingFunctions = {
    'linear': (k: number) => {
        return k;
    },
    'ease-in': (k: number) => {
        return Math.pow(k, 1.675);
    },
    'ease-out': (k: number) => {
        return 1 - Math.pow(1 - k, 1.675);
    },
    'ease-in-out': (k: number) => {
        return .5 * (Math.sin((k - .5) * Math.PI) + 1);
    },
};
export type EasingFuncType = keyof typeof easingFunctions;

export type GenAnimPropsType = {
    x?: number,
    y?: number,
    width?: number,
    height?: number,
};
function none(): StyleAnimType {
    return {
        style: '',
        animIn: async () => void 0,
        animOut: async () => void 0,
        duration: 0,
    };
}
function fade(target: TargetType): StyleAnimType {
    const duration = 1000;
    const cssProps = {
        animationDuration: `${duration / 1e3}s`,
        animationFillMode: 'forwards',
    };
    const animationNameIn = `${target}-animation-fade-in`;
    const animationNameOut = `${target}animation-fade-out`;
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
        animIn: (targetElement: HTMLElement) => {
            return new Promise((resolve) => {
                Object.assign(targetElement.style, {
                    ...cssProps,
                    animationName: animationNameIn,
                });
                setTimeout(resolve, duration + 100);
            });
        },
        animOut: (targetElement: HTMLElement) => {
            return new Promise((resolve) => {
                Object.assign(targetElement.style, {
                    ...cssProps,
                    animationName: animationNameOut,
                });
                setTimeout(resolve, duration + 100);
            });
        },
        duration,
    };
}
function move(): StyleAnimType {
    const duration = 500;
    const movingMaker = ({
        from, to, durationMil,
        easing, callback,
    }: {
        from: number, to: number,
        durationMil: number,
        easing?: EasingFuncType,
        callback: (n: number, isDone?: boolean) => void,
    }) => {
        const distDiff = to - from;
        const easeFn = easingFunctions[easing || 'ease-in'];
        const startTime = Date.now();
        const step = () => {
            const timeNow = Date.now();
            const elapsed = timeNow - startTime;
            const factor = elapsed / durationMil;
            if (factor >= 1) {
                callback(to, true);
                return;
            }
            const newPos = from + (easeFn(Math.abs(factor)) * distDiff);
            callback(newPos);
            window.requestAnimationFrame(step);
        };
        window.requestAnimationFrame(step);
    };
    return {
        style: '',
        animIn: (targetElement: HTMLElement) => {
            return new Promise<void>((resolve) => {
                if (targetElement.parentElement === null) {
                    return;
                }
                const rect = targetElement.parentElement
                    .getBoundingClientRect();
                const from = -rect.width;
                const styleLst = (targetElement.previousSibling as
                    HTMLElement)?.style || {
                    left: '0px',
                };
                const styleTarget = targetElement.style;
                styleTarget.left = `${from}px`;
                movingMaker({
                    from,
                    to: 0,
                    durationMil: duration,
                    callback: (n, isDone) => {
                        styleLst.left = `${n + rect.width}px`;
                        styleTarget.left = `${n}px`;
                        if (isDone) {
                            resolve();
                        }
                    },
                });
            });
        },
        animOut: (targetElement: HTMLElement) => {
            return new Promise<void>((resolve) => {
                if (targetElement.parentElement === null) {
                    return;
                }
                const rect = targetElement.parentElement
                    .getBoundingClientRect();
                movingMaker({
                    from: 0,
                    to: rect.width,
                    durationMil: duration,
                    callback: (n, isDone) => {
                        targetElement.style.left = `${n}px`;
                        if (isDone) {
                            resolve();
                        }
                    },
                });
            });
        },
        duration,
    };
}
function zoom(): StyleAnimType {
    return none();
}

export const styleAnimList: {
    [key: string]: (_: TargetType) => StyleAnimType,
} = {
    none,
    fade,
    move,
    zoom,
};

export function usePTEEvents(events: PTFEventType[],
    ptEffect: ScreenTransitionEffect,
    callback?: () => void) {
    const [n, setN] = useState(0);
    useAppEffect(() => {
        const update = () => {
            setN(n + 1);
            callback?.();
        };
        const instanceEvents = (
            ptEffect.registerEventListener(events, update) || []
        );
        return () => {
            ptEffect.unregisterEventListener(instanceEvents);
        };
    }, [ptEffect, n]);
}
