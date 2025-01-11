import { createRoot } from 'react-dom/client';
import { getRootElement } from './appInitHelpers';
import {
    fsCheckFileExist,
    fsReadFile,
    fsWriteFile,
    pathJoin,
} from './server/fileHelpers';
import { getUserWritablePath } from './server/appHelpers';
import EditingHistoryManager, {
    useEditingHistoryEvent,
    useEditingHistoryStatus,
} from './others/EditingHistoryManager';
import { useCallback, useMemo, useState } from 'react';
import { useAppEffectAsync } from './helper/debuggerHelpers';

const container = getRootElement<HTMLDivElement>();
const root = createRoot(container);

const filePath = pathJoin(getUserWritablePath(), 'history1.txt');

let timeoutId: any = null;
function HistoryAppComp() {
    const { canUndo, canRedo, canSave } = useEditingHistoryStatus(filePath);
    const [text, setText] = useState('');
    const historyManager = useMemo(() => {
        return new EditingHistoryManager(filePath);
    }, []);
    const setTextFromHistory = useCallback(async () => {
        if (!(await fsCheckFileExist(filePath))) {
            await fsWriteFile(filePath, '');
        }
        const lastHistory = await historyManager.getCurrentHistory();
        if (lastHistory !== null) {
            setText(lastHistory);
        } else {
            const text = await fsReadFile(filePath);
            setText(text);
        }
    }, [setText, historyManager]);
    useEditingHistoryEvent(filePath, setTextFromHistory);
    useAppEffectAsync(setTextFromHistory, []);
    const handleTextChanging = (newText: string) => {
        setText(newText);
        if (timeoutId !== null) {
            clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => {
            timeoutId = null;
            historyManager.addHistory(newText);
        }, 1e3);
    };
    return (
        <div
            style={{
                width: '600px',
                margin: 'auto',
                backgroundColor: 'white',
            }}
        >
            <h1>Editing History</h1>
            <div>
                <button
                    disabled={!canUndo}
                    onClick={() => {
                        historyManager.undo();
                    }}
                >
                    Undo
                </button>
                <button
                    disabled={!canRedo}
                    onClick={() => {
                        historyManager.redo();
                    }}
                >
                    Redo
                </button>
                <button
                    disabled={!canSave}
                    onClick={() => {
                        historyManager.discard();
                    }}
                >
                    Discard
                </button>
                <button
                    disabled={!canSave}
                    onClick={() => {
                        historyManager.save();
                    }}
                >
                    Save
                </button>
                <hr />
                <textarea
                    style={{
                        width: '100%',
                        height: '300px',
                    }}
                    value={text}
                    onChange={(event) => {
                        handleTextChanging(event.target.value);
                    }}
                />
            </div>
        </div>
    );
}

root.render(<HistoryAppComp />);
