import './Finder.scss';

import { useState } from 'react';
import appProvider from '../server/appProvider';

type SearchingOptions = {
    forward?: boolean;
    findNext?: boolean;
    matchCase?: boolean;
};
function findString(text: string, options: SearchingOptions = {}) {
    if (!text) {
        appProvider.messageUtils.sendData(
            'app:stop-search-in-page', 'clearSelection',
        );
        return;
    }
    appProvider.messageUtils.sendDataSync(
        'app:search-in-page', text, options,
    );
}

export default function Finder({ onClose }: Readonly<{
    onClose: () => void;
}>) {
    const [searchingText, _setSearchingText] = useState('');
    const [isMatchCase, setIsMatchCase] = useState(false);
    const setSearchingText = (text: string, options: SearchingOptions = {}) => {
        _setSearchingText(text);
        findString(text, {
            matchCase: isMatchCase,
            ...options,
        });
    };
    return (
        <div className='finder-container input-group'>
            <button className='btn btn-info' onClick={() => {
                setSearchingText(searchingText, {
                    forward: false,
                    findNext: true,
                });
            }}>
                <i className='bi bi-arrow-left' />
            </button>
            <button className='btn btn-info' onClick={() => {
                setSearchingText(searchingText, {
                    forward: true,
                    findNext: true,
                });
            }}>
                <i className='bi bi-arrow-right' />
            </button>
            <input type='text' className='form-control'
                value={searchingText}
                onChange={(event) => {
                    const text = event.target.value;
                    setSearchingText(text);
                }} />
            <div className='input-group-text'>
                Aa
                <input className='form-check-input mt-0' type='checkbox'
                    checked={isMatchCase}
                    onChange={(event) => {
                        const checked = event.target.checked;
                        setIsMatchCase(checked);
                        setSearchingText(searchingText, {
                            matchCase: checked,
                        });
                    }} />
            </div>
            <button className='btn btn-danger' onClick={() => {
                setSearchingText('');
                onClose();
            }}>
                <i className='bi bi-x-lg' />
            </button>
        </div>
    );
}
