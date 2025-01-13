import { createContext, use } from 'react';
import { getRotationDeg, removePX } from '../helper/helpers';

type ResizeType = {
    left: boolean;
    top: boolean;
    xResize: boolean;
    yResize: boolean;
};
type BoxInfoType = {
    top: number;
    left: number;
    width: number;
    height: number;
    rotate: number;
};
type ListenedEvent = {
    eventName: 'mousedown';
    target: HTMLDivElement;
    listener: (event: MouseEvent) => void;
};

type CalcBoxPropsType = {
    left: boolean;
    top: boolean;
    xResize: boolean;
    yResize: boolean;
    cosFraction: number;
    sinFraction: number;
    initW: number;
    initH: number;
    boxProps: BoxEditorController;
    mEvent: MouseEvent;
};

function calcBoxPropsXSize(options: {
    left: boolean;
    cosFraction: number;
    sinFraction: number;
    initX: number;
    initY: number;
    initW: number;
    initH: number;
    minWidth: number;
    rotatedWDiff: number;
}) {
    const { left, cosFraction, sinFraction, initH, minWidth } = options;
    let { initX, initY, initW, rotatedWDiff } = options;

    if (left) {
        initW -= rotatedWDiff;
        if (initW < minWidth) {
            initW = minWidth;
            rotatedWDiff = initW - minWidth;
        }
    } else {
        initW = initW + rotatedWDiff;
        if (initW < minWidth) {
            initW = minWidth;
            rotatedWDiff = minWidth - initW;
        }
    }
    initX += 0.5 * rotatedWDiff * cosFraction;
    initY += 0.5 * rotatedWDiff * sinFraction;
    return {
        newW: initW,
        newH: initH,
        newX: initX,
        newY: initY,
    };
}
function calcBoxPropsYSize(options: {
    top: boolean;
    cosFraction: number;
    sinFraction: number;
    initX: number;
    initY: number;
    initW: number;
    initH: number;
    minHeight: number;
    rotatedHDiff: number;
}) {
    const { top, cosFraction, sinFraction, initW, minHeight } = options;
    let { initX, initY, initH, rotatedHDiff } = options;

    if (top) {
        initH -= rotatedHDiff;
        if (initH < minHeight) {
            initH = minHeight;
            rotatedHDiff = initH - minHeight;
        }
    } else {
        initH = initH + rotatedHDiff;
        if (initH < minHeight) {
            initH = minHeight;
            rotatedHDiff = minHeight - initH;
        }
    }
    initX -= 0.5 * rotatedHDiff * sinFraction;
    initY += 0.5 * rotatedHDiff * cosFraction;
    return {
        newX: initX,
        newY: initY,
        newW: initW,
        newH: initH,
    };
}
function calcBoxProps(options: CalcBoxPropsType) {
    const {
        left,
        top,
        xResize,
        yResize,
        cosFraction,
        sinFraction,
        initW,
        initH,
        boxProps,
        mEvent,
    } = options;
    const { scaleFactor, mousePressX, mousePressY } = boxProps;
    const wDiff = (mEvent.clientX - mousePressX) / scaleFactor;
    const hDiff = (mEvent.clientY - mousePressY) / scaleFactor;
    const rotatedWDiff = cosFraction * wDiff + sinFraction * hDiff;
    const rotatedHDiff = cosFraction * hDiff - sinFraction * wDiff;

    let newW = initW,
        newH = initH,
        newX = boxProps.initX,
        newY = boxProps.initY;

    if (xResize) {
        const result = calcBoxPropsXSize({
            left,
            cosFraction,
            sinFraction,
            initW,
            initH,
            ...boxProps,
            rotatedWDiff,
        });
        newX = result.newX;
        newY = result.newY;
        newW = result.newW;
        newH = result.newH;
    }

    if (yResize) {
        const result = calcBoxPropsYSize({
            top,
            cosFraction,
            sinFraction,
            rotatedHDiff,
            ...boxProps,
            initX: newX,
            initY: newY,
            initW: newW,
            initH: newH,
        });
        newX = result.newX;
        newY = result.newY;
        newW = result.newW;
        newH = result.newH;
    }
    return {
        newW,
        newH,
        newX,
        newY,
    };
}

