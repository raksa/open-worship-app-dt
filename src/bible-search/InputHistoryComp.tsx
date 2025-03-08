import { useState } from 'react';
import { useAppEffect } from '../helper/debuggerHelpers';
import { getSetting, setSetting } from '../helper/settingHelpers';
import { extractBibleTitle } from '../helper/bible-helpers/serverBibleHelpers2';
import { SearchBibleItemViewController } from '../bible-reader/BibleItemViewController';
import { genTimeoutAttempt } from '../helper/helpers';

let addHistory: (text: string) => void = () => {};
export function applyPendingText() {
    if (!pendingText) {
        return;
    }
    addHistory(pendingText);
    pendingText = '';
}
const attemptTimeout = genTimeoutAttempt(4e3);
let pendingText = '';
export function attemptAddingHistory(
    bibleKey: string,
    text: string,
    isQuick = false,
) {
    pendingText = `(${bibleKey}) ${text}`;
    if (isQuick) {
        applyPendingText();
        return;
    }
    attemptTimeout(() => {
        applyPendingText();
    });
}

const HISTORY_TEXT_LIST_SETTING_NAME = 'history-text-list';
function useHistoryTextList(maxHistoryCount: number) {
    const historyTextListJson = getSetting(
        HISTORY_TEXT_LIST_SETTING_NAME,
        '[]',
    );
    const defaultHistoryTextList = JSON.parse(historyTextListJson) as string[];
    const [historyTextList, setHistoryTextList] = useState<string[]>(
        defaultHistoryTextList,
    );
    const setHistoryTextList1 = (newHistoryTextList: string[]) => {
        setHistoryTextList(newHistoryTextList);
        setSetting(
            HISTORY_TEXT_LIST_SETTING_NAME,
            JSON.stringify(newHistoryTextList),
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
            addHistory = () => {};
        };
    }, [historyTextList]);
    return [historyTextList, setHistoryTextList1] as const;
}

export default function InputHistoryComp({
    maxHistoryCount = 20,
}: Readonly<{
    maxHistoryCount?: number;
}>) {
    const [historyTextList, setHistoryTextList] =
        useHistoryTextList(maxHistoryCount);
    const handleHistoryRemoving = (historyText: string) => {
        const newHistoryTextList = historyTextList.filter((h) => {
            return h !== historyText;
        });
        setHistoryTextList(newHistoryTextList);
    };
    const handleDoubleClicking = async (event: any, historyText: string) => {
        event.preventDefault();
        const regex = /^\((.+)\)\s(.+)$/;
        const found = regex.exec(historyText);
        if (found === null) {
            return;
        }
        const bibleKey = found[1];
        const bibleTitle = found[2];
        const { result } = await extractBibleTitle(bibleKey, bibleTitle);
        if (result.bibleItem === null) {
            return;
        }
        const viewController = SearchBibleItemViewController.getInstance();
        if (event.shiftKey) {
            viewController.addBibleItemLeft(
                viewController.selectedBibleItem,
                viewController.selectedBibleItem,
            );
        }
        viewController.setSearchingContentFromBibleItem(result.bibleItem);
    };
    return (
        <div
            className="d-flex shadow-sm rounded px-1 me-1"
            style={{
                overflowX: 'auto',
                overflowY: 'hidden',
                minWidth: '150px',
            }}
        >
            {historyTextList.map((historyText) => {
                return (
                    <button
                        key={historyText}
                        title={
                            'Double click to put back, shift double click to ' +
                            'put back split'
                        }
                        className="btn btn-sm d-flex app-border-white-round"
                        style={{ height: '25px' }}
                        onDoubleClick={(event) => {
                            handleDoubleClicking(event, historyText);
                        }}
                    >
                        <small className="flex-fill">{historyText}</small>
                        <small
                            title="Remove"
                            style={{ color: 'red' }}
                            onClick={() => {
                                handleHistoryRemoving(historyText);
                            }}
                        >
                            <i className="bi bi-x" />
                        </small>
                    </button>
                );
            })}
        </div>
    );
}
