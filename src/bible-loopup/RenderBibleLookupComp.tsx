import { lazy, useMemo, useState } from 'react';

import { InputTextContext } from './InputHandlerComp';
import {
    SelectedBibleKeyContext,
    useSelectedBibleKey,
} from '../bible-list/bibleHelpers';
import { BibleNotAvailableComp } from './RenderLookupSuggestionComp';
import BibleLookupBodyPreviewerComp from './BibleLookupBodyPreviewerComp';
import { LookupBibleItemViewController } from '../bible-reader/BibleItemViewController';
import ResizeActorComp from '../resize-actor/ResizeActorComp';
import { MultiContextRender } from '../helper/MultiContextRender';
import RenderBibleLookupHeaderComp from './RenderBibleLookupHeaderComp';
import RenderExtraButtonsRightComp from './RenderExtraButtonsRightComp';
import { useStateSettingBoolean } from '../helper/settingHelpers';

const LazyBibleOnlineLookupBodyPreviewer = lazy(() => {
    return import('./BibleOnlineLookupBodyPreviewerComp');
});

const LOOKUPING_ONLINE_SETTING_NAME = 'bible-lookup-online';

export default function RenderBibleLookupComp({
    editorInputText = '',
}: Readonly<{
    editorInputText?: string;
}>) {
    const [isLookupOnline, setIsLookupOnline] = useStateSettingBoolean(
        LOOKUPING_ONLINE_SETTING_NAME,
        false,
    );
    const [inputText, setInputText] = useState<string>(editorInputText);
    const { isValid, bibleKey, setBibleKey } = useSelectedBibleKey();
    const viewController = LookupBibleItemViewController.getInstance();
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
                        setIsLookupOnline={setIsLookupOnline}
                        isLookupOnline={isLookupOnline}
                    />
                </div>
                <div className="flex-fill">
                    <BibleNotAvailableComp bibleKey={bibleKey} />
                </div>
            </div>
        );
    }
    const lookupBody = <BibleLookupBodyPreviewerComp />;
    const resizeData = [
        {
            children: {
                render: () => {
                    return lookupBody;
                },
            },
            key: 'h2',
            widgetName: 'Lookup',
        },
        {
            children: LazyBibleOnlineLookupBodyPreviewer,
            key: 'h1',
            widgetName: 'Bible Online Lookup',
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
            <div id="bible-lookup-popup" className="shadow card w-100 h-100">
                <RenderBibleLookupHeaderComp
                    editorInputText={editorInputText}
                    isLookupOnline={isLookupOnline}
                    setIsLookupOnline={setIsLookupOnline}
                    setBibleKey={setBibleKey}
                />
                <div className={'card-body d-flex w-100 h-100 overflow-hidden'}>
                    {isLookupOnline ? (
                        <ResizeActorComp
                            flexSizeName="bible-lookup-popup-body"
                            isHorizontal
                            isDisableQuickResize
                            flexSizeDefault={{ h1: ['1'], h2: ['3'] }}
                            dataInput={resizeData}
                        />
                    ) : (
                        lookupBody
                    )}
                </div>
            </div>
        </MultiContextRender>
    );
}
