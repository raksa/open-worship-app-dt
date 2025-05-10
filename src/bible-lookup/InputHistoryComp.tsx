import { useState } from 'react';
import { useAppEffect } from '../helper/debuggerHelpers';
import { getSetting, setSetting } from '../helper/settingHelpers';
import { extractBibleTitle } from '../helper/bible-helpers/serverBibleHelpers2';
import LookupBibleItemViewController from '../bible-reader/LookupBibleItemViewController';
import { historyStore } from '../bible-reader/BibleItemViewController';

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
        historyStore.addHistory = (text: string) => {
            if (historyTextList.includes(text)) {
                return historyTextList;
            }
            let newHistory = [text, ...historyTextList];
            newHistory = newHistory.slice(0, maxHistoryCount);
            setHistoryTextList1(newHistory);
        };
        return () => {
            historyStore.addHistory = () => {};
        };
    }, [historyTextList]);
    return [historyTextList, setHistoryTextList1] as const;
}

function extractHistoryText(historyText: string) {
    const regex = /^\((.+)\)\s(.+)$/;
    const found = regex.exec(historyText);
    if (found === null) {
        return null;
    }
    const bibleKey = found[1];
    const bibleTitle = found[2];
    return {
        bibleKey,
        bibleTitle,
    };
}

async function handleDoubleClicking(event: any, historyText: string) {
    event.preventDefault();
    const extracted = extractHistoryText(historyText);
    if (extracted === null) {
        return;
    }
    const { bibleKey, bibleTitle } = extracted;
    const { result } = await extractBibleTitle(bibleKey, bibleTitle);
    if (result.bibleItem === null) {
        return;
    }
    const viewController = LookupBibleItemViewController.getInstance();
    if (event.shiftKey) {
        viewController.addBibleItemLeft(
            viewController.selectedBibleItem,
            viewController.selectedBibleItem,
        );
    }
    viewController.setLookupContentFromBibleItem(result.bibleItem);
}

function handleHistoryRemoving(
    historyTextList: string[],
    historyText: string,
    setHistoryTextList: (newHistoryTextList: string[]) => void,
) {
    const newHistoryTextList = historyTextList.filter((historyText1) => {
        return historyText1 !== historyText;
    });
    setHistoryTextList(newHistoryTextList);
}

export default function InputHistoryComp({
    maxHistoryCount = 20,
}: Readonly<{
    maxHistoryCount?: number;
}>) {
    const [historyTextList, setHistoryTextList] =
        useHistoryTextList(maxHistoryCount);

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
                const extracted = extractHistoryText(historyText);
                return (
                    <button
                        key={historyText}
                        data-bible-key={extracted?.bibleKey || ''}
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
                                handleHistoryRemoving(
                                    historyTextList,
                                    historyText,
                                    setHistoryTextList,
                                );
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
