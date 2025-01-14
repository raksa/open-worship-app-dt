import { useState } from 'react';

import { AppColorType } from '../../others/color/colorHelpers';
import { useScreenFullTextManagerEvents } from '../managers/screenEventHelpers';
import ScreenFullTextManager from '../managers/ScreenFullTextManager';
import ScreenVaryAppDocumentManager from '../managers/ScreenVaryAppDocumentManager';
import AppRangeComp from '../../others/AppRangeComp';
import { getAllScreenManagers } from '../managers/screenManagerHelpers';

export default function Appearance() {
    const [color, setColor] = useState(
        ScreenFullTextManager.textStyleTextColor,
    );
    const [fontSize, setFontSize] = useState(
        ScreenFullTextManager.textStyleTextFontSize,
    );
    useScreenFullTextManagerEvents(['text-style'], undefined, () => {
        setColor(ScreenFullTextManager.textStyleTextColor);
        setFontSize(ScreenFullTextManager.textStyleTextFontSize);
    });
    const setColorToStyle = (newColor: AppColorType) => {
        ScreenFullTextManager.applyTextStyle({
            color: newColor,
        });
    };
    const setFontSizeToStyle = (newFontSize: number) => {
        ScreenFullTextManager.applyTextStyle({
            fontSize: newFontSize,
        });
    };
    return (
        <div>
            <span className="p-">
                Font Size{' '}
                <span className="badge bg-success">({fontSize}px)</span>
            </span>
            -
            <div className="btn-group control">
                <button
                    className="btn btn-sm btn-info"
                    type="button"
                    onClick={() => {
                        setFontSizeToStyle(fontSize - 1);
                    }}
                >
                    {'<'}
                </button>
                <button
                    className="btn btn-sm btn-info"
                    type="button"
                    onClick={() => {
                        setFontSizeToStyle(fontSize + 1);
                    }}
                >
                    {'>'}
                </button>
            </div>
            <input
                className="float-end"
                type="color"
                onChange={(event) => {
                    setColorToStyle(event.target.value as AppColorType);
                }}
                value={color}
            />
            <div>
                <AppRangeComp
                    value={fontSize}
                    title="Font Size"
                    setValue={setFontSizeToStyle}
                    defaultSize={{
                        size: fontSize,
                        min: 1,
                        max: ScreenFullTextManager.maxTextStyleTextFontSize,
                        step: 1,
                    }}
                />
            </div>
            <hr />
            <PdfAppearanceSettingComp />
        </div>
    );
}

function PdfAppearanceSettingComp() {
    const [isFullWidth, setIsFullWidth] = useState(
        ScreenVaryAppDocumentManager.isPdfFullWidth,
    );
    const setIsFullWidth1 = (isFullWidth: boolean) => {
        ScreenVaryAppDocumentManager.isPdfFullWidth = isFullWidth;
        for (const { screenVaryAppDocumentManager } of getAllScreenManagers()) {
            screenVaryAppDocumentManager.render();
            screenVaryAppDocumentManager.sendSyncScreen();
        }
        setIsFullWidth(isFullWidth);
    };
    return (
        <div className="d-flex">
            <small>PDF Setting:</small>
            <div>
                <div className="btn-group" role="group">
                    <input
                        type="radio"
                        className="btn-check"
                        name="setting-not-full-width"
                        id="setting-not-full-width"
                        checked={!isFullWidth}
                        onChange={() => {
                            setIsFullWidth1(false);
                        }}
                    />
                    <label
                        className="btn btn-outline-info"
                        htmlFor="setting-not-full-width"
                    >
                        Not Full Width
                    </label>
                    <input
                        type="radio"
                        className="btn-check"
                        name="setting-not-full-width"
                        id="setting-full-width"
                        checked={isFullWidth}
                        onChange={() => {
                            setIsFullWidth1(true);
                        }}
                    />
                    <label
                        className="btn btn-outline-info"
                        htmlFor="setting-full-width"
                    >
                        Full Width
                    </label>
                </div>
            </div>
        </div>
    );
}
