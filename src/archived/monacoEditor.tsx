import { useState } from 'react';

import { createRoot } from 'react-dom/client';
import { getRootElement } from '../appInitHelpers';
import { editor } from 'monaco-editor';
import { getSetting, setSetting } from '../helper/settingHelpers';
import FileSource from '../helper/FileSource';
import { useFileSourceEvents } from '../helper/dirSourceHelpers';

const container = getRootElement<HTMLDivElement>();
const root = createRoot(container);

const VALUE_SETTING_NAME = 'monaco-editor-value';
function toSettingName(filePath: string) {
    return VALUE_SETTING_NAME + filePath;
}

function initEditor(div: HTMLDivElement, filePath: string) {
    let myEditor: editor.IStandaloneCodeEditor | null = null;
    const value = getSetting(toSettingName(filePath)) || '';
    const fileSource = FileSource.getInstance(filePath);
    myEditor = editor.create(div, {
        value,
        language: 'markdown',
        automaticLayout: true,
    });
    myEditor.onDidChangeModelContent(() => {
        fileSource.fireUpdateEvent();
    });
    return myEditor;
}

const editorsStore = new Map<string, editor.IStandaloneCodeEditor>();

function ActionButtonsComp({
    filePath,
}: Readonly<{
    filePath: string;
}>) {
    const [isChanged, setIsChanged] = useState(false);
    useFileSourceEvents(
        ['update'],
        () => {
            setIsChanged(true);
        },
        [],
        filePath,
    );
    return (
        <div>
            <button
                className="app-btn-save"
                disabled={!isChanged}
                onClick={() => {
                    const value = editorsStore.get(filePath)?.getValue();
                    if (value !== undefined) {
                        setSetting(toSettingName(filePath), value);
                        setIsChanged(false);
                    }
                }}
            >
                save
            </button>
        </div>
    );
}

function EditorComp({
    filePath,
}: Readonly<{
    filePath: string;
}>) {
    return (
        <div
            style={{
                width: '100%',
                height: '100%',
                backgroundColor: 'white',
                border: '1px solid black',
                overflow: 'hidden',
            }}
            ref={(div) => {
                if (div === null) {
                    return;
                }
                const myEditor = initEditor(div, filePath);
                editorsStore.set(filePath, myEditor);
                return () => {
                    editorsStore.delete(filePath);
                    myEditor.dispose();
                };
            }}
        />
    );
}

function MonacoMDEditorAppComp() {
    const filePath = '/a/b.md';
    return (
        <div
            style={{
                width: '600px',
                height: '800px',
                margin: 'auto',
            }}
        >
            <ActionButtonsComp filePath={filePath} />
            <EditorComp filePath={filePath} />
        </div>
    );
}

root.render(<MonacoMDEditorAppComp />);
