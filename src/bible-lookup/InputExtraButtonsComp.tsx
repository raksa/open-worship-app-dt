import { createRef } from 'react';

import { INPUT_TEXT_CLASS } from './selectionHelpers';
import { useAppEffect } from '../helper/debuggerHelpers';
import { useLookupBibleItemControllerContext } from '../bible-reader/LookupBibleItemController';

export default function InputExtraButtonsComp() {
    const viewController = useLookupBibleItemControllerContext();
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
                className="bi bi-x-lg app-caught-hover-pointer"
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
                title="Clear input"
                style={{
                    color: 'var(--bs-danger-text-emphasis)',
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
