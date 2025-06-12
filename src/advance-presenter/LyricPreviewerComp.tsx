import { editor } from 'monaco-editor';

import { useSelectedLyricContext } from '../lyric-list/lyricHelpers';
import Lyric from '../lyric-list/Lyric';

function initEditor(lyric: Lyric, div: HTMLDivElement) {
    let monacoEditor: editor.IStandaloneCodeEditor | null = null;
    monacoEditor = editor.create(div, {
        value: '',
        language: 'markdown',
        theme: 'vs-dark',
        fontSize: 17,
        automaticLayout: true,
    });
    monacoEditor.onDidChangeModelContent(() => {
        lyric.setContent(monacoEditor.getValue());
    });
    return monacoEditor;
}

async function loadLyricContent(
    lyric: Lyric,
    monacoEditor: editor.IStandaloneCodeEditor,
) {
    const value = await lyric.getContent();
    if (value === null) {
        return;
    }
    monacoEditor.setValue(value);
}

export default function LyricPreviewerComp() {
    const selectedLyric = useSelectedLyricContext();
    return (
        <div
            className="w-100 h-100 overflow-hidden"
            ref={(div) => {
                if (div === null) {
                    return;
                }
                const monacoEditor = initEditor(selectedLyric, div);
                loadLyricContent(selectedLyric, monacoEditor);
                return () => {
                    monacoEditor.dispose();
                };
            }}
        />
    );
}
