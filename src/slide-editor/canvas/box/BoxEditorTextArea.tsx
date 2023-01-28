import { useEffect, useState } from 'react';
import { AppColorType } from '../../../others/color/helpers';

export default function BoxEditorTextArea({ color, text, setText }: {
    color?: AppColorType, text: string,
    setText: (t: string) => void,
}) {
    const [localText, setLocalText] = useState(text);
    useEffect(() => {
        setLocalText(text);
    }, [text]);
    return (
        <textarea style={{ color }}
            className='w-100 h-100' value={localText}
            onChange={(event) => {
                const newText = event.target.value;
                setLocalText(newText);
                setText(newText);
            }} />
    );
}
