import './Tools.scss';

import { ReactChild, useEffect, useState } from 'react';
import {
    slideListEventListener,
    useSlideBoxEditing,
} from '../event/SlideListEventListener';
import ColorPicker from '../others/ColorPicker';
import { HAlignmentEnum, HTML2ReactChildType, VAlignmentEnum } from './slideParser';
import { useStateSettingString } from '../helper/helpers';

export default function Tools({ scale, setScale }: {
    scale: number, setScale: (s: number) => void
}) {
    const [data, setData] = useState<HTML2ReactChildType | null>(null);
    // t: text, b: box
    const [tabType, setTabType] = useStateSettingString('editor-tools-tab', 't');
    useSlideBoxEditing((data) => {
        setData(data);
    });
    return (
        <div className="tools d-flex flex-column w-100 h-100">
            <div className="tools-header d-flex">
                <ul className="nav nav-tabs ">
                    <li className="nav-item">
                        <button className={`btn btn-link nav-link ${tabType === 't' ? 'active' : ''}`}
                            onClick={() => setTabType('t')}>
                            <i className="bi bi-blockquote-left" />
                            Text
                        </button>
                    </li>
                    <li className="nav-item">
                        <button className={`btn btn-link nav-link ${tabType === 'b' ? 'active' : ''}`}
                            onClick={() => setTabType('b')}>
                            <i className="bi bi-bounding-box-circles" />
                            Box
                        </button>
                    </li>
                </ul>
                <div className='align-self-end flex-fill d-flex justify-content-end'>
                    <span>{scale.toFixed(1)}x</span>
                    <div style={{ maxWidth: '200px' }}>
                        <input type="range" className='form-range'
                            onChange={(e) => setScale(+e.target.value)}
                            min="0.2" max="3" step="0.1" value={scale} onWheel={(e) => {
                                const isUp = e.deltaY > 0;
                                let newScale = scale += (isUp ? -1 : 1) * 0.1;
                                if (newScale < 0.2) {
                                    newScale = 0.2;
                                }
                                if (newScale > 3) {
                                    newScale = 3;
                                }
                                setScale(newScale);
                            }} />
                    </div>
                </div>
            </div>
            <div className='tools-body d-flex flex-row flex-fill'>
                {tabType === 't' && <ToolsText data={data} />}
                {tabType === 'b' && <ToolsBackground data={data} />}
            </div>
        </div>
    );
}
function ToolsText({ data }: { data: HTML2ReactChildType | null }) {
    const [color, setColor] = useState<string>('#ffffff');
    const [fontSize, setFontSize] = useState<number>(30);
    const onColorChange = (color: string) => {
        setColor(color);
        slideListEventListener.tooling({ text: { color } });
    };
    const onFontSizeChange = (n: number) => {
        setFontSize(n);
        slideListEventListener.tooling({ text: { fontSize: n } });
    };
    useEffect(() => {
        setColor(data === null ? '#ffffff' : data.color);
    }, [data]);
    return (
        <>
            <Tool title='Text Color'>
                <ColorPicker color={color} onColorChange={onColorChange} />
            </Tool>
            <Tool title='Text Alignment'>
                <Align isText onData={(data) => slideListEventListener.tooling({ text: data, })} />
            </Tool>
            <Tool title='Font Size'>
                <select className="form-select form-select-sm" value={fontSize}
                    onChange={(e) => {
                        onFontSizeChange(+e.target.value);
                    }} >
                    {Array.from({ length: 20 }, (_, i) => (i + 1) * 15)
                        .reverse().map((n, i) => {
                            return <option key={`${i}`} value={n}>{n}px</option>
                        })}
                </select>
            </Tool>
            <Tool title='Rotate'>
                <button className='btn btn-info' onClick={() => {
                    slideListEventListener.tooling({ box: { rotate: 0 } });
                }}
                >UnRotate</button>
            </Tool>
        </>
    );
}
function ToolsBackground({ data }: { data: HTML2ReactChildType | null }) {
    const [color, setColor] = useState<string>('#ffffff');
    const onColorChange = (color: string) => {
        setColor(color);
        slideListEventListener.tooling({ box: { backgroundColor: color } });
    };
    return (
        <>
            <Tool title='Background Color'>
                <ColorPicker color={color} onColorChange={onColorChange} />
            </Tool>
            <Tool title='Box Alignment'>
                <Align onData={(data) => {
                    slideListEventListener.tooling({ box: data })
                }} />
            </Tool>
            <Tool title='Box Layer'>
                <button className='btn btn-info' onClick={() => {
                    slideListEventListener.tooling({ box: { layerBack: true } });
                }}><i className="bi bi-layer-backward" /></button>
                <button className='btn btn-info' onClick={() => {
                    slideListEventListener.tooling({ box: { layerFront: true } });
                }}><i className="bi bi-layer-forward" /></button>
            </Tool>
        </>
    );
}
function Tool({ title, children }: { title: string, children: ReactChild | ReactChild[] }) {
    return (
        <div className='tool' style={{ maxWidth: '200px' }}>
            <div>{title}</div>
            <div>{children}</div>
        </div>
    );
}
function Align({ onData, isText }: {
    onData: (data: {
        verticalAlignment?: VAlignmentEnum,
        horizontalAlignment?: HAlignmentEnum,
    }) => void,
    isText?: boolean,
}) {
    return (
        <div>
            <button className='btn btn-info' onClick={() => {
                onData({ verticalAlignment: VAlignmentEnum.Top });
            }}><i className="bi bi-align-top" /></button>
            <button className='btn btn-info' onClick={() => {
                onData({ verticalAlignment: VAlignmentEnum.Center });
            }}><i className="bi bi-align-middle" /></button>
            <button className='btn btn-info' onClick={() => {
                onData({ verticalAlignment: VAlignmentEnum.Bottom });
            }}><i className="bi bi-align-bottom" /></button>
            <hr />
            {isText ? <>
                <button className='btn btn-info' onClick={() => {
                    onData({ horizontalAlignment: HAlignmentEnum.Left });
                }}><i className="bi bi-text-left" /></button>
                <button className='btn btn-info' onClick={() => {
                    onData({ horizontalAlignment: HAlignmentEnum.Center });
                }}><i className="bi bi-text-center" /></button>
                <button className='btn btn-info' onClick={() => {
                    onData({ horizontalAlignment: HAlignmentEnum.Right });
                }}><i className="bi bi-text-right" /></button>
            </> : <>
                <button className='btn btn-info' onClick={() => {
                    onData({ horizontalAlignment: HAlignmentEnum.Left });
                }}><i className="bi bi-align-start" /></button>
                <button className='btn btn-info' onClick={() => {
                    onData({ horizontalAlignment: HAlignmentEnum.Center });
                }}><i className="bi bi-align-center" /></button>
                <button className='btn btn-info' onClick={() => {
                    onData({ horizontalAlignment: HAlignmentEnum.Right });
                }}><i className="bi bi-align-end" /></button>
            </>}
        </div>
    );
}