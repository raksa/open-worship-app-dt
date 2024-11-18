import { useState } from 'react';

import { AppColorType } from '../../others/color/colorHelpers';
import { usePFTMEvents } from '../screenEventHelpers';
import ScreenFTManager from '../ScreenFTManager';

export default function Appearance() {
    const [color, setColor] = useState(
        ScreenFTManager.textStyleTextColor);
    const [fontSize, setFontSize] = useState(
        ScreenFTManager.textStyleTextFontSize);
    usePFTMEvents(['text-style'], undefined, () => {
        setColor(ScreenFTManager.textStyleTextColor);
        setFontSize(ScreenFTManager.textStyleTextFontSize);
    });
    const setColorToStyle = (newColor: AppColorType) => {
        ScreenFTManager.applyTextStyle({
            color: newColor,
        });
    };
    const setFontSizeToStyle = (newFontSize: number) => {
        ScreenFTManager.applyTextStyle({
            fontSize: newFontSize,
        });
    };
    return (
        <div>
            <span className='p-'>
                Font Size <span className='badge bg-success'>
                    ({fontSize}px)
                </span>
            </span>-
            <div className='btn-group control'>
                <button className='btn btn-sm btn-info'
                    type='button'
                    onClick={() => {
                        setFontSizeToStyle(fontSize - 1);
                    }}>{'<'}</button>
                <button className='btn btn-sm btn-info'
                    type='button'
                    onClick={() => {
                        setFontSizeToStyle(fontSize + 1);
                    }}>{'>'}</button>
            </div>
            <input className='float-end' type='color'
                onChange={(event) => {
                    setColorToStyle(event.target.value as AppColorType);
                }}
                value={color} />
            <div>
                <input className='form-range'
                    type='range' min='1'
                    max={ScreenFTManager.maxTextStyleTextFontSize}
                    value={fontSize} onChange={(event) => {
                        setFontSizeToStyle(parseInt(event.target.value, 10));
                    }} />
            </div>
        </div>
    );
}
