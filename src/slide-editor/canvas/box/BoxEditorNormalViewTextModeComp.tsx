import { CSSProperties } from 'react';

import CanvasItemText, { CanvasItemTextPropsType } from '../CanvasItemText';
import { BENViewErrorRender } from './BoxEditorNormalViewErrorComp';
import { handleError } from '../../../helper/errorHelpers';
import { useCanvasItemPropsContext } from '../CanvasItem';
import BoxEditorNormalWrapperComp from './BoxEditorNormalWrapperComp';

export default function BoxEditorNormalViewTextModeComp({
    style,
}: Readonly<{
    style: CSSProperties;
}>) {
    return (
        <BoxEditorNormalWrapperComp style={style}>
            <BoxEditorNormalTextRender />
        </BoxEditorNormalWrapperComp>
    );
}

export function BoxEditorNormalTextRender() {
    const props = useCanvasItemPropsContext<CanvasItemTextPropsType>();
    try {
        CanvasItemText.validate(props);
    } catch (error) {
        handleError(error);
        return <BENViewErrorRender />;
    }
    const htmlText = props.text.replace(/\n/g, '<br />');
    return (
        <div
            className="w-100 h-100"
            style={CanvasItemText.genStyle(props)}
            dangerouslySetInnerHTML={{
                __html: htmlText,
            }}
        />
    );
}
