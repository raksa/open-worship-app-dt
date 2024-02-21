import { useCallback, useState } from 'react';
import InputHandler from './InputHandler';
import {
    genInputText, useGetSelectedBibleKey,
} from '../bible-list/bibleHelpers';
import {
    BibleNotAvailable,
} from './RenderSearchSuggestion';
import { setBibleSearchInputFocus } from './selectionHelpers';
import RenderKeepWindowOpen from './RenderKeepWindowOpen';
import { useModalTypeData } from '../app-modal/helpers';
import BibleSearchBodyPreviewer from './BibleSearchBodyPreviewer';
import {
    SearchBibleItemViewController,
} from '../read-bible/BibleItemViewController';

export default function RenderBibleSearch({
    editingInputText,
}: Readonly<{
    editingInputText: string,
}>) {
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
    return (
        <div id='bible-search-popup' className='app-modal shadow card'>
            <div className='card-header text-center w-100'>
                {isBibleEditing ? null : <div className='float-start'>
                    <RenderKeepWindowOpen />
                </div>}
                <div className='input-group input-group-header'>
                    <span className='input-group-text'>
                        <i className='bi bi-search' />
                    </span>
                    <InputHandler
                        inputText={inputText}
                        bibleKey={bibleKey}
                        onBibleChange={handleBibleChange} />
                </div>
            </div>
            <div className={
                'body card-body card w-100 h-100 overflow-hidden d-flex'
            }>
                <div className='found h-100 w-100 overflow-hidden'>
                    <BibleSearchBodyPreviewer
                        bibleKey={bibleKey}
                        inputText={inputText}
                    />
                </div>
            </div>
        </div>
    );
}
