import { useState } from 'react';
import { useAppEffect } from '../helper/debuggerHelpers';
import { getSetting, setSetting } from '../helper/settingHelper';

let addHistory: (text: string) => void = () => { };
let timeoutId: any = null;
export function attemptAddingHistory(text: string, isQuick = false) {
    if (isQuick) {
        addHistory(text);
        return;
    }
    if (timeoutId !== null) {
        clearTimeout(timeoutId);
        timeoutId = null;
    }
    timeoutId = setTimeout(() => {
        timeoutId = null;
        addHistory(text);
    }, 4e3);
}

const HISTORY_TEXT_LIST_SETTING_NAME = 'history-text-list';
function useHistoryTextList(maxHistoryCount: number) {
    const historyTextListJson = getSetting(
        HISTORY_TEXT_LIST_SETTING_NAME, '[]'
    );
    const defaultHistoryTextList = JSON.parse(historyTextListJson) as string[];
    const [historyTextList, setHistoryTextList] = useState<string[]>(
        defaultHistoryTextList,
    );
    const setHistoryTextList1 = (newHistoryTextList: string[]) => {
        setHistoryTextList(newHistoryTextList);
        setSetting(
            HISTORY_TEXT_LIST_SETTING_NAME, JSON.stringify(newHistoryTextList),
        );
    };
    useAppEffect(() => {
        addHistory = (text: string) => {
            if (historyTextList.includes(text)) {
                return historyTextList;
            }
            let newHistory = [text, ...historyTextList];
            newHistory = newHistory.slice(0, maxHistoryCount);
            setHistoryTextList1(newHistory);
        };
        return () => {
            addHistory = () => { };
        };
    });
    return [historyTextList, setHistoryTextList1] as const;
}

export default function InputHistory({
    maxHistoryCount = 20, onPutHistoryBack,
}: Readonly<{
    maxHistoryCount?: number,
    onPutHistoryBack: (historyText: string, isShift: boolean) => void,
}>) {
    const [historyTextList, setHistoryTextList] = useHistoryTextList(
        maxHistoryCount,
    );
    const removeHistory = (historyText: string) => {
        const newHistoryTextList = historyTextList.filter((h) => {
            return h !== historyText;
        });
        setHistoryTextList(newHistoryTextList);
    };
    return (
        <div className='d-flex shadow-sm rounded px-1' style={{
            overflowX: 'auto',
            overflowY: 'hidden',
            minWidth: '150px',
        }}>
            {historyTextList.map((historyText) => {
                return (
                    <button key={historyText}
                        title={
                            'Double click to put back, shift double click to ' +
                            'put back split'
                        }
                        className='btn btn-sm d-flex border-white-round'
                        style={{ height: '25px' }}
                        onDoubleClick={(event) => {
                            onPutHistoryBack(historyText, event.shiftKey);
                        }}>
                        <small className='flex-fill'>{historyText}</small>
                        <small title='Remove'
                            style={{ color: 'red' }} onClick={() => {
                                removeHistory(historyText);
                            }}>
                            <i className='bi bi-x' />
                        </small>
                    </button>
                );
            })}
        </div>
    );
}
