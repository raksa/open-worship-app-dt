import { lazy, useCallback, useContext, useMemo, useState } from 'react';

import InputHandler, { InputTextContext, useInputText } from './InputHandler';
import {
    SelectedBibleKeyContext, genInputText, useBibleKeyContext,
    useSelectedBibleKey,
} from '../bible-list/bibleHelpers';
import {
    BibleNotAvailable,
} from './RenderSearchSuggestion';
import { setBibleSearchInputFocus } from './selectionHelpers';
import RenderExtraLeftButtons from './RenderExtraLeftButtons';
import { usePopupWindowsTypeData } from '../app-modal/helpers';
import BibleSearchBodyPreviewer from './BibleSearchBodyPreviewer';
import {
    SearchBibleItemViewController,
} from '../bible-reader/BibleItemViewController';
import ResizeActor from '../resize-actor/ResizeActor';
import { CloseButtonContext } from '../app-modal/Modal';
import InputHistory from './InputHistory';

const BibleOnlineSearchBodyPreviewer = lazy(() => {
    return import('./BibleOnlineSearchBodyPreviewer');
});

function RenderBibleSearchHeader({
    isSearchOnline, setIsSearchOnline, setBibleKey,
}: Readonly<{
    editorInputText: string,
    isSearchOnline: boolean,
    setIsSearchOnline: (isSearchOnline: boolean) => void,
    setBibleKey: (bibleKey: string | null) => void,
}>) {
    const bibleKey = useBibleKeyContext();
    const { inputText, setInputText } = useInputText();
    const closeButton = useContext(CloseButtonContext);
    const { data } = usePopupWindowsTypeData();

    const viewController = SearchBibleItemViewController.getInstance();
    const setInputText1 = (newText: string) => {
        setInputText(newText);
        setBibleSearchInputFocus();
    };
    viewController.setInputText = setInputText1;

    const handleBibleKeyChange = useCallback(
        async (oldBibleKey: string, newBibleKey: string) => {
            const newText = await genInputText(
                oldBibleKey, newBibleKey, inputText,
            );
            setBibleKey(newBibleKey);
            if (newText !== null) {
                setInputText1(newText);
            }
        }, [inputText]);
    const isBibleEditor = !!data;
    return (
        <div className='card-header d-flex text-center w-100'>
            <div className='flex-item' style={{
                width: 'calc(50% - 175px)',
            }}>
                <InputHistory onPutHistoryBack={(
                    bibleKey1, historyText, isShift,
                ) => {
                    if (isShift) {
                        viewController.addBibleItemLeft(
                            viewController.selectedBibleItem,
                            viewController.selectedBibleItem,
                        );
                    }
                    if (bibleKey !== bibleKey1) {
                        handleBibleKeyChange(bibleKey, bibleKey1);
                    }
                    if (historyText !== inputText) {
                        setInputText1(historyText);
                    }
                }} />
            </div>
            <div className='flex-item input-group app-input-group-header'
                style={{ width: 350 }}>
                <InputHandler
                    onBibleKeyChange={handleBibleKeyChange}
                />
            </div>
            <div className='flex-item flex-fill justify-content-end pe-5'>
                {isBibleEditor ? null : (
                    <div className='float-start'>
                        <RenderExtraLeftButtons
                            setIsSearchOnline={setIsSearchOnline}
                            isSearchOnline={isSearchOnline}
                        />
                    </div>
                )}
            </div>
            {closeButton}
        </div>
    );
}

export default function RenderBibleSearch({ editorInputText }: Readonly<{
    editorInputText: string,
}>) {
    const [isSearchOnline, setIsSearchOnline] = useState(false);
    const [inputText, setInputText] = useState<string>(editorInputText);
    const [bibleKey, setBibleKey] = useSelectedBibleKey();
    const viewController = SearchBibleItemViewController.getInstance();
    viewController.setBibleKey = setBibleKey;
    const inputTextContextValue = useMemo(() => ({
        inputText, setInputText,
    }), [inputText, setInputText]);

    if (bibleKey === null) {
        return (
            <BibleNotAvailable />
        );
    }
    const searchingBody = (
        <BibleSearchBodyPreviewer />
    );
    const resizeData = [
        {
            children: {
                render: () => {
                    return searchingBody;
                },
            }, key: 'h2', widgetName: 'Searching',
        },
        {
            children: BibleOnlineSearchBodyPreviewer,
            key: 'h1',
            widgetName: 'Bible Online Search',
        },
    ];
    return (
        <SelectedBibleKeyContext.Provider value={bibleKey}>
            <InputTextContext.Provider value={inputTextContextValue}>

                <div id='bible-search-popup' className='app-modal shadow card'>
                    <RenderBibleSearchHeader
                        editorInputText={editorInputText}
                        isSearchOnline={isSearchOnline}
                        setIsSearchOnline={setIsSearchOnline}
                        setBibleKey={setBibleKey}
                    />
                    <div className={
                        'card-body d-flex w-100 h-100 overflow-hidden'
                    }>
                        {isSearchOnline ? (
                            <ResizeActor fSizeName='bible-search-popup-body'
                                isHorizontal
                                isDisableQuickResize
                                flexSizeDefault={{ 'h1': ['1'], 'h2': ['3'] }}
                                dataInput={resizeData}
                            />
                        ) : searchingBody}
                    </div>
                </div>
            </InputTextContext.Provider>
        </SelectedBibleKeyContext.Provider>
    );
}
