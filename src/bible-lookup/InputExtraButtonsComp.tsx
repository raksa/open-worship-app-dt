import { createRef } from 'react';

import {
    checkIsBibleLookupInputFocused,
    INPUT_TEXT_CLASS,
    setBibleLookupInputFocus,
} from './selectionHelpers';
import { useAppEffect } from '../helper/debuggerHelpers';
import { useLookupBibleItemControllerContext } from '../bible-reader/LookupBibleItemController';
import {
    EventMapper as KeyboardEventMapper,
    toShortcutKey,
    useKeyboardRegistering,
} from '../event/KeyboardEventListener';
import { useInputTextContext } from './InputHandlerComp';

const escapeEventMap: KeyboardEventMapper = { key: 'Escape' };

export default function InputExtraButtonsComp() {
    const viewController = useLookupBibleItemControllerContext();
    const { inputText } = useInputTextContext();
    const extractButtonsRef = createRef<HTMLDivElement>();
    useAppEffect(() => {
        const wrapper = extractButtonsRef.current;
        const input = wrapper?.parentElement!.querySelector(
            `.${INPUT_TEXT_CLASS}`,
        ) as HTMLInputElement | null;
        if (input === null || wrapper === null) {
            return;
        }
        const inputRect = input.getBoundingClientRect();
        const parentRect = wrapper.parentElement!.getBoundingClientRect();
        wrapper.style.right = `${parentRect.right - inputRect.right + 5}px`;
        wrapper.style.zIndex = '5';
    }, []);
    const removeInputTextChunk = () => {
        const arr = inputText.split(' ').filter((str) => str !== '');
        if (arr.length === 1) {
            viewController.inputText = '';
            return;
        }
        arr.pop();
        const newInputText = arr.join(' ') + (arr.length > 0 ? ' ' : '');
        viewController.inputText = newInputText;
        setBibleLookupInputFocus();
    };
    useKeyboardRegistering(
        [escapeEventMap],
        () => {
            if (!checkIsBibleLookupInputFocused()) {
                setBibleLookupInputFocus();
                return;
            }
            removeInputTextChunk();
        },
        [inputText],
    );
    return (
        <div
            ref={extractButtonsRef}
            className={
                'd-flex justify-content-end align-items-center flex-column' +
                ' h-100 custom-clear-input-wrapper'
            }
            style={{ position: 'absolute', fontSize: '12px', lineHeight: '0' }}
        >
            <i
                className="bi bi-x app-caught-hover-pointer"
                title="Clear input"
                style={{
                    color: 'red',
                }}
                onClick={() => {
                    viewController.inputText = '';
                }}
            />
            <i
                className="bi bi-x app-caught-hover-pointer"
                title={`Clear input chunk [${toShortcutKey(escapeEventMap)}]`}
                style={{
                    color: 'var(--bs-danger-text-emphasis)',
                }}
                onClick={(event) => {
                    event.stopPropagation();
                    removeInputTextChunk();
                }}
            />
            <i
                className="bi bi-arrow-bar-right app-caught-hover-pointer"
                style={{
                    color: 'var(--bs-secondary-text-emphasis)',
                }}
            />
        </div>
    );
}
