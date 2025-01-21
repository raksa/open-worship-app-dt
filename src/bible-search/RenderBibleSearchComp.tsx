import { lazy, useMemo, useState } from 'react';

import { InputTextContext } from './InputHandlerComp';
import {
    SelectedBibleKeyContext,
    useSelectedBibleKey,
} from '../bible-list/bibleHelpers';
import { BibleNotAvailable } from './RenderSearchSuggestionComp';
import BibleSearchBodyPreviewerComp from './BibleSearchBodyPreviewerComp';
import { SearchBibleItemViewController } from '../bible-reader/BibleItemViewController';
import ResizeActorComp from '../resize-actor/ResizeActorComp';
import { MultiContextRender } from '../helper/MultiContextRender';
import RenderBibleSearchHeaderComp from './RenderBibleSearchHeaderComp';
import RenderExtraButtonsRightComp from './RenderExtraButtonsRightComp';

const LazyBibleOnlineSearchBodyPreviewer = lazy(() => {
    return import('./BibleOnlineSearchBodyPreviewerComp');
});

export default function RenderBibleSearchComp({
    editorInputText = '',
}: Readonly<{
    editorInputText?: string;
}>) {
    const [isSearchOnline, setIsSearchOnline] = useState(false);
    const [inputText, setInputText] = useState<string>(editorInputText);
    const { isValid, bibleKey, setBibleKey } = useSelectedBibleKey();
    const viewController = SearchBibleItemViewController.getInstance();
    if (bibleKey !== null) {
        viewController.selectedBibleItem.bibleKey = bibleKey;
    }
    viewController.setBibleKey = setBibleKey;
    const inputTextContextValue = useMemo(
        () => ({
            inputText,
            setInputText,
        }),
        [inputText, setInputText],
    );

    if (!isValid) {
        return (
            <div className="w-100 h-100">
                <div className="d-flex">
                    <div className="flex-fill"></div>
                    <RenderExtraButtonsRightComp
                        setIsSearchOnline={setIsSearchOnline}
                        isSearchOnline={isSearchOnline}
                    />
                </div>
                <div className="flex-fill">
                    <BibleNotAvailable bibleKey={bibleKey} />
                </div>
            </div>
        );
    }
    const searchingBody = <BibleSearchBodyPreviewerComp />;
    const resizeData = [
        {
            children: {
                render: () => {
                    return searchingBody;
                },
            },
            key: 'h2',
            widgetName: 'Searching',
        },
        {
            children: LazyBibleOnlineSearchBodyPreviewer,
            key: 'h1',
            widgetName: 'Bible Online Search',
        },
    ];
    return (
        <MultiContextRender
            contexts={[
                {
                    context: SelectedBibleKeyContext,
                    value: bibleKey,
                },
                {
                    context: InputTextContext,
                    value: inputTextContextValue,
                },
            ]}
        >
            <div id="bible-search-popup" className="shadow card w-100 h-100">
                <RenderBibleSearchHeaderComp
                    editorInputText={editorInputText}
                    isSearchOnline={isSearchOnline}
                    setIsSearchOnline={setIsSearchOnline}
                    setBibleKey={setBibleKey}
                />
                <div className={'card-body d-flex w-100 h-100 overflow-hidden'}>
                    {isSearchOnline ? (
                        <ResizeActorComp
                            flexSizeName="bible-search-popup-body"
                            isHorizontal
                            isDisableQuickResize
                            flexSizeDefault={{ h1: ['1'], h2: ['3'] }}
                            dataInput={resizeData}
                        />
                    ) : (
                        searchingBody
                    )}
                </div>
            </div>
        </MultiContextRender>
    );
}
