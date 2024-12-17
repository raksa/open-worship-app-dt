import { useState } from 'react';

import SlideItemEditorToolTitleComp from './SlideItemEditorToolTitleComp';
import CanvasItemText, { CanvasItemTextPropsType } from '../CanvasItemText';
import { useFontList } from '../../../server/fontHelpers';
import { FontListType } from '../../../server/appProvider';
import { useAppEffect } from '../../../helper/debuggerHelpers';
import { useCanvasControllerContext } from '../CanvasController';
import { useCanvasItemContext, useCanvasItemPropsContext } from '../CanvasItem';

export default function ToolsTextFontControlComp() {
    return (
        <SlideItemEditorToolTitleComp title='Font Size'>
            <div className='d-flex'>
                <FontSize />
            </div>
            <hr />
            <div className='d-flex'>
                <FontFamily />
            </div>
        </SlideItemEditorToolTitleComp>
    );
}
function FontSize() {
    const canvasController = useCanvasControllerContext();
    const canvasItem = useCanvasItemContext() as CanvasItemText;
    const props = useCanvasItemPropsContext<CanvasItemTextPropsType>();
    const [localFontSize, setLocalFontSize] = useState(props.fontSize);
    useAppEffect(() => {
        setLocalFontSize(props.fontSize);
    }, [canvasItem]);
    const applyFontSize = (fontSize: number) => {
        setLocalFontSize(fontSize);
        canvasItem.applyTextData({ fontSize });
        canvasController.fireEditEvent(canvasItem);
    };
    return (
        <div className='d-flex'>
            <input className='form-control' type='number'
                style={{ maxWidth: '100px' }}
                value={localFontSize}
                onChange={(event) => {
                    applyFontSize(parseInt(event.target.value, 10));
                }} />
            <select className='form-select form-select-sm'
                value={localFontSize}
                onChange={(event) => {
                    applyFontSize(parseInt(event.target.value, 10));
                }} >
                <option>--</option>
                {Array.from({ length: 20 }, (_, i) => (i + 1) * 15)
                    .reverse().map((n) => {
                        return <option key={n}
                            value={n}>{n}px</option>;
                    })}
            </select>
        </div>
    );
}
function FontFamily() {
    const canvasController = useCanvasControllerContext();
    const canvasItem = useCanvasItemContext() as CanvasItemText;
    const fontList = useFontList();
    const [localFontFamily, setLocalFontFamily] = useState(
        canvasItem.props.fontFamily ?? '',
    );
    const applyFontFamily = (fontFamily: string) => {
        setLocalFontFamily(fontFamily);
        canvasItem.applyTextData({
            fontFamily: fontFamily || null,
        });
        canvasController.fireEditEvent(canvasItem);
    };
    if (fontList === null) {
        return (
            <div>Loading Font ...</div>
        );
    }
    return (
        <div className='pb-2'>
            <div>
                <label htmlFor='text-font-family'>Font Family</label>
                <select id='text-font-family'
                    className='form-select form-select-sm'
                    value={localFontFamily}
                    onChange={(event) => {
                        if (event.target.value === '--') {
                            return;
                        }
                        applyFontFamily(event.target.value);
                    }} >
                    <option>--</option>
                    {Object.keys(fontList).map((ff) => {
                        return <option key={ff}
                            value={ff}>{ff}</option>;
                    })}
                </select>
            </div>
            {!!fontList[localFontFamily]?.length && (
                <FontWeight
                    fontWeight={''} fontFamily={localFontFamily}
                    fontList={fontList}
                />
            )}
        </div>
    );
}

function FontWeight({
    fontFamily, fontWeight, fontList,
}: Readonly<{
    fontWeight: string,
    fontFamily: string,
    fontList: FontListType,
}>) {
    const canvasController = useCanvasControllerContext();
    const canvasItem = useCanvasItemContext() as CanvasItemText;
    const [localFontWeight, setLocalFontWeight] = useState(fontWeight);
    useAppEffect(() => {
        setLocalFontWeight(fontWeight);
    }, [fontWeight]);
    const applyFontWeight = (newFontWeight: string) => {
        setLocalFontWeight(newFontWeight);
        canvasItem.applyTextData({
            fontWeight: newFontWeight || null,
        });
        canvasController.fireEditEvent(canvasItem);
    };
    return (
        <div>
            <label htmlFor='text-font-style'>Font Style</label>
            <select id='text-font-style'
                className='form-select form-select-sm'
                value={localFontWeight}
                onChange={(event) => {
                    applyFontWeight(event.target.value);
                }} >
                <option>--</option>
                {fontList[fontFamily].map((fs) => {
                    return (
                        <option key={fs}
                            value={fs}>{fs}</option>
                    );
                })}
            </select>
        </div>
    );
}
