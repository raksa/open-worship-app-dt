import './Tools.scss';

import { ReactChild, useState } from 'react';
import { slideListEventListenerGlobal, useSlideBoxEditing } from '../event/SlideListEventListener';
import ColorPicker from '../others/ColorPicker';
import {
    HAlignmentEnum,
    HTML2ReactChild,
    VAlignmentEnum,
} from '../helper/slideHelper';
import { useStateSettingString } from '../helper/settingHelper';

export default function Tools({ scale, applyScale, setScale, minScale, maxScale, scaleStep }: {
    scale: number, applyScale: (isUp: boolean) => void, setScale: (newScale: number) => void,
    minScale: number, maxScale: number, scaleStep: number
}) {
    const [data, setData] = useState<HTML2ReactChild | null>(null);
    // t: text, b: box
    const [tabType, setTabType] = useStateSettingString('editor-tools-tab', 't');
    useSlideBoxEditing((newData) => {
        setData(newData);
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
                            min={minScale} max={maxScale} step={scaleStep}
                            value={scale} onWheel={(e) => applyScale(e.deltaY > 0)} />
                    </div>
                </div>
            </div>
            <div className='tools-body d-flex flex-row flex-fill'>
                {data && <>
                    {tabType === 't' && <ToolsText data={data} />}
                    {tabType === 'b' && <ToolsBackground data={data} />}
                </>}
            </div>
        </div>
    );
}
function ToolsText({ data }: { data: HTML2ReactChild }) {
    const [color, setColor] = useState<string>(data.color);
    const [fontSize, setFontSize] = useState<number>(data.fontSize);
    const onColorChange = (newColor: string) => {
        setColor(newColor);
        slideListEventListenerGlobal.tooling({ text: { color: newColor } });
    };
    const onFontSizeChange = (n: number) => {
        setFontSize(n);
        slideListEventListenerGlobal.tooling({ text: { fontSize: n } });
    };
    return (
        <div className='d-flex'>
            <Tool>
                <ColorPicker color={color} onColorChange={onColorChange} />
            </Tool>
            <Tool title='Text Alignment'>
                <Align isText onData={(newData) => slideListEventListenerGlobal.tooling({ text: newData })} />
            </Tool>
            <Tool title='Font Size'>
                <input className='form-control' type="number" style={{ maxWidth: '100px' }}
                    value={fontSize} onChange={(e) => onFontSizeChange(+e.target.value)} />
                <select className="form-select form-select-sm" value={fontSize}
                    onChange={(e) => {
                        onFontSizeChange(+e.target.value);
                    }} >
                    <option>--</option>
                    {Array.from({ length: 20 }, (_, i) => (i + 1) * 15)
                        .reverse().map((n, i) => {
                            return <option key={`${i}`} value={n}>{n}px</option>;
                        })}
                </select>
            </Tool>
            <Tool title='Rotate'>
                <button className='btn btn-info' onClick={() => {
                    slideListEventListenerGlobal.tooling({ box: { rotate: 0 } });
                }}
                >UnRotate</button>
            </Tool>
        </div>
    );
}
function ToolsBackground({ data }: { data: HTML2ReactChild }) {
    const [color, setColor] = useState<string>(data.backgroundColor);
    const onColorChange = (newColor: string) => {
        setColor(newColor);
        slideListEventListenerGlobal.tooling({ box: { backgroundColor: newColor } });
    };
    return (
        <>
            <Tool title='Background Color'>
                <ColorPicker color={color} onColorChange={onColorChange} />
            </Tool>
            <Tool title='Box Alignment'>
                <Align onData={(newData) => {
                    slideListEventListenerGlobal.tooling({ box: newData });
                }} />
            </Tool>
            <Tool title='Box Layer'>
                <button className='btn btn-info' onClick={() => {
                    slideListEventListenerGlobal.tooling({ box: { layerBack: true } });
                }}><i className="bi bi-layer-backward" /></button>
                <button className='btn btn-info' onClick={() => {
                    slideListEventListenerGlobal.tooling({ box: { layerFront: true } });
                }}><i className="bi bi-layer-forward" /></button>
            </Tool>
        </>
    );
}
function Tool({ title, children }: { title?: string, children: ReactChild | ReactChild[] }) {
    return (
        <div className='tool'>
            {title && <div>{title}</div>}
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