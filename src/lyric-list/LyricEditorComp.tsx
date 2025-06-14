import { useMemo } from 'react';
import { editor } from 'monaco-editor';

import { useSelectedLyricContext } from './lyricHelpers';
import Lyric from './Lyric';
import LyricMenuComp from './LyricMenuComp';
import { useFileSourceEvents } from '../helper/dirSourceHelpers';

function initEditor(lyric: Lyric, div: HTMLDivElement) {
    let monacoEditor: editor.IStandaloneCodeEditor | null = null;
    monacoEditor = editor.create(div, {
        value: '',
        language: 'markdown',
        theme: 'vs-dark',
        fontSize: 17,
        automaticLayout: true,
    });
    monacoEditor.onDidChangeModelContent(async () => {
        const editorContent = monacoEditor.getValue();
        const lyricContent = await lyric.getContent();
        if (editorContent === lyricContent) {
            return;
        }
        lyric.setContent(editorContent);
    });
    return monacoEditor;
}

function useInit(lyric: Lyric) {
    const store = useMemo(() => {
        return { monacoEditor: null as editor.IStandaloneCodeEditor | null };
    }, []);
    const loadLyricContent = async (
        monacoEditor1?: editor.IStandaloneCodeEditor | null,
    ) => {
        monacoEditor1 = monacoEditor1 ?? store.monacoEditor;
        if (monacoEditor1 === null) {
            return;
        }
        const lyricContent = await lyric.getContent();
        if (lyricContent === null) {
            return;
        }
        const editorContent = monacoEditor1.getValue();
        if (editorContent === lyricContent) {
            return;
        }
        monacoEditor1.setValue(lyricContent);
    };
    useFileSourceEvents(['update'], loadLyricContent, [lyric], lyric.filePath);
    return {
        setMonacoEditor: (monacoEditor1: editor.IStandaloneCodeEditor) => {
            store.monacoEditor = monacoEditor1;
            loadLyricContent(monacoEditor1);
        },
        removeMonacoEditor: () => {
            const monacoEditor = store.monacoEditor;
            store.monacoEditor = null;
            monacoEditor?.dispose();
        },
    };
}

export default function LyricEditorComp1() {
    const selectedLyric = useSelectedLyricContext();
    const { setMonacoEditor, removeMonacoEditor } = useInit(selectedLyric);
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
                    setMonacoEditor(monacoEditor);
                    return () => {
                        removeMonacoEditor();
                    };
                }}
            />
        </div>
    );
}

// Monaco pasting not working, fallback to textarea
export function LyricEditorComp2() {
    const selectedLyric = useSelectedLyricContext();
    return (
        <div className="w-100 h-100 d-flex flex-column">
            <LyricMenuComp />
            <textarea
                className="w-100 h-100"
                ref={(target) => {
                    if (target === null) {
                        return;
                    }
                    selectedLyric.getContent().then((content) => {
                        target.value = content;
                    });
                }}
                onChange={(event) => {
                    const value = event.target.value;
                    selectedLyric.setContent(value);
                }}
            />
        </div>
    );
}
