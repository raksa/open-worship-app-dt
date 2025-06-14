import { useMemo } from 'react';
import { editor, KeyMod, KeyCode } from 'monaco-editor';

import { useSelectedLyricContext } from './lyricHelpers';
import Lyric from './Lyric';
import LyricMenuComp from './LyricMenuComp';
import { useFileSourceEvents } from '../helper/dirSourceHelpers';
import { genTimeoutAttempt } from '../helper/helpers';
import { useStateSettingBoolean } from '../helper/settingHelpers';

async function getCopiedText() {
    try {
        if (navigator.clipboard?.readText) {
            const text = await navigator.clipboard.readText();
            if (text.length > 0) {
                return text;
            }
        } else {
            console.error('Clipboard API not supported in this browser.');
        }
    } catch (err) {
        console.error('Failed to read clipboard contents:', err);
    }
    return null;
}

function initEditor(
    div: HTMLDivElement,
    options: {
        isWrapText: boolean;
        setIsWrapText: (isWrapText: boolean) => void;
    },
) {
    let monacoEditor: editor.IStandaloneCodeEditor | null = null;
    monacoEditor = editor.create(div, {
        value: '',
        language: 'markdown',
        theme: 'vs-dark',
        fontSize: 17,
        minimap: {
            enabled: false,
        },
        wordWrap: options.isWrapText ? 'on' : 'off',
        scrollbar: {},
    });
    // add context menu
    monacoEditor.addAction({
        id: 'toggle-wrap-text',
        label: 'Toggle Wrap Text',
        contextMenuGroupId: 'navigation',
        keybindings: [KeyMod.Alt | KeyCode.KeyZ],
        contextMenuOrder: 1.5,
        run: () => {
            options.setIsWrapText(!options.isWrapText);
        },
    });
    // TODO: fix Monaco native paste fail
    monacoEditor.addAction({
        id: 'paste',
        label: 'Paste',
        keybindings: [KeyMod.CtrlCmd | KeyCode.KeyV],
        run: async (editor) => {
            const clipboardText = await getCopiedText();
            if (!clipboardText) {
                return;
            }
            monacoEditor.executeEdits('paste', [
                {
                    range: editor.getSelection(),
                    text: clipboardText,
                } as any,
            ]);
        },
    });
    return monacoEditor;
}

function useInit(lyric: Lyric) {
    const store = useMemo(() => {
        return { monacoEditor: null as editor.IStandaloneCodeEditor | null };
    }, []);
    const attemptTimeout = useMemo(() => {
        return genTimeoutAttempt(500);
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
    useFileSourceEvents(
        ['update'],
        () => {
            attemptTimeout(loadLyricContent);
        },
        [lyric],
        lyric.filePath,
    );
    return {
        setMonacoEditor: (monacoEditor1: editor.IStandaloneCodeEditor) => {
            loadLyricContent(monacoEditor1);
            monacoEditor1.onDidChangeModelContent(async () => {
                const editorContent = monacoEditor1.getValue();
                const lyricContent = await lyric.getContent();
                if (editorContent === lyricContent) {
                    return;
                }
                lyric.setContent(editorContent);
            });
            store.monacoEditor = monacoEditor1;
            (window as any).monacoEditor = monacoEditor1;
        },
        removeMonacoEditor: () => {
            const monacoEditor = store.monacoEditor;
            store.monacoEditor = null;
            monacoEditor?.dispose();
        },
        store,
    };
}

export default function LyricEditorComp1() {
    const selectedLyric = useSelectedLyricContext();
    const { setMonacoEditor, removeMonacoEditor, store } =
        useInit(selectedLyric);
    const [isWrapText, setIsWrapText] = useStateSettingBoolean(
        'lytic-editor-wrap-text',
        false,
    );
    const setIsWrapText1 = (isWrapText: boolean) => {
        setIsWrapText(isWrapText);
        const monacoEditor = store.monacoEditor;
        if (monacoEditor === null) {
            return;
        }
        monacoEditor.updateOptions({
            wordWrap: isWrapText ? 'on' : 'off',
        });
        monacoEditor.layout();
        monacoEditor.focus();
    };
    return (
        <div className="w-100 h-100 d-flex flex-column">
            <div className="d-flex">
                <div className="input-group-text">
                    Wrap Text:{' '}
                    <input
                        className="form-check-input mt-0"
                        type="checkbox"
                        checked={isWrapText}
                        onChange={(event) => {
                            const checked = event.target.checked;
                            setIsWrapText1(checked);
                        }}
                    />
                </div>
                <div className="flex-grow-1">
                    <LyricMenuComp />
                </div>
            </div>
            <div
                className="w-100 h-100 overflow-hidden"
                ref={(div) => {
                    if (div === null) {
                        return;
                    }
                    const monacoEditor = initEditor(div, {
                        isWrapText,
                        setIsWrapText: setIsWrapText1,
                    });
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
    const [isWrapText, setIsWrapText] = useStateSettingBoolean(
        'lytic-editor-wrap-text',
        false,
    );
    const selectedLyric = useSelectedLyricContext();
    return (
        <div className="w-100 h-100 d-flex flex-column">
            <div className="d-flex">
                <div className="input-group-text">
                    Wrap Text:{' '}
                    <input
                        className="form-check-input mt-0"
                        type="checkbox"
                        checked={isWrapText}
                        onChange={(event) => {
                            const checked = event.target.checked;
                            setIsWrapText(checked);
                        }}
                    />
                </div>
                <LyricMenuComp />
            </div>
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
