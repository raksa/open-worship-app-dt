import InputHandlerComp, { useInputTextContext } from './InputHandlerComp';
import { genInputText } from '../bible-list/bibleHelpers';
import RenderExtraButtonsRightComp from './RenderExtraButtonsRightComp';
import InputHistoryComp from './InputHistoryComp';
import appProvider from '../server/appProvider';
import { ModalCloseButton } from '../app-modal/ModalComp';
import { useShowBibleLookupContext } from '../others/commonButtons';
import LookupBibleItemViewController from '../bible-reader/LookupBibleItemViewController';

export default function RenderBibleLookupHeaderComp({
    isLookupOnline,
    setIsLookupOnline,
}: Readonly<{
    isLookupOnline: boolean;
    setIsLookupOnline: (isLookupOnline: boolean) => void;
}>) {
    const hideBibleLookupPopup = useShowBibleLookupContext(false);
    const { inputText } = useInputTextContext();

    const handleBibleKeyChanging = async (
        oldBibleKey: string,
        newBibleKey: string,
    ) => {
        const newText = await genInputText(oldBibleKey, newBibleKey, inputText);
        const viewController = LookupBibleItemViewController.getInstance();
        viewController.bibleKey = newBibleKey;
        viewController.inputText = newText;
    };
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
                <div className="float-start">
                    <RenderExtraButtonsRightComp
                        setIsLookupOnline={setIsLookupOnline}
                        isLookupOnline={isLookupOnline}
                    />
                </div>
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
