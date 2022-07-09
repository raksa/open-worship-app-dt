import { getRotationDeg, removePX } from '../helper/helpers';

type ResizeType = {
  left: boolean, top: boolean, xResize: boolean, yResize: boolean,
};
type BoxInfoType = {
  top: number,
  left: number,
  width: number,
  height: number,
  rotate: number,
}
type ListenedEvent = {
  eventName: 'mousedown', target: HTMLDivElement,
  listener: (event: MouseEvent) => void,
};
export default class BoxEditorController {
  onDone: Function | null = null;
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
    [key: string]: ResizeType
  } = {
      'right-mid': { left: false, top: false, xResize: true, yResize: false },
      'left-mid': { left: true, top: false, xResize: true, yResize: false },
      'top-mid': { left: false, top: true, xResize: false, yResize: true },
      'bottom-mid': { left: false, top: false, xResize: false, yResize: true },
      'left-top': { left: true, top: true, xResize: true, yResize: true },
      'right-top': { left: false, top: true, xResize: true, yResize: true },
      'right-bottom': { left: false, top: false, xResize: true, yResize: true },
      'left-bottom': { left: true, top: false, xResize: true, yResize: true },
    };
  rotatorCN = 'rotate';
  listened: ListenedEvent[] = [];
  setScaleFactor(sf: number) {
    this.scaleFactor = sf;
  }
  addEvent(le: ListenedEvent) {
    le.target.addEventListener(le.eventName, le.listener, false);
    this.listened.push(le);
  }
  release() {
    while (this.listened.length) {
      const obj = this.listened.shift();
      obj?.target.removeEventListener(obj.eventName, obj.listener as any, false);
    }
    this.editor = null;
    this.target = null;
  }
  initEvent(editor: HTMLDivElement) {
    this.release();
    this.editor = editor;
    this.target = this.editor.firstChild as HTMLDivElement;
    // drag support
    const moveHandler = (event: MouseEvent) => this.moveHandler(event);
    this.addEvent({ eventName: 'mousedown', target: this.target, listener: moveHandler });
    // handle resize
    for (const [key, value] of Object.entries(this.resizeActorList)) {
      const ele = this.target.querySelector(`.${key}`) as HTMLDivElement;
      const resizeHandler = (event: MouseEvent) => this.resizeHandler(event, value);
      this.addEvent({ eventName: 'mousedown', target: ele, listener: resizeHandler });
    }
    // handle rotation
    const rotator = this.target.querySelector(`.${this.rotatorCN}`) as HTMLDivElement;
    const rotateHandler = (event: MouseEvent) => this.rotateHandler(event);
    this.addEvent({ eventName: 'mousedown', target: rotator, listener: rotateHandler });
  }
  moveHandler(event: MouseEvent) {
    if (this.editor === null || this.target === null) {
      return;
    }
    event.stopPropagation();
    const target = event.currentTarget as HTMLDivElement;
    if (target.className.indexOf('dot') > -1) {
      return;
    }
    this.initX = this.editor.offsetLeft;
    this.initY = this.editor.offsetTop;
    this.mousePressX = event.clientX;
    this.mousePressY = event.clientY;

    const eventMouseMoveHandler = (movingEvent: MouseEvent) => {
      movingEvent.stopPropagation();
      this.repositionElement(
        this.initX + (movingEvent.clientX - this.mousePressX) / this.scaleFactor,
        this.initY + (movingEvent.clientY - this.mousePressY) / this.scaleFactor,
      );
    };
    const eventMouseUpHandler = (endingEvent: MouseEvent) => {
      if (this.editor === null || this.target === null) {
        return;
      }
      endingEvent.stopPropagation();
      if (this.onDone !== null) {
        this.onDone();
      }
      window.removeEventListener('mousemove', eventMouseMoveHandler, false);
      window.removeEventListener('mouseup', eventMouseUpHandler);
    };
    window.addEventListener('mousemove', eventMouseMoveHandler, false);
    window.addEventListener('mouseup', eventMouseUpHandler, false);
  }
  rotationFromStyle(st: CSSStyleDeclaration) {
    const tm = st.getPropertyValue('transform');
    if (tm !== 'none') {
      const values = tm.split('(')[1].split(')')[0].split(',');
      const angle = Math.round(
        Math.atan2(+values[1], +values[0]) * (180 / Math.PI),
      );
      return angle < 0 ? angle + 360 : angle;
    }
    return 0;
  }
  getCurrentRotation(el: HTMLDivElement) {
    const st = window.getComputedStyle(el, null);
    return this.rotationFromStyle(st);
  }
  repositionElement(x: number, y: number) {
    if (this.editor === null) {
      return;
    }
    this.editor.style.left = `${x}px`;
    this.editor.style.top = `${y}px`;
  }
  resizeBox(w: number, h: number) {
    if (this.target === null) {
      return;
    }
    this.target.style.width = `${w}px`;
    this.target.style.height = `${h}px`;
  }
  rotateBox(deg: number) {
    if (this.editor === null) {
      return;
    }
    this.editor.style.transform = `rotate(${deg}deg)`;
  }
  unRotateBox() {
    if (this.editor === null) {
      return;
    }
    this.editor.style.transform = 'rotate(0deg)';
  }
  rotateHandler(event: MouseEvent) {
    if (this.target === null) {
      return;
    }
    event.stopPropagation();
    const arrowRects = this.target.getBoundingClientRect();
    const arrowX = arrowRects.left + arrowRects.width / 2;
    const arrowY = arrowRects.top + arrowRects.height / 2;

    const eventMoveHandler = (movingEvent: MouseEvent) => {
      movingEvent.stopPropagation();
      const angle =
        Math.atan2(movingEvent.clientY - arrowY, movingEvent.clientX - arrowX) +
        Math.PI / 2;
      this.rotateBox((angle * 180) / Math.PI);
    };
    const eventEndHandler = (endingEvent: MouseEvent) => {
      endingEvent.stopPropagation();
      if (this.onDone !== null) {
        this.onDone();
      }
      window.removeEventListener('mousemove', eventMoveHandler, false);
      window.removeEventListener('mouseup', eventEndHandler);
    };
    window.addEventListener('mousemove', eventMoveHandler, false);
    window.addEventListener('mouseup', eventEndHandler, false);
  }
  resizeHandler(event: MouseEvent, options: ResizeType) {
    if (this.editor === null || this.target === null) {
      return;
    }
    event.stopPropagation();
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

    const eventMouseMoveHandler = (movingEvent: MouseEvent) => {
      movingEvent.stopPropagation();
      const wDiff = (movingEvent.clientX - this.mousePressX) / this.scaleFactor;
      const hDiff = (movingEvent.clientY - this.mousePressY) / this.scaleFactor;
      let rotatedWDiff = cosFraction * wDiff + sinFraction * hDiff;
      let rotatedHDiff = cosFraction * hDiff - sinFraction * wDiff;

      let newW = initW,
        newH = initH,
        newX = this.initX,
        newY = this.initY;

      if (xResize) {
        if (left) {
          newW = initW - rotatedWDiff;
          if (newW < this.minWidth) {
            newW = this.minWidth;
            rotatedWDiff = initW - this.minWidth;
          }
        } else {
          newW = initW + rotatedWDiff;
          if (newW < this.minWidth) {
            newW = this.minWidth;
            rotatedWDiff = this.minWidth - initW;
          }
        }
        newX += 0.5 * rotatedWDiff * cosFraction;
        newY += 0.5 * rotatedWDiff * sinFraction;
      }

      if (yResize) {
        if (top) {
          newH = initH - rotatedHDiff;
          if (newH < this.minHeight) {
            newH = this.minHeight;
            rotatedHDiff = initH - this.minHeight;
          }
        } else {
          newH = initH + rotatedHDiff;
          if (newH < this.minHeight) {
            newH = this.minHeight;
            rotatedHDiff = this.minHeight - initH;
          }
        }
        newX -= 0.5 * rotatedHDiff * sinFraction;
        newY += 0.5 * rotatedHDiff * cosFraction;
      }

      this.resizeBox(newW, newH);
      this.repositionElement(newX, newY);
    };
    const eventMouseUpHandler = (endingEvent: MouseEvent) => {
      endingEvent.stopPropagation();
      window.removeEventListener('mousemove', eventMouseMoveHandler, false);
      window.removeEventListener('mouseup', eventMouseUpHandler);
    };
    window.addEventListener('mousemove', eventMouseMoveHandler, false);
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
