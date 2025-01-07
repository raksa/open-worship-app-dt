import { lazy, useMemo, useState } from 'react';

import {
    InputTextContext,
} from './InputHandler';
import {
    SelectedBibleKeyContext, useSelectedBibleKey,
} from '../bible-list/bibleHelpers';
import {
    BibleNotAvailable,
} from './RenderSearchSuggestion';
import BibleSearchBodyPreviewer from './BibleSearchBodyPreviewer';
import {
    SearchBibleItemViewController,
} from '../bible-reader/BibleItemViewController';
import ResizeActor from '../resize-actor/ResizeActor';
import { MultiContextRender } from '../helper/MultiContextRender';
import RenderBibleSearchHeader from './RenderBibleSearchHeader';
import RenderExtraButtonsRight from './RenderExtraButtonsRight';

const LazyBibleOnlineSearchBodyPreviewer = lazy(() => {
    return import('./BibleOnlineSearchBodyPreviewer');
});

export default function RenderBibleSearch({ editorInputText = '' }: Readonly<{
    editorInputText?: string,
}>) {
    const [isSearchOnline, setIsSearchOnline] = useState(false);
    const [inputText, setInputText] = useState<string>(editorInputText);
    const [bibleKey, setBibleKey] = useSelectedBibleKey();
    const viewController = SearchBibleItemViewController.getInstance();
    if (bibleKey !== null) {
        viewController.selectedBibleItem.bibleKey = bibleKey;
    }
    viewController.setBibleKey = setBibleKey;
    const inputTextContextValue = useMemo(() => ({
        inputText, setInputText,
    }), [inputText, setInputText]);

    if (bibleKey === null) {
        return (
            <div className='w-100 h-100'>
                <div className='d-flex'>
                    <div className='flex-fill'></div>
                    <RenderExtraButtonsRight
                        setIsSearchOnline={setIsSearchOnline}
                        isSearchOnline={isSearchOnline}
                    />
                </div>
                <div className='flex-fill'>
                    <BibleNotAvailable />
                </div>
            </div>
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
            children: LazyBibleOnlineSearchBodyPreviewer,
            key: 'h1',
            widgetName: 'Bible Online Search',
        },
    ];
    return (
        <MultiContextRender contexts={[{
            context: SelectedBibleKeyContext,
            value: bibleKey,
        }, {
            context: InputTextContext,
            value: inputTextContextValue,
        }]}>
            <div id='bible-search-popup' className='shadow card w-100 h-100'>
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
                        <ResizeActor flexSizeName='bible-search-popup-body'
                            isHorizontal
                            isDisableQuickResize
                            flexSizeDefault={{ 'h1': ['1'], 'h2': ['3'] }}
                            dataInput={resizeData}
                        />
                    ) : searchingBody}
                </div>
            </div>
        </MultiContextRender>
    );
}
