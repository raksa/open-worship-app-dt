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

export default function RenderBibleSearch({
    editingInputText,
}: Readonly<{
    editingInputText: string,
}>) {
    const { data } = useModalTypeData();
    const isBibleEditing = !!data;
    const [inputText, setInputText] = useState<string>(editingInputText);
    const [bibleKeySelected, setBibleKeySelected] = useGetSelectedBibleKey();
    const setInputText1 = (newText: string) => {
        setInputText(newText);
        setBibleSearchInputFocus();
    };

    const handleBibleChange = useCallback(
        async (oldBibleKey: string, newBibleKey: string) => {
            const newText = await genInputText(
                oldBibleKey, newBibleKey, inputText,
            );
            setBibleKeySelected(newBibleKey);
            if (newText !== null) {
                setInputText1(newText);
            }
        }, [inputText]);
    if (bibleKeySelected === null) {
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
                        onInputChange={setInputText1}
                        bibleKey={bibleKeySelected}
                        onBibleChange={handleBibleChange} />
                </div>
            </div>
            <div className={
                'body card-body card w-100 h-100 overflow-hidden d-flex'
            }>
                <div className='found h-100 w-100 overflow-hidden'>
                    <BibleSearchBodyPreviewer
                        bibleKey={bibleKeySelected}
                        inputText={inputText}
                        setInputText={setInputText1}
                    />
                </div>
            </div>
        </div>
    );
}
