import './FlexResizeActorComp.scss';

import { Component, RefObject, createRef } from 'react';

import { DisabledType } from './flexSizeHelpers';

export const HIDDEN_WIDGET_CLASS = 'hidden-widget';
export const ACTIVE_HIDDEN_WIDGET_CLASS = 'active-hidden-widget';
function checkIsActiveHiddenWidgetNode(node: HTMLDivElement) {
    return node.classList.contains(ACTIVE_HIDDEN_WIDGET_CLASS);
}

export type ResizeKindType = 'v' | 'h';
export interface Props {
    type: ResizeKindType;
    isDisableQuickResize: boolean;
    checkSize: () => void;
    disable: (dataFSizeKey: string, target: DisabledType) => void;
}
export default class FlexResizeActorComp extends Component<Props, {}> {
    myRef: RefObject<HTMLDivElement | null>;
    lastPos: number = 0;
    previousMinSize: number = 0;
    nextMinSize: number = 0;
    preSize: number = 0;
    nextSize: number = 0;
    previousGrow: number = 0;
    nextGrow: number = 0;
    sumGrow: number = 0;
    sumSize: number = 0;
    mouseMoveListener: (mm: MouseEvent) => void;
    mouseUpListener: (mm: MouseEvent) => void;
    constructor(props: Props) {
        super(props);
        this.myRef = createRef();
        this.mouseMoveListener = (mm: MouseEvent) => this.onMouseMove(mm);
        this.mouseUpListener = (event) => {
            this.onMouseUp(event);
        };
    }
    private get currentNode() {
        if (this.myRef.current === null) {
            throw new Error('currentNode is null');
        }
        return this.myRef.current;
    }
    private getSiblingFromNode(node: HTMLDivElement, isNext: boolean) {
        if (isNext) {
            return node.nextElementSibling as HTMLDivElement;
        }
        return node.previousElementSibling as HTMLDivElement;
    }
    private getSibling(isNext: boolean) {
        let node = this.getSiblingFromNode(this.currentNode, isNext);
        while (checkIsActiveHiddenWidgetNode(node)) {
            node = this.getSiblingFromNode(node, isNext);
        }
        return node;
    }
    get preNode() {
        return this.getSibling(false);
    }
    get nextNode() {
        return this.getSibling(true);
    }
    get isVertical() {
        return this.props.type === 'v';
    }
    getMousePagePos(me: MouseEvent) {
        return this.isVertical ? me.pageY : me.pageX;
    }
    getOffsetSize(div: HTMLDivElement) {
        return this.isVertical ? div.offsetHeight : div.offsetWidth;
    }
    init() {
        if (!this.currentNode) {
            return;
        }
        const prev = this.preNode;
        const next = this.nextNode;
        if (!prev || !next) {
            return;
        }
        this.currentNode.classList.add('active');

        this.previousMinSize = parseInt(this.preNode.dataset['minSize'] ?? '');
        this.nextMinSize = parseInt(this.nextNode.dataset['minSize'] ?? '');
        this.preSize = this.getOffsetSize(prev);
        this.nextSize = this.getOffsetSize(next);
        this.sumSize = this.preSize + this.nextSize;
        this.previousGrow = Number(prev.style.flexGrow);
        this.nextGrow = Number(next.style.flexGrow);
        this.sumGrow = this.previousGrow + this.nextGrow;
    }
    isShouldIgnore(md: MouseEvent) {
        return (md.target as any).tagName === 'I';
    }
    onMouseDown(event: MouseEvent) {
        if (this.isShouldIgnore(event)) {
            return;
        }
        event.preventDefault();
        this.init();
        this.lastPos = this.getMousePagePos(event);
        window.addEventListener('mousemove', this.mouseMoveListener);
        window.addEventListener('mouseup', this.mouseUpListener);
    }
    get isPreReachMinSize() {
        return this.preSize <= this.previousMinSize;
    }
    get isNextReachMinSize() {
        return this.nextSize <= this.nextMinSize;
    }
    onMouseMove(event: MouseEvent) {
        if (this.isShouldIgnore(event)) {
            return;
        }
        let pos = this.getMousePagePos(event);
        const posDiff = pos - this.lastPos;
        if (
            this.props.isDisableQuickResize &&
            ((posDiff < 0 && this.isPreReachMinSize) ||
                (posDiff > 0 && this.isNextReachMinSize))
        ) {
            return;
        }
        this.preSize += posDiff;
        this.nextSize -= posDiff;
        if (this.preSize < 0) {
            this.nextSize += this.preSize;
            pos -= this.preSize;
            this.preSize = 0;
        }
        if (this.nextSize < 0) {
            this.preSize += this.nextSize;
            pos += this.nextSize;
            this.nextSize = 0;
        }

        if (this.isPreReachMinSize) {
            this.addHiddenWidgetClassName(this.preNode);
        } else {
            this.removeHiddenWidgetClassname(this.preNode);
        }
        if (this.isNextReachMinSize) {
            this.addHiddenWidgetClassName(this.nextNode);
        } else {
            this.removeHiddenWidgetClassname(this.nextNode);
        }
        const prevGrowNew = this.sumGrow * (this.preSize / this.sumSize);
        const nextGrowNew = this.sumGrow * (this.nextSize / this.sumSize);

        this.preNode.style.flexGrow = `${prevGrowNew}`;
        this.nextNode.style.flexGrow = `${nextGrowNew}`;

        this.lastPos = pos;
    }
    addHiddenWidgetClassName(divElement: HTMLDivElement) {
        if (this.props.isDisableQuickResize) {
            return;
        }
        divElement.classList.add(HIDDEN_WIDGET_CLASS);
    }
    removeHiddenWidgetClassname(divElement: HTMLDivElement) {
        divElement.classList.remove(HIDDEN_WIDGET_CLASS);
    }
    onMouseUp(event: MouseEvent) {
        if (this.isShouldIgnore(event)) {
            return;
        }
        if (!this.currentNode) {
            return;
        }
        window.removeEventListener('mousemove', this.mouseMoveListener);
        window.removeEventListener('mouseup', this.mouseUpListener);

        this.currentNode.classList.remove('active');
        if (this.preNode.classList.contains('hidden-widget')) {
            this.quicMove('left');
            return;
        }
        if (this.nextNode.classList.contains('hidden-widget')) {
            this.quicMove('right');
            return;
        }
        this.props.checkSize();
    }
    quicMove(type: string) {
        this.init();
        const isFirst = ['left', 'up'].includes(type);
        const dataFSizeKey = isFirst
            ? this.preNode.dataset['fs']
            : this.nextNode.dataset['fs'];
        if (dataFSizeKey !== undefined) {
            if (isFirst) {
                this.nextNode.style.flexGrow = `${this.sumGrow}`;
            } else {
                this.preNode.style.flexGrow = `${this.sumGrow}`;
            }
            this.props.disable(dataFSizeKey, [
                isFirst ? 'first' : 'second',
                isFirst ? this.previousGrow : this.nextGrow,
            ]);
        }
        this.currentNode.classList.remove('active');
    }
    componentDidMount() {
        const target = this.currentNode;
        if (target) {
            target.addEventListener('mousedown', (md) => {
                this.onMouseDown(md);
            });
        }
    }
    render() {
        const props = this.props;
        const moverChildren = props.isDisableQuickResize
            ? null
            : [
                  ['left', 'chevron-left'],
                  ['right', 'chevron-right'],
                  ['up', 'chevron-up'],
                  ['down', 'chevron-down'],
              ].map(([type, icon]) => {
                  return (
                      <i
                          key={type}
                          title={`Disable ${type}`}
                          className={`${type} bi bi-${icon}`}
                          onClick={(event) => {
                              event.stopPropagation();
                              this.quicMove(type);
                          }}
                      />
                  );
              });
        return (
            <div
                className={`flex-resize-actor ${props.type}`}
                onDoubleClick={() => {
                    const prevDefault =
                        this.preNode.dataset['fsDefault'] ?? '1';
                    const nextDefault =
                        this.nextNode.dataset['fsDefault'] ?? '1';
                    this.preNode.style.flexGrow = '';
                    this.preNode.style.flex = prevDefault;
                    this.nextNode.style.flexGrow = '';
                    this.nextNode.style.flex = nextDefault;
                    props.checkSize();
                }}
                ref={this.myRef}
            >
                <div className="mover">{moverChildren}</div>
            </div>
        );
    }
}
