import { lazy, useCallback, useContext, useState } from 'react';

import InputHandler from './InputHandler';
import {
    SelectedBibleKeyContext, genInputText, useGetSelectedBibleKey,
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
} from '../read-bible/BibleItemViewController';
import ResizeActor from '../resize-actor/ResizeActor';
import { CloseButtonContext } from '../app-modal/Modal';

const BibleOnlineSearchBodyPreviewer = lazy(() => {
    return import('./BibleOnlineSearchBodyPreviewer');
});

function RenderBibleSearchHeader({
    isSearchOnline, setIsSearchOnline, setBibleKey, inputText, setInputText,
}: Readonly<{
    editorInputText: string,
    isSearchOnline: boolean,
    setIsSearchOnline: (isSearchOnline: boolean) => void,
    setBibleKey: (bibleKey: string | null) => void,
    inputText: string,
    setInputText: (inputText: string) => void,
}>) {
    const closeButton = useContext(CloseButtonContext);
    const { data } = usePopupWindowsTypeData();

    const bibleItemViewController = SearchBibleItemViewController.getInstance();
    const setInputText1 = (newText: string) => {
        setInputText(newText);
        setBibleSearchInputFocus();
    };
    bibleItemViewController.setInputText = setInputText1;
    bibleItemViewController.setBibleKey = setBibleKey;

    const handleBibleChange = useCallback(
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
            <div className='flex-item flex-fill'>
            </div>
            <div className='flex-item input-group app-input-group-header'
                style={{ width: 350 }}>
                <InputHandler
                    inputText={inputText}
                    onBibleChange={handleBibleChange}
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
    const [bibleKey, setBibleKey] = useGetSelectedBibleKey();

    if (bibleKey === null) {
        return (
            <BibleNotAvailable />
        );
    }
    const searchingBody = (
        <BibleSearchBodyPreviewer inputText={inputText} />
    );

    return (
        <SelectedBibleKeyContext.Provider value={bibleKey}>
            <div id='bible-search-popup' className='app-modal shadow card'>
                <RenderBibleSearchHeader
                    editorInputText={editorInputText}
                    isSearchOnline={isSearchOnline}
                    setIsSearchOnline={setIsSearchOnline}
                    setBibleKey={setBibleKey}
                    inputText={inputText}
                    setInputText={setInputText}
                />
                <div className={
                    'card-body d-flex w-100 h-100 overflow-hidden'
                }>
                    {isSearchOnline ? (
                        <ResizeActor fSizeName='bible-search-popup-body'
                            isHorizontal
                            isDisableQuickResize
                            flexSizeDefault={{ 'h1': ['1'], 'h2': ['3'] }}
                            dataInput={[
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
                            ]}
                        />
                    ) : searchingBody}
                </div>
            </div>
        </SelectedBibleKeyContext.Provider>
    );
}
