import './FinderApp.scss';

import { useState } from 'react';

import { useKeyboardRegistering } from '../event/KeyboardEventListener';
import { SearchingOptions, findString } from './finderHelpers';

export default function FinderApp({ onClose }: Readonly<{
    onClose: () => void;
}>) {
    const [searchingText, setSearchingText] = useState('');
    const [isMatchCase, setIsMatchCase] = useState(false);
    useKeyboardRegistering([{ key: 'Escape' }], () => {
        if (!searchingText) {
            onClose();
            return;
        }
        setSearchingText1('');
    });
    useKeyboardRegistering([{ key: 'Enter' }], () => {
        if (!searchingText) {
            return;
        }
        setSearchingText1(searchingText, {
            forward: true,
            findNext: true,
        });
    });
    const setSearchingText1 = (
        text: string, options: SearchingOptions = {},
    ) => {
        setSearchingText(text);
        findString(text, {
            matchCase: isMatchCase,
            ...options,
        });
    };
    return (
        <div className='finder-container card w-100 h-100'
            data-bs-theme='dark'>
            <div className='card-body'>
                <div className='finder input-group'>
                    <button className='btn btn-info' onClick={() => {
                        setSearchingText1(searchingText, {
                            forward: false,
                            findNext: true,
                        });
                    }}>
                        <i className='bi bi-arrow-left' />
                    </button>
                    <button className='btn btn-info' onClick={() => {
                        setSearchingText1(searchingText, {
                            forward: true,
                            findNext: true,
                        });
                    }}>
                        <i className='bi bi-arrow-right' />
                    </button>
                    <input type='text' className='form-control'
                        autoFocus
                        value={searchingText}
                        onChange={(event) => {
                            const text = event.target.value;
                            setSearchingText1(text);
                        }}
                    />
                    <div className='input-group-text'>
                        Aa <input className='form-check-input mt-0'
                            type='checkbox'
                            checked={isMatchCase}
                            onChange={(event) => {
                                const checked = event.target.checked;
                                setIsMatchCase(checked);
                                setSearchingText1(searchingText, {
                                    matchCase: checked,
                                });
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
