import { lazy, useState } from 'react';

import { InputTextContext } from './InputHandlerComp';
import { SelectedBibleKeyContext } from '../bible-list/bibleHelpers';
import { BibleNotAvailableComp } from './RenderLookupSuggestionComp';
import BibleLookupBodyPreviewerComp from './BibleLookupBodyPreviewerComp';
import ResizeActorComp from '../resize-actor/ResizeActorComp';
import { MultiContextRender } from '../helper/MultiContextRender';
import RenderBibleLookupHeaderComp from './RenderBibleLookupHeaderComp';
import RenderExtraButtonsRightComp from './RenderExtraButtonsRightComp';
import { useStateSettingBoolean } from '../helper/settingHelpers';
import LookupBibleItemViewController from '../bible-reader/LookupBibleItemViewController';
import { useAppEffect, useAppEffectAsync } from '../helper/debuggerHelpers';
import { getAllLocalBibleInfoList } from '../helper/bible-helpers/bibleDownloadHelpers';

const LazyBibleSearchBodyPreviewerComp = lazy(() => {
    return import('../bible-search/BibleSearchPreviewerComp');
});

const LOOKUP_ONLINE_SETTING_NAME = 'bible-lookup-online';
const DEFAULT_UNKNOWN_BIBLE_KEY = 'Unknown';

export function useSelectedBibleKey() {
    const [isValid, setIsValid] = useState(true);
    const [bibleKey, setBibleKey] = useState<string>(DEFAULT_UNKNOWN_BIBLE_KEY);
    const viewController = LookupBibleItemViewController.getInstance();
    useAppEffect(() => {
        viewController.setBibleKey = setBibleKey;
        return () => {
            viewController.setBibleKey = (_: string) => {};
        };
    }, []);
    useAppEffectAsync(
        async (methodContext) => {
            const localBibleInfoList = await getAllLocalBibleInfoList();
            const newBibleKey =
                DEFAULT_UNKNOWN_BIBLE_KEY !== viewController.bibleKey
                    ? viewController.bibleKey
                    : 'KJV';
            if (localBibleInfoList.length === 0) {
                methodContext.setIsValid(false);
            } else if (
                localBibleInfoList.find((bibleInfo) => {
                    return bibleInfo.key === newBibleKey;
                }) !== undefined
            ) {
                viewController.bibleKey = newBibleKey;
            }
        },
        [],
        { setIsValid },
    );
    return { isValid, bibleKey };
}

export default function RenderBibleLookupComp() {
    const [isLookupOnline, setIsLookupOnline] = useStateSettingBoolean(
        LOOKUP_ONLINE_SETTING_NAME,
        false,
    );
    const viewController = LookupBibleItemViewController.getInstance();
    const [inputText, setInputText] = useState<string>(
        viewController.inputText,
    );
    const { isValid, bibleKey } = useSelectedBibleKey();
    useAppEffect(() => {
        viewController.setInputText = setInputText;
        return () => {
            viewController.setInputText = (_: string) => {};
        };
    }, []);

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
            children: LazyBibleSearchBodyPreviewerComp,
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
                    value: {
                        inputText,
                    },
                },
            ]}
        >
            <div id="bible-lookup-popup" className="shadow card w-100 h-100">
                <RenderBibleLookupHeaderComp
                    isLookupOnline={isLookupOnline}
                    setIsLookupOnline={setIsLookupOnline}
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
