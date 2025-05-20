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
import { useAppEffect, useAppStateAsync } from '../helper/debuggerHelpers';
import { getAllLocalBibleInfoList } from '../helper/bible-helpers/bibleDownloadHelpers';
import { useLookupBibleItemControllerContext } from '../bible-reader/LookupBibleItemController';

const LazyBibleSearchBodyPreviewerComp = lazy(() => {
    return import('../bible-search/BibleSearchPreviewerComp');
});

const LOOKUP_ONLINE_SETTING_NAME = 'bible-lookup-online';

export function useSelectedBibleKey() {
    const viewController = useLookupBibleItemControllerContext();
    const [bibleKey, setBibleKey] = useState<string>(
        viewController.selectedBibleItem.bibleKey,
    );
    const { value: localBibleInfoList } = useAppStateAsync(() => {
        return getAllLocalBibleInfoList();
    }, []);
    useAppEffect(() => {
        viewController.setBibleKey = (newBibleKey: string) => {
            setBibleKey(newBibleKey);
        };
        return () => {
            viewController.setBibleKey = (_: string) => {};
        };
    }, []);
    const isValid = (localBibleInfoList ?? []).some((bibleInfo) => {
        return bibleInfo.key === bibleKey;
    });
    return { isValid, bibleKey };
}

export default function RenderBibleLookupComp() {
    const [isLookupOnline, setIsLookupOnline] = useStateSettingBoolean(
        LOOKUP_ONLINE_SETTING_NAME,
        false,
    );
    const viewController = useLookupBibleItemControllerContext();
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
