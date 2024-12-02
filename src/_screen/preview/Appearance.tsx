import { useState } from 'react';

import { AppColorType } from '../../others/color/colorHelpers';
import { usePFTMEvents } from '../screenEventHelpers';
import ScreenFTManager from '../ScreenFTManager';
import ScreenSlideManager from '../ScreenSlideManager';
import ScreenManager from '../ScreenManager';
import AppRange from '../../others/AppRange';

export default function Appearance() {
    const [color, setColor] = useState(
        ScreenFTManager.textStyleTextColor,
    );
    const [fontSize, setFontSize] = useState(
        ScreenFTManager.textStyleTextFontSize,
    );
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
                    }}>
                    {'<'}
                </button>
                <button className='btn btn-sm btn-info'
                    type='button'
                    onClick={() => {
                        setFontSizeToStyle(fontSize + 1);
                    }}>
                    {'>'}
                </button>
            </div>
            <input className='float-end' type='color'
                onChange={(event) => {
                    setColorToStyle(event.target.value as AppColorType);
                }}
                value={color}
            />
            <div>
                <AppRange value={fontSize}
                    title='Font Size'
                    setValue={setFontSizeToStyle}
                    defaultSize={{
                        size: fontSize,
                        min: 1,
                        max: ScreenFTManager.maxTextStyleTextFontSize,
                        step: 1,
                    }}
                />
            </div>
            <hr />
            <PDFAppearanceSetting />
        </div>
    );
}

function PDFAppearanceSetting() {
    const [isFullWidth, setIsFullWidth] = useState(
        ScreenSlideManager.isPDFFullWidth,
    );
    const setIsFullWidth1 = (b: boolean) => {
        ScreenSlideManager.isPDFFullWidth = b;
        for (const { screenSlideManager } of ScreenManager.getAllInstances()) {
            screenSlideManager.render();
            screenSlideManager.sendSyncScreen();
        }
        setIsFullWidth(b);
    };
    return (
        <div className='d-flex'>
            <small>PDF Setting:</small>
            <div>
                <div className='btn-group' role='group'>
                    <input type='radio' className='btn-check'
                        name='setting-not-full-width'
                        id='setting-not-full-width'
                        checked={!isFullWidth}
                        onChange={() => {
                            setIsFullWidth1(false);
                        }}
                    />
                    <label className='btn btn-outline-info'
                        htmlFor='setting-not-full-width'>
                        Not Full Width
                    </label>
                    <input type='radio' className='btn-check'
                        name='setting-not-full-width'
                        id='setting-full-width'
                        checked={isFullWidth}
                        onChange={() => {
                            setIsFullWidth1(true);
                        }}
                    />
                    <label className='btn btn-outline-info'
                        htmlFor='setting-full-width'>
                        Full Width
                    </label>
                </div>
            </div>
        </div>
    );
}
