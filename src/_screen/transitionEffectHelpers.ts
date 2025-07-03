import { useState } from 'react';

import { useAppEffect } from '../helper/debuggerHelpers';
import ScreenEffectManager from './managers/ScreenEffectManager';
import { StyleAnimType, PTFEventType } from './screenTypeHelpers';

const ZOOM_CONTAINER_CLASS = 'zoom-container';

function checkIsZoomContainer(targetElement: HTMLElement): boolean {
    return targetElement.classList.contains(ZOOM_CONTAINER_CLASS);
}

const easingFunctions = {
    linear: (k: number) => {
        return k;
    },
    'ease-in': (k: number) => {
        return Math.pow(k, 1.675);
    },
    'ease-out': (k: number) => {
        return 1 - Math.pow(1 - k, 1.675);
    },
    'ease-in-out': (k: number) => {
        return 0.5 * (Math.sin((k - 0.5) * Math.PI) + 1);
    },
};

export type EasingFuncType = keyof typeof easingFunctions;

export type GenAnimPropsType = {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
};

function genCssProps(duration: number) {
    const cssProps: React.CSSProperties = {
        animationDuration: `${Math.ceil(duration / 1000)}s`,
        animationFillMode: 'forwards',
    };
    return cssProps;
}

function fade(prefix: string) {
    const animationNameIn = `${prefix}-animation-fade-in`;
    const animationNameOut = `${prefix}-animation-fade-out`;
    const anim: StyleAnimType = {
        duration: 1000,
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
        animIn: (targetElement: HTMLElement, parentElement: HTMLElement) => {
            return new Promise((resolve) => {
                Object.assign(targetElement.style, {
                    ...genCssProps(anim.duration),
                    animationName: animationNameIn,
                    opacity: 0,
                });
                parentElement.appendChild(targetElement);
                setTimeout(resolve, anim.duration + 100);
            });
        },
        animOut: (targetElement: HTMLElement) => {
            return new Promise((resolve) => {
                if (checkIsZoomContainer(targetElement)) {
                    return resolve();
                }
                Object.assign(targetElement.style, {
                    ...genCssProps(anim.duration),
                    animationName: animationNameOut,
                });
                setTimeout(resolve, anim.duration + 100);
            });
        },
    };
    return anim;
}

function move() {
    const movingMaker = ({
        from,
        to,
        durationMil,
        easing,
        callback,
    }: {
        from: number;
        to: number;
        durationMil: number;
        easing?: EasingFuncType;
        callback: (n: number, isDone?: boolean) => void;
    }) => {
        const distDiff = to - from;
        const easeFn = easingFunctions[easing ?? 'ease-in'];
        const startTime = Date.now();
        const step = () => {
            const timeNow = Date.now();
            const elapsed = timeNow - startTime;
            const factor = elapsed / durationMil;
            if (factor >= 1) {
                callback(to, true);
                return;
            }
            const newPos = from + easeFn(Math.abs(factor)) * distDiff;
            callback(newPos);
            window.requestAnimationFrame(step);
        };
        window.requestAnimationFrame(step);
    };
    const anim: StyleAnimType = {
        duration: 500,
        style: '',
        animIn: (targetElement: HTMLElement, parentElement: HTMLElement) => {
            return new Promise<void>((resolve) => {
                parentElement.appendChild(targetElement);
                const rect = parentElement.getBoundingClientRect();
                const from = -rect.width;
                const siblingStyle = (
                    targetElement.previousSibling as HTMLElement
                )?.style ?? {
                    left: '0px',
                };
                const targetStyle = targetElement.style;
                targetStyle.left = `${from}px`;
                movingMaker({
                    from,
                    to: 0,
                    durationMil: anim.duration,
                    callback: (n, isDone) => {
                        siblingStyle.left = `${n + rect.width}px`;
                        targetStyle.left = `${n}px`;
                        if (isDone) {
                            resolve();
                        }
                    },
                });
            });
        },
        animOut: (targetElement: HTMLElement) => {
            return new Promise<void>((resolve) => {
                if (checkIsZoomContainer(targetElement)) {
                    return resolve();
                }
                const rect =
                    targetElement.parentElement!.getBoundingClientRect();
                movingMaker({
                    from: 0,
                    to: rect.width,
                    durationMil: anim.duration,
                    callback: (n, isDone) => {
                        targetElement.style.left = `${n}px`;
                        if (isDone) {
                            resolve();
                        }
                    },
                });
            });
        },
    };
    return anim;
}

function zoom(prefix: string): StyleAnimType {
    const animationNameIn = `${prefix}-animation-zoom-in`;
    const animationNameOut = `${prefix}-animation-zoom-out`;
    const createDiv = (targetElement: HTMLElement) => {
        const div = document.createElement('div');
        div.classList.add('zoom-container');
        div.appendChild(targetElement);
        return div;
    };
    const anim: StyleAnimType = {
        duration: 500,
        style: `
            .zoom-container {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                height: 100%;
            }
            @keyframes ${animationNameIn} {
                from {
                    opacity: 0;
                    transform: scale(0.1);
                }
                to {
                    opacity: 1;
                    transform: scale(1);
                }
            }
            @keyframes ${animationNameOut} {
                from {
                    opacity: 1;
                    transform: scale(1);
                }
                to {
                    opacity: 0;
                    transform: scale(0.1);
                }
            }
        `,
        animIn: (targetElement: HTMLElement, parentElement: HTMLElement) => {
            return new Promise((resolve) => {
                const div = createDiv(targetElement);
                Object.assign(div.style, {
                    ...genCssProps(anim.duration),
                    animationName: animationNameIn,
                    opacity: 0,
                    transform: 'scale(0.1)',
                });
                parentElement.appendChild(div);
                setTimeout(resolve, anim.duration + 100);
            });
        },
        animOut: (targetElement: HTMLElement) => {
            return new Promise((resolve) => {
                if (!checkIsZoomContainer(targetElement)) {
                    return resolve();
                }
                Object.assign(targetElement.style, {
                    ...genCssProps(anim.duration),
                    animationName: animationNameOut,
                });
                setTimeout(resolve, anim.duration + 100);
            });
        },
    };
    return anim;
}

export const styleAnimList = {
    fade,
    move,
    zoom,
};

export function useScreenEffectEvents(
    events: PTFEventType[],
    screenEffectManager: ScreenEffectManager,
    callback?: () => void,
) {
    const [n, setN] = useState(0);
    useAppEffect(() => {
        const update = () => {
            setN((n) => {
                return n + 1;
            });
            callback?.();
        };
        const instanceEvents = screenEffectManager.registerEventListener(
            events,
            update,
        );
        return () => {
            screenEffectManager.unregisterEventListener(instanceEvents);
        };
    }, [screenEffectManager, callback]);
    return n;
}
