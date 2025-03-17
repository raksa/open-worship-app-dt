import InputHandlerComp, { useInputTextContext } from './InputHandlerComp';
import { genInputText } from '../bible-list/bibleHelpers';
import { setBibleLookupInputFocus } from './selectionHelpers';
import RenderExtraButtonsRightComp from './RenderExtraButtonsRightComp';
import { getPopupWindowTypeData } from '../app-modal/helpers';
import { LookupBibleItemViewController } from '../bible-reader/BibleItemViewController';
import InputHistoryComp from './InputHistoryComp';
import appProvider from '../server/appProvider';
import { ModalCloseButton } from '../app-modal/ModalComp';
import { useShowBibleLookupContext } from '../others/commonButtons';

export default function RenderBibleLookupHeaderComp({
    isLookupOnline,
    setIsLookupOnline,
    setBibleKey,
}: Readonly<{
    editorInputText: string;
    isLookupOnline: boolean;
    setIsLookupOnline: (isLookupOnline: boolean) => void;
    setBibleKey: (bibleKey: string | null) => void;
}>) {
    const hideBibleLookupPopup = useShowBibleLookupContext(false);
    const { inputText, setInputText } = useInputTextContext();
    const { data } = getPopupWindowTypeData();

    const viewController = LookupBibleItemViewController.getInstance();
    const setInputText1 = (newText: string) => {
        setInputText(newText);
        setBibleLookupInputFocus();
    };
    viewController.setInputText = setInputText1;

    const handleBibleKeyChanging = async (
        oldBibleKey: string,
        newBibleKey: string,
    ) => {
        const newText = await genInputText(oldBibleKey, newBibleKey, inputText);
        setBibleKey(newBibleKey);
        setInputText1(newText);
    };
    const isEditingBibleItem = !!data;
    return (
        <div className="card-header d-flex text-center w-100">
            <div
                className="flex-item"
                style={{
                    width: 'calc(50% - 175px)',
                }}
            >
                <InputHistoryComp />
            </div>
            <div
                className="flex-item input-group app-input-group-header"
                style={{ width: 350 }}
            >
                <InputHandlerComp onBibleKeyChange={handleBibleKeyChanging} />
            </div>
            <div
                className={
                    'flex-item flex-fill justify-content-end' +
                    (!appProvider.isPageReader ? ' pe-5' : '')
                }
            >
                {isEditingBibleItem ? null : (
                    <div className="float-start">
                        <RenderExtraButtonsRightComp
                            setIsLookupOnline={setIsLookupOnline}
                            isLookupOnline={isLookupOnline}
                        />
                    </div>
                )}
            </div>
            {hideBibleLookupPopup === null ? null : (
                <ModalCloseButton
                    close={() => {
                        hideBibleLookupPopup();
                    }}
                />
            )}
        </div>
    );
}
