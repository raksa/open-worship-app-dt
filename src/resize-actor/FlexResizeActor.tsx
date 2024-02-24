import './FlexResizeActor.scss';

import { Component, RefObject, createRef } from 'react';

import { DisabledType } from './flexSizeHelpers';

export const HIDDEN_WIDGET_CLASS = 'hidden-widget';
export const ACTIVE_HIDDEN_WIDGET_CLASS = 'active-hidden-widget';
function checkIsActiveHiddenWidgetNode(node: HTMLDivElement) {
    return node.classList.contains(ACTIVE_HIDDEN_WIDGET_CLASS);
}

export type ResizeKindType = 'v' | 'h';
export interface Props {
    type: ResizeKindType,
    checkSize: () => void,
    disable: (dataFSizeKey: string, target: DisabledType) => void,
    isDisableQuickResize: boolean,
}
export default class FlexResizeActor extends Component<Props, {}> {
    myRef: RefObject<HTMLDivElement>;
    lastPos: number = 0;
    previousMinSize: number = 0;
    nextMinSize: number = 0;
    previousSize: number = 0;
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
        return this.myRef.current as HTMLDivElement;
    }
    private getSibling(node: HTMLDivElement, isNext: boolean) {
        if (isNext) {
            return node.nextElementSibling as HTMLDivElement;
        }
        return node.previousElementSibling as HTMLDivElement;
    }
    get preNode() {
        let node = this.currentNode.previousElementSibling as HTMLDivElement;
        while (checkIsActiveHiddenWidgetNode(node)) {
            node = this.getSibling(node, false);
        }
        return node;
    }
    get nextNode() {
        let node = this.currentNode.nextElementSibling as HTMLDivElement;
        while (checkIsActiveHiddenWidgetNode(node)) {
            node = this.getSibling(node, true);
        }
        return node;
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
        const current = this.myRef.current;
        if (!current) {
            return;
        }
        const prev = current.previousElementSibling as HTMLDivElement;
        const next = current.nextElementSibling as HTMLDivElement;
        if (!prev || !next) {
            return;
        }
        current.classList.add('active');

        this.previousMinSize = +(this.preNode.dataset['minSize'] || '');
        this.nextMinSize = +(this.nextNode.dataset['minSize'] || '');
        this.previousSize = this.getOffsetSize(prev);
        this.nextSize = this.getOffsetSize(next);
        this.sumSize = this.previousSize + this.nextSize;
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
    onMouseMove(event: MouseEvent) {
        if (this.isShouldIgnore(event)) {
            return;
        }
        let pos = this.getMousePagePos(event);
        const d = pos - this.lastPos;
        this.previousSize += d;
        this.nextSize -= d;
        if (this.previousSize < 0) {
            this.nextSize += this.previousSize;
            pos -= this.previousSize;
            this.previousSize = 0;
        }
        if (this.nextSize < 0) {
            this.previousSize += this.nextSize;
            pos += this.nextSize;
            this.nextSize = 0;
        }

        if (this.previousSize < this.previousMinSize) {
            this.addHideWidget(this.preNode);
        } else {
            this.removeHideWidget(this.preNode);
        }
        if (this.nextSize < this.nextMinSize) {
            this.addHideWidget(this.nextNode);
        } else {
            this.removeHideWidget(this.nextNode);
        }
        const prevGrowNew = this.sumGrow * (this.previousSize / this.sumSize);
        const nextGrowNew = this.sumGrow * (this.nextSize / this.sumSize);

        this.preNode.style.flexGrow = `${prevGrowNew}`;
        this.nextNode.style.flexGrow = `${nextGrowNew}`;

        this.lastPos = pos;
    }
    addHideWidget(divElement: HTMLDivElement) {
        if (this.props.isDisableQuickResize) {
            return;
        }
        divElement.classList.add(HIDDEN_WIDGET_CLASS);
    }
    removeHideWidget(divElement: HTMLDivElement) {
        divElement.classList.remove(HIDDEN_WIDGET_CLASS);
    }
    onMouseUp(event: MouseEvent) {
        if (this.isShouldIgnore(event)) {
            return;
        }
        const current = this.myRef.current;
        if (!current) {
            return;
        }
        window.removeEventListener('mousemove', this.mouseMoveListener);
        window.removeEventListener('mouseup', this.mouseUpListener);

        current.classList.remove('active');
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
        const dataFSizeKey = isFirst ?
            this.preNode.dataset['fs'] :
            this.nextNode.dataset['fs'];
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
        this.myRef.current?.classList.remove('active');
    }
    componentDidMount() {
        const target = this.myRef.current;
        if (target) {
            target.addEventListener('mousedown', (md) => {
                this.onMouseDown(md);
            });
        }
    }
    render() {
        const props = this.props;
        const moverChildren = props.isDisableQuickResize ? null : [
            ['left', 'chevron-left'],
            ['right', 'chevron-right'],
            ['up', 'chevron-up'],
            ['down', 'chevron-down'],
        ].map(([type, icon]) => {
            return (
                <i key={type}
                    title={`Disable ${type}`}
                    className={`${type} bi bi-${icon}`}
                    onClick={(event) => {
                        event.stopPropagation();
                        this.quicMove(type);
                    }} />
            );
        });
        return (
            <div className={`flex-resize-actor ${props.type}`}
                onDoubleClick={() => {
                    const prevGrowNew = this.preNode.dataset['fsDefault'] || 1;
                    const nextGrowNew = this.nextNode.dataset['fsDefault'] || 1;
                    this.preNode.style.flex = `${prevGrowNew}`;
                    this.preNode.style.flexGrow = '';
                    this.nextNode.style.flex = `${nextGrowNew}`;
                    this.nextNode.style.flexGrow = '';
                    props.checkSize();
                }}
                ref={this.myRef}>
                <div className='mover'>
                    {moverChildren}
                </div>
            </div>
        );
    }
}
