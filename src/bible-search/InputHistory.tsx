import { useState } from 'react';
import { useAppEffect } from '../helper/debuggerHelpers';

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

export default function InputHistory({
    maxHistoryCount = 10, onPutHistoryBack,
}: Readonly<{
    maxHistoryCount?: number,
    onPutHistoryBack: (historyText: string) => void,
}>) {
    const [historyTextList, setHistoryTextList] = useState<string[]>([]);
    useAppEffect(() => {
        addHistory = (text: string) => {
            setHistoryTextList((prev) => {
                if (prev.includes(text)) {
                    return prev;
                }
                const newHistory = [text, ...prev];
                return newHistory.slice(0, maxHistoryCount);
            });
        };
        return () => {
            addHistory = () => { };
        };
    });
    const removeHistory = (historyText: string) => {
        setHistoryTextList((prev) => {
            return prev.filter((h) => h !== historyText);
        });
    };
    return (
        <div className='d-flex shadow-sm rounded p-1' style={{
            overflowX: 'auto',
            overflowY: 'hidden',
            minWidth: '150px',
        }}>
            {historyTextList.map((historyText) => {
                return (
                    <button key={historyText}
                        title='Double click to put back'
                        className='btn btn-sm d-flex border-white-round'
                        onDoubleClick={() => {
                            onPutHistoryBack(historyText);
                        }}>
                        <small className='flex-fill'>{historyText}</small>
                        <small title='Remove'
                            style={{ color: 'red' }} onClick={() => {
                                removeHistory(historyText);
                            }}>
                            x
                        </small>
                    </button>
                );
            })}
        </div>
    );
}
