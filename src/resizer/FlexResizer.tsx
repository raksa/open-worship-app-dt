import './FlexResizer.scss';

import React from 'react';
import { getSetting, setSetting } from '../helper/settingHelper';

export interface Props {
    type: 'v' | 'h',
    settingName: string,
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
        this.mouseUpListener = () => this.onMouseUp();
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
    onMouseDown(md: MouseEvent) {
        md.preventDefault();
        this.init();
        this.lastPos = this.getMousePagePos(md);
        window.addEventListener('mousemove', this.mouseMoveListener);
        window.addEventListener('mouseup', this.mouseUpListener);
    }
    onMouseMove(mm: MouseEvent) {
        let pos = this.getMousePagePos(mm);
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
    onMouseUp() {
        const current = this.myRef.current;
        if (!current) {
            return;
        }
        current.classList.remove('active');
        window.removeEventListener('mousemove', this.mouseMoveListener);
        window.removeEventListener('mouseup', this.mouseUpListener);

        checkSize(this.props.settingName);
    }
    resetSize() {
        this.prev.style.flex = this.prev.dataset['fsDefault'] as string;
        this.next.style.flex = this.next.dataset['fsDefault'] as string;
    }
    quicMove(type: string) {
        this.init();
        const smallest = 0.001;
        const min = this.sumGrow * smallest;
        const max = this.sumGrow - min;
        if (['left', 'up'].includes(type)) {
            if (this.nextGrow / this.sumGrow <= smallest) {
                this.resetSize();
            } else {
                this.prev.style.flexGrow = `${min}`;
                this.next.style.flexGrow = `${max}`;
            }
        } else {
            if (this.prevGrow / this.sumGrow <= smallest) {
                this.resetSize();
            } else {
                this.prev.style.flexGrow = `${max}`;
                this.next.style.flexGrow = `${min}`;
            }
        }
        checkSize(this.props.settingName);
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
                            <div key={i} className={type}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    this.quicMove(type);
                                }}>
                                <i className={`bi bi-${icon}`} />
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }
}

export type Size = { [key: string]: string };
function checkSize(settingName: string) {
    const size: Size = {};
    const rowItems: HTMLDivElement[] = Array.from(document.querySelectorAll('[data-fs]'));
    rowItems.forEach((item) => {
        size[item.getAttribute('data-fs') as string] = item.style.flex;
    });
    setSetting(settingName, JSON.stringify(size));
}

export function getPresentingFlexSize(settingName: string, defaultSize: Size): Size {
    const sizeStr = getSetting(settingName);
    try {
        const size = JSON.parse(sizeStr);
        if (Object.keys(defaultSize).every((k) => size[k] !== undefined)) {
            return size;
        }
    } catch (error) {
        setSetting(settingName, JSON.stringify(defaultSize));
    }
    return defaultSize;
}
