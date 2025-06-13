import { use, useMemo } from 'react';
import { editor } from 'monaco-editor';

import { SelectedLyricContext } from './lyricHelpers';
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
            store.monacoEditor = null;
        },
    };
}

function BodyRenderComp({
    lyric,
}: Readonly<{
    lyric: Lyric;
}>) {
    const { setMonacoEditor, removeMonacoEditor } = useInit(lyric);
    return (
        <div
            className="w-100 h-100 overflow-hidden"
            ref={(div) => {
                if (div === null) {
                    return;
                }
                const monacoEditor = initEditor(lyric, div);
                setMonacoEditor(monacoEditor);
                return () => {
                    removeMonacoEditor();
                    monacoEditor.dispose();
                };
            }}
        />
    );
}

export default function LyricPreviewerComp() {
    const context = use(SelectedLyricContext);
    const selectedLyric = context?.selectedLyric ?? null;
    if (selectedLyric === null) {
        return (
            <div
                className={
                    'w-100 h-100 d-flex justify-content-center' +
                    ' align-items-center'
                }
            >
                <h3 className="text-muted">`No Lyric Selected</h3>
            </div>
        );
    }
    return (
        <div className="w-100 h-100 d-flex flex-column">
            <LyricMenuComp />
            <BodyRenderComp lyric={selectedLyric} />
        </div>
    );
}
