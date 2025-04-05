import { useState } from 'react';

import { editor } from 'monaco-editor';
import { getSetting, setSetting } from '../helper/settingHelpers';
import FileSource from '../helper/FileSource';
import { useFileSourceEvents } from '../helper/dirSourceHelpers';

export const VALUE_SETTING_NAME = 'monaco-editor-value';
export function toSettingName(filePath: string) {
    return VALUE_SETTING_NAME + filePath;
}

export const defaultMarkdownContent = `## This is Slide 1
A paragraph with some text and a [link](https://hakim.se).
---
## Slide 2
---
## Slide 3`;

export function getEditingValue(filePath: string) {
    return getSetting(toSettingName(filePath)) || defaultMarkdownContent;
}

function initEditor(div: HTMLDivElement, filePath: string) {
    let myEditor: editor.IStandaloneCodeEditor | null = null;
    const value = getEditingValue(filePath);
    const fileSource = FileSource.getInstance(filePath);
    myEditor = editor.create(div, {
        value,
        language: 'markdown',
        automaticLayout: true,
    });
    myEditor.onDidChangeModelContent(() => {
        fileSource.fireUpdateEvent(myEditor.getValue());
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

export default function MonacoMDEditorAppComp() {
    const filePath = '/a/b.md';
    return (
        <div
            style={{
                width: '600px',
                height: '450px',
                margin: 'auto',
            }}
        >
            <ActionButtonsComp filePath={filePath} />
            <EditorComp filePath={filePath} />
        </div>
    );
}
