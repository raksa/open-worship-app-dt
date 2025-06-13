import { editor } from 'monaco-editor';

import { SelectedLyricContext } from './lyricHelpers';
import Lyric from './Lyric';
import LyricMenuComp from './LyricMenuComp';
import { use } from 'react';

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
    const context = use(SelectedLyricContext);
    const selectedLyric = context?.selectedLyric ?? null;
    if (selectedLyric === null) {
        return (
            <div className="w-100 h-100 d-flex justify-content-center align-items-center">
                <h3 className="text-muted">`No Lyric Selected</h3>
            </div>
        );
    }
    return (
        <div className="w-100 h-100 d-flex flex-column">
            <LyricMenuComp />
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
        </div>
    );
}
