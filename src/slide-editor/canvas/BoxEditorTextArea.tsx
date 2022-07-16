import { useEffect, useState } from 'react';

export default function BoxEditorTextArea({ color, text, setText }: {
    color?: string, text: string,
    setText: (t: string) => void,
}) {
    const [localText, setLocalText] = useState(text);
    useEffect(() => {
        setLocalText(text);
    }, [text]);
    return (
        <textarea style={{ color }}
            className='w-100 h-100' value={localText}
            onChange={(e) => {
                const newText = e.target.value;
                setLocalText(newText);
                setText(newText);
            }} />
    );
}
