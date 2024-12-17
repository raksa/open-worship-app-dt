import { CSSProperties, useState } from 'react';

import { useAppEffect } from '../../../helper/debuggerHelpers';
import CanvasItemText, { CanvasItemTextPropsType } from '../CanvasItemText';

function calcAlignmentStyle(props: CanvasItemTextPropsType) {
    let height = 0;
    if (props.textVerticalAlignment !== 'start') {
        height = (props.height / 2) - props.fontSize;
    }
    const style: { textAlign: string } = {
        ...{
            textAlign: props.horizontalAlignment,
        }, ...{
            padding: height + 'px 0',
            overflow: 'hidden',
        },
    };
    return style as CSSProperties;
}

export default function BoxEditorTextAreaComp({ props, setText }: Readonly<{
    props: CanvasItemTextPropsType,
    setText: (newText: string) => void,
}>) {
    const [localText, setLocalText] = useState(props.text);
    useAppEffect(() => {
        setLocalText(props.text);
    }, [props.text]);
    const style = CanvasItemText.genStyle(props);
    return (
        <textarea style={{
            ...style, ...calcAlignmentStyle(props),
        }}
            className='w-100 h-100'
            value={localText}
            autoFocus
            onFocus={(event) => {
                const target = event.target as HTMLTextAreaElement;
                (
                    target.selectionStart = target.selectionEnd =
                    target.value.length
                );
            }}
            onChange={(event) => {
                const newText = event.target.value;
                setLocalText(newText);
                setText(newText);
            }}
        />
    );
}
