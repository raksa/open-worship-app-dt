import './FlexResizeActor.scss';

import { Component, RefObject, createRef } from 'react';
import { DisabledType } from './flexSizeHelpers';

const HIDDEN_WIDGET_CLASS = 'hidden-widget';

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
    get previous() {
        return this.myRef.current?.previousElementSibling as HTMLDivElement;
    }
    get next() {
        return this.myRef.current?.nextElementSibling as HTMLDivElement;
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

        this.previousMinSize = +(this.previous.dataset['minSize'] || '');
        this.nextMinSize = +(this.next.dataset['minSize'] || '');
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
            this.addHideWidget(this.previous);
        } else {
            this.removeHideWidget(this.previous);
        }
        if (this.nextSize < this.nextMinSize) {
            this.addHideWidget(this.next);
        } else {
            this.removeHideWidget(this.next);
        }
        const prevGrowNew = this.sumGrow * (this.previousSize / this.sumSize);
        const nextGrowNew = this.sumGrow * (this.nextSize / this.sumSize);

        this.previous.style.flexGrow = `${prevGrowNew}`;
        this.next.style.flexGrow = `${nextGrowNew}`;

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
        if (this.previous.classList.contains('hidden-widget')) {
            this.quicMove('left');
            return;
        }
        if (this.next.classList.contains('hidden-widget')) {
            this.quicMove('right');
            return;
        }
        this.props.checkSize();
    }
    quicMove(type: string) {
        this.init();
        const isFirst = ['left', 'up'].includes(type);
        const dataFSizeKey = isFirst ?
            this.previous.dataset['fs'] :
            this.next.dataset['fs'];
        if (dataFSizeKey !== undefined) {
            if (isFirst) {
                this.next.style.flexGrow = `${this.sumGrow}`;
            } else {
                this.previous.style.flexGrow = `${this.sumGrow}`;
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
                    const prevGrowNew = this.previous.dataset['fsDefault'] || 1;
                    const nextGrowNew = this.next.dataset['fsDefault'] || 1;
                    this.previous.style.flex = `${prevGrowNew}`;
                    this.previous.style.flexGrow = '';
                    this.next.style.flex = `${nextGrowNew}`;
                    this.next.style.flexGrow = '';
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
