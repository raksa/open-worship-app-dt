import { lazy, useCallback, useState } from 'react';

import InputHandler from './InputHandler';
import {
    SelectedBibleKeyContext,
    genInputText, useGetSelectedBibleKey,
} from '../bible-list/bibleHelpers';
import {
    BibleNotAvailable,
} from './RenderSearchSuggestion';
import { setBibleSearchInputFocus } from './selectionHelpers';
import RenderExtraLeftButtons from './RenderExtraLeftButtons';
import { useModalTypeData } from '../app-modal/helpers';
import BibleSearchBodyPreviewer from './BibleSearchBodyPreviewer';
import {
    SearchBibleItemViewController,
} from '../read-bible/BibleItemViewController';
import ResizeActor from '../resize-actor/ResizeActor';

const BibleOnlineSearchBodyPreviewer = lazy(() => {
    return import('./BibleOnlineSearchBodyPreviewer');
});

export default function RenderBibleSearch({
    editingInputText,
}: Readonly<{
    editingInputText: string,
}>) {
    const [isSearchOnline, setIsSearchOnline] = useState(false);
    const { data } = useModalTypeData();
    const isBibleEditing = !!data;
    const [inputText, setInputText] = useState<string>(editingInputText);
    const [bibleKey, setBibleKey] = useGetSelectedBibleKey();
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
    if (bibleKey === null) {
        return (
            <BibleNotAvailable />
        );
    }
    const searchingBody = (
        <BibleSearchBodyPreviewer
            inputText={inputText}
        />
    );
    return (
        <SelectedBibleKeyContext.Provider value={bibleKey}>
            <div id='bible-search-popup' className='app-modal shadow card'>
                <div className='card-header d-flex text-center w-100'>
                    {isBibleEditing ? null : <div className='float-start'>
                        <RenderExtraLeftButtons
                            setIsSearchOnline={setIsSearchOnline}
                            isSearchOnline={isSearchOnline}
                        />
                    </div>}
                    <div className='input-group input-group-header'
                        style={{ width: 350 }}>
                        <InputHandler
                            inputText={inputText}
                            onBibleChange={handleBibleChange}
                        />
                    </div>
                </div>
                <div className={
                    'card-body d-flex w-100 h-100 overflow-hidden'
                }>
                    {isSearchOnline ?
                        <ResizeActor fSizeName='bible-search-popup-body'
                            isHorizontal
                            isDisableQuickResize
                            flexSizeDefault={{ 'h1': ['1'], 'h2': ['3'] }}
                            dataInput={[
                                [BibleOnlineSearchBodyPreviewer, 'h1', ''],
                                [{
                                    render: () => {
                                        return searchingBody;
                                    },
                                }, 'h2', ''],
                            ]} /> : searchingBody
                    }
                </div>
            </div>
        </SelectedBibleKeyContext.Provider>
    );
}