export default class BoxEditorController {
    onDone: () => void | Promise<void> = () => {};
    onClick: (event: any) => void | Promise<void> = () => {};
    editor: HTMLDivElement | null = null;
    target: HTMLDivElement | null = null;
    minWidth = 40;
    minHeight = 40;
    initX = 0;
    initY = 0;
    mousePressX = 0;
    mousePressY = 0;
    scaleFactor = 1;
    resizeActorList: {
        [key: string]: ResizeType;
    } = {
        'right-mid': {
            left: false,
            top: false,
            xResize: true,
            yResize: false,
        },
        'left-mid': {
            left: true,
            top: false,
            xResize: true,
            yResize: false,
        },
        'top-mid': {
            left: false,
            top: true,
            xResize: false,
            yResize: true,
        },
        'bottom-mid': {
            left: false,
            top: false,
            xResize: false,
            yResize: true,
        },
        'left-top': {
            left: true,
            top: true,
            xResize: true,
            yResize: true,
        },
        'right-top': {
            left: false,
            top: true,
            xResize: true,
            yResize: true,
        },
        'right-bottom': {
            left: false,
            top: false,
            xResize: true,
            yResize: true,
        },
        'left-bottom': {
            left: true,
            top: false,
            xResize: true,
            yResize: true,
        },
    };
    rotatorCN = 'rotate';
    listened: ListenedEvent[] = [];
    constructor(scaleFactor: number) {
        this.scaleFactor = scaleFactor;
    }
    addEvent(listenerEvent: ListenedEvent) {
        listenerEvent.target.addEventListener(
            listenerEvent.eventName,
            listenerEvent.listener,
            false,
        );
        this.listened.push(listenerEvent);
    }
    release() {
        while (this.listened.length) {
            const obj = this.listened.shift();
            obj?.target.removeEventListener(
                obj.eventName,
                obj.listener as any,
                false,
            );
        }
        this.editor = null;
        this.target = null;
    }
    initEvent(editor: HTMLDivElement) {
        if(this.editor === editor) {
            return;
        }
        this.release();
        this.editor = editor;
        this.target = this.editor.firstChild as HTMLDivElement;
        // drag support
        const moveHandler = (event: MouseEvent) => this.moveHandler(event);
        this.addEvent({
            eventName: 'mousedown',
            target: this.target,
            listener: moveHandler,
        });
        // handle resize
        for (const [key, value] of Object.entries(this.resizeActorList)) {
            const ele = this.target.querySelector(`.${key}`) as HTMLDivElement;
            const resizeHandler = (event: MouseEvent) => {
                return this.resizeHandler(event, value);
            };
            this.addEvent({
                eventName: 'mousedown',
                target: ele,
                listener: resizeHandler,
            });
        }
        // handle rotation
        const rotator = this.target.querySelector(
            `.${this.rotatorCN}`,
        ) as HTMLDivElement;
        const rotateHandler = (event: MouseEvent) => this.rotateHandler(event);
        this.addEvent({
            eventName: 'mousedown',
            target: rotator,
            listener: rotateHandler,
        });
    }
    moveHandler(event: MouseEvent) {
        if (
            event.button === 2 ||
            this.editor === null ||
            this.target === null
        ) {
            return;
        }
        this.blockMouseEvent(event);
        let isMoving = false;
        const target = event.currentTarget as HTMLDivElement;
        if (target.className.includes('dot')) {
            return;
        }
        this.initX = this.editor.offsetLeft;
        this.initY = this.editor.offsetTop;
        this.mousePressX = event.clientX;
        this.mousePressY = event.clientY;

        const eventMouseMoveHandler = (event: MouseEvent) => {
            this.blockMouseEvent(event);
            isMoving = true;
            const { scaleFactor, initX, initY, mousePressX, mousePressY } =
                this;
            this.repositionElement(
                initX + (event.clientX - mousePressX) / scaleFactor,
                initY + (event.clientY - mousePressY) / scaleFactor,
            );
        };
        const eventMouseUpHandler = (event: MouseEvent) => {
            if (this.editor === null || this.target === null) {
                return;
            }
            this.blockMouseEvent(event);
            window.removeEventListener(
                'mousemove',
                eventMouseMoveHandler,
                false,
            );
            window.removeEventListener('mouseup', eventMouseUpHandler, false);
            if (isMoving) {
                this.onDone();
            } else {
                this.onClick(event);
            }
        };
        window.addEventListener('mousemove', eventMouseMoveHandler, false);
        window.addEventListener('mouseup', eventMouseUpHandler, false);
    }
    rotationFromStyle(style: CSSStyleDeclaration) {
        const transform = style.getPropertyValue('transform');
        if (transform !== 'none') {
            const values = transform.split('(')[1].split(')')[0].split(',');
            const angle = Math.round(
                Math.atan2(parseInt(values[1]), parseInt(values[0])) *
                    (180 / Math.PI),
            );
            return angle < 0 ? angle + 360 : angle;
        }
        return 0;
    }
    getCurrentRotation(element: HTMLDivElement) {
        const style = window.getComputedStyle(element, null);
        return this.rotationFromStyle(style);
    }
    repositionElement(x: number, y: number) {
        if (this.editor === null) {
            return;
        }
        this.editor.style.left = `${x}px`;
        this.editor.style.top = `${y}px`;
    }
    resizeBox(width: number, height: number) {
        if (this.target === null) {
            return;
        }
        this.target.style.width = `${width}px`;
        this.target.style.height = `${height}px`;
    }
    rotateBox(rotationDegrees: number) {
        if (this.editor === null) {
            return;
        }
        this.editor.style.transform = `rotate(${rotationDegrees}deg)`;
    }
    unRotateBox() {
        if (this.editor === null) {
            return;
        }
        this.editor.style.transform = 'rotate(0deg)';
    }
    blockMouseEvent(event: MouseEvent) {
        event.preventDefault();
        event.stopPropagation();
    }
    rotateHandler(event: MouseEvent) {
        if (this.target === null) {
            return;
        }
        this.blockMouseEvent(event);
        const arrowRects = this.target.getBoundingClientRect();
        const arrowX = arrowRects.left + arrowRects.width / 2;
        const arrowY = arrowRects.top + arrowRects.height / 2;

        const eventMoveHandler = (event: MouseEvent) => {
            this.blockMouseEvent(event);
            const angle =
                Math.atan2(event.clientY - arrowY, event.clientX - arrowX) +
                Math.PI / 2;
            const rotationDegrees = (angle * 180) / Math.PI;
            this.rotateBox(rotationDegrees);
        };
        const eventEndHandler = (event: MouseEvent) => {
            this.blockMouseEvent(event);
            window.removeEventListener('mousemove', eventMoveHandler, false);
            window.removeEventListener('mouseup', eventEndHandler, false);
            this.onDone();
        };
        window.addEventListener('mousemove', eventMoveHandler, false);
        window.addEventListener('mouseup', eventEndHandler, false);
    }
    resizeHandler(event: MouseEvent, options: ResizeType) {
        if (this.editor === null || this.target === null) {
            return;
        }
        this.blockMouseEvent(event);
        const { left, top, xResize, yResize } = options;
        this.initX = this.editor.offsetLeft;
        this.initY = this.editor.offsetTop;
        this.mousePressX = event.clientX;
        this.mousePressY = event.clientY;

        const initW = this.target.offsetWidth;
        const initH = this.target.offsetHeight;

        const initRotate = this.getCurrentRotation(this.editor);
        const initRadians = (initRotate * Math.PI) / 180;
        const cosFraction = Math.cos(initRadians);
        const sinFraction = Math.sin(initRadians);
        const mMoveHandler = (event: MouseEvent) => {
            this.blockMouseEvent(event);
            const { newW, newH, newX, newY } = calcBoxProps({
                left,
                top,
                xResize,
                yResize,
                cosFraction,
                sinFraction,
                initW,
                initH,
                boxProps: this,
                mEvent: event,
            });
            this.resizeBox(newW, newH);
            this.repositionElement(newX, newY);
        };

        const eventMouseUpHandler = (event: MouseEvent) => {
            this.blockMouseEvent(event);
            window.removeEventListener('mousemove', mMoveHandler, false);
            window.removeEventListener('mouseup', eventMouseUpHandler, false);
            this.onDone();
        };
        window.addEventListener('mousemove', mMoveHandler, false);
        window.addEventListener('mouseup', eventMouseUpHandler, false);
    }
    getInfo(): BoxInfoType | null {
        if (this.editor === null || this.target === null) {
            return null;
        }
        const info = {
            top: removePX(this.editor.style.top),
            left: removePX(this.editor.style.left),
            width: removePX(this.target.style.width),
            height: removePX(this.target.style.height),
            rotate: getRotationDeg(this.editor.style.transform),
        };
        info.top -= info.height / 2;
        info.left -= info.width / 2;
        return info;
    }
}

export const BoxEditorControllerContext =
    createContext<BoxEditorController | null>(null);
export function useBoxEditorControllerContext() {
    const context = use(BoxEditorControllerContext);
    if (context === null) {
        throw new Error(
            'useBoxEditorControllerContext must be used inside a ' +
                'BoxEditorControllerContext.Provider',
        );
    }
    return context;
}
