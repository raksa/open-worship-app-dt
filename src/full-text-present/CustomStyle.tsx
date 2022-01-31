import './CustomStyle.scss';

import { useState } from 'react';
import fullTextPresentHelper from './fullTextPresentHelper';
import TextShadow from './TextShadow';
import { useStateSettingBoolean, useStateSettingString } from '../helper/helpers';
import { usePresentCtrlScrolling } from '../event/PresentEventListener';

export default function CustomStyle() {
    const [open, setOpen] = useStateSettingBoolean('open-full-text-present-custom-style');
    return (
        <div className="custom-style card pointer overflow-hidden border-white-round mt-1">
            <div className="card-header" onClick={() => setOpen(!open)}>
                <i className={`bi bi-chevron-${open ? 'down' : 'right'}`} />
                Custom Style
            </div>
            {open && <Body />}
        </div>
    );
}

function Body() {
    // a: appearance, s: shadow
    const [tabType, setTabType] = useStateSettingString('tull-text-present-custom-style-tab', 'a');
    return (
        <div className='card-body'>
            <div className="d-flex">
                <ul className="nav nav-tabs flex-fill">
                    <li className="nav-item">
                        <button className={`btn btn-link nav-link ${tabType === 'a' ?
                            'active' : 'highlight-border-bottom'}`}
                            onClick={() => setTabType('a')}>
                            Appearance
                        </button>
                    </li>
                    <li className="nav-item">
                        <button className={`btn btn-link nav-link ${tabType === 's' ?
                            'active' : 'highlight-border-bottom'}`}
                            onClick={() => setTabType('s')}>
                            Shadow
                        </button>
                    </li>
                </ul>
            </div>
            <div className='p-2'>
                {tabType === 'a' && <Appearance />}
                {tabType === 's' && <TextShadow />}
            </div>
        </div>
    );
}

function Appearance() {
    const [color, setColor] = useState(fullTextPresentHelper.textColor);
    const [fontSize, setFontSize] = useState(fullTextPresentHelper.textFontSize);
    const setColorToStyle = (color: string) => {
        setColor(color);
        fullTextPresentHelper.setStyle({ color });
    };
    const setFontSizeToStyle = (fontSize: number) => {
        setFontSize(fontSize);
        fullTextPresentHelper.setStyle({ fontSize });
    };
    usePresentCtrlScrolling((isUp) => {
        setFontSize(fullTextPresentHelper.textFontSize);
    });
    return (
        <div>
            <span className="p-">Font Size <span className="badge bg-success">({fontSize}px)</span></span>-
            <div className="btn-group control">
                <button type="button" className="btn btn-sm btn-info"
                    onClick={() => {
                        setFontSizeToStyle(fontSize - 1);
                    }}>{'<'}</button>
                <button type="button" className="btn btn-sm btn-info"
                    onClick={() => {
                        setFontSizeToStyle(fontSize + 1);
                    }}>{'>'}</button>
            </div>
            <input className="float-end" type="color" onChange={(e) => {
                const color = e.target.value;
                setColorToStyle(color);
            }} value={color} />
            <div>
                <input type="range" className="form-range" min="1" max="200"
                    value={fontSize} onChange={(e) => {
                        setFontSizeToStyle(+e.target.value);
                    }} />
            </div>
        </div>
    );
}
