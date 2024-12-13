import InputHandler, {
    useInputTextContext,
} from './InputHandler';
import {
    genInputText,
} from '../bible-list/bibleHelpers';
import { setBibleSearchInputFocus } from './selectionHelpers';
import RenderExtraButtonsRight from './RenderExtraButtonsRight';
import { getPopupWindowTypeData } from '../app-modal/helpers';
import {
    SearchBibleItemViewController,
} from '../bible-reader/BibleItemViewController';
import InputHistory from './InputHistory';
import appProvider from '../server/appProvider';
import { ModalCloseButton } from '../app-modal/Modal';
import { useShowBibleSearchContext } from '../others/commonButtons';


export default function RenderBibleSearchHeader({
    isSearchOnline, setIsSearchOnline, setBibleKey,
}: Readonly<{
    editorInputText: string,
    isSearchOnline: boolean,
    setIsSearchOnline: (isSearchOnline: boolean) => void,
    setBibleKey: (bibleKey: string | null) => void,
}>) {
    const hideBibleSearchPopup = useShowBibleSearchContext(false);
    const { inputText, setInputText } = useInputTextContext();
    const { data } = getPopupWindowTypeData();

    const viewController = SearchBibleItemViewController.getInstance();
    const setInputText1 = (newText: string) => {
        setInputText(newText);
        setBibleSearchInputFocus();
    };
    viewController.setInputText = setInputText1;

    const handleBibleKeyChanging = async (
        oldBibleKey: string, newBibleKey: string,
    ) => {
        const newText = await genInputText(
            oldBibleKey, newBibleKey, inputText,
        );
        setBibleKey(newBibleKey);
        if (newText !== null) {
            setInputText1(newText);
        }
    };
    const isEditingBibleItem = !!data;
    return (
        <div className='card-header d-flex text-center w-100'>
            <div className='flex-item' style={{
                width: 'calc(50% - 175px)',
            }}>
                <InputHistory />
            </div>
            <div className='flex-item input-group app-input-group-header'
                style={{ width: 350 }}>
                <InputHandler
                    onBibleKeyChange={handleBibleKeyChanging}
                />
            </div>
            <div className={
                'flex-item flex-fill justify-content-end' +
                (!appProvider.isPageReader ? ' pe-5' : '')
            }>
                {isEditingBibleItem ? null : (
                    <div className='float-start'>
                        <RenderExtraButtonsRight
                            setIsSearchOnline={setIsSearchOnline}
                            isSearchOnline={isSearchOnline}
                        />
                    </div>
                )}
            </div>
            {hideBibleSearchPopup === null ? null : (
                <ModalCloseButton
                    close={() => {
                        hideBibleSearchPopup();
                    }}
                />
            )}
        </div>
    );
}
