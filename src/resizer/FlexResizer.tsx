import './FlexResizer.scss';

import React from 'react';

export type ResizerKindType = 'v' | 'h';
export interface Props {
    type: ResizerKindType,
    checkSize: () => void,
}
export default class FlexResizer extends React.Component<Props, {}> {
    myRef: React.RefObject<HTMLDivElement>;
    prevSize: number = 0;
    nextSize: number = 0;
    lastPos: number = 0;
    prevGrow: number = 0;
    nextGrow: number = 0;
    sumGrow: number = 0;
    sumSize: number = 0;
    mouseMoveListener: (mm: MouseEvent) => void;
    mouseUpListener: (mm: MouseEvent) => void;
    constructor(props: Props) {
        super(props);
        this.myRef = React.createRef();
        this.mouseMoveListener = (mm: MouseEvent) => this.onMouseMove(mm);
        this.mouseUpListener = (e) => this.onMouseUp(e);
    }
    get prev() {
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

        this.prevSize = this.getOffsetSize(prev);
        this.nextSize = this.getOffsetSize(next);
        this.sumSize = this.prevSize + this.nextSize;
        this.prevGrow = Number(prev.style.flexGrow);
        this.nextGrow = Number(next.style.flexGrow);
        this.sumGrow = this.prevGrow + this.nextGrow;
    }
    isShouldIgnore(md: MouseEvent) {
        return (md.target as any).tagName === 'I';
    }
    onMouseDown(e: MouseEvent) {
        if (this.isShouldIgnore(e)) {
            return;
        }
        e.preventDefault();
        this.init();
        this.lastPos = this.getMousePagePos(e);
        window.addEventListener('mousemove', this.mouseMoveListener);
        window.addEventListener('mouseup', this.mouseUpListener);
    }
    onMouseMove(e: MouseEvent) {
        if (this.isShouldIgnore(e)) {
            return;
        }
        let pos = this.getMousePagePos(e);
        const d = pos - this.lastPos;
        this.prevSize += d;
        this.nextSize -= d;
        if (this.prevSize < 0) {
            this.nextSize += this.prevSize;
            pos -= this.prevSize;
            this.prevSize = 0;
        }
        if (this.nextSize < 0) {
            this.prevSize += this.nextSize;
            pos += this.nextSize;
            this.nextSize = 0;
        }

        const prevGrowNew = this.sumGrow * (this.prevSize / this.sumSize);
        const nextGrowNew = this.sumGrow * (this.nextSize / this.sumSize);

        this.prev.style.flexGrow = `${prevGrowNew}`;
        this.next.style.flexGrow = `${nextGrowNew}`;

        this.lastPos = pos;
    }
    onMouseUp(e: MouseEvent) {
        if (this.isShouldIgnore(e)) {
            return;
        }
        const current = this.myRef.current;
        if (!current) {
            return;
        }
        current.classList.remove('active');
        window.removeEventListener('mousemove', this.mouseMoveListener);
        window.removeEventListener('mouseup', this.mouseUpListener);

        this.props.checkSize();
    }
    resetSize() {
        this.prev.style.flex = this.prev.dataset['fsDefault'] as string;
        this.next.style.flex = this.next.dataset['fsDefault'] as string;
    }
    quicMove(type: string) {
        this.init();
        if (['left', 'up'].includes(type)) {
            if (this.nextGrow === 0) {
                this.resetSize();
            } else {
                this.prev.style.flexGrow = '0';
                this.next.style.flexGrow = `${this.sumGrow}`;
            }
        } else {
            if (this.prevGrow === 0) {
                this.resetSize();
            } else {
                this.prev.style.flexGrow = `${this.sumGrow}`;
                this.next.style.flexGrow = '0';
            }
        }
    }
    componentDidMount() {
        const target = this.myRef.current;
        if (target) {
            target.addEventListener('mousedown', (md) => this.onMouseDown(md));
            target.addEventListener('mouseover', (e) => {
                if (e.currentTarget === e.target) {
                    target.classList.add('active');
                }
            });
            target.addEventListener('mouseout', () => target.classList.remove('active'));
        }
    }
    render() {
        return (
            <div className={`flex-resizer ${this.props.type}`} ref={this.myRef}>
                <div className='mover'>
                    {[['left', 'chevron-left'], ['right', 'chevron-right'],
                    ['up', 'chevron-up'], ['down', 'chevron-down']].map(([type, icon], i) => {
                        return (
                            <i key={i} className={`${type} bi bi-${icon}`} onClick={(e) => {
                                e.stopPropagation();
                                this.quicMove(type);
                            }} />
                        );
                    })}
                </div>
            </div>
        );
    }
}
