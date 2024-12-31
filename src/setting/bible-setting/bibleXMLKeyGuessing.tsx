import { useState } from 'react';

function BibleKeyXMLInputComp({
    defaultVale, onChange, guessingKeys,
}: Readonly<{
    defaultVale: string, onChange: (key: string) => void,
    guessingKeys?: string[],
}>) {
    const [value, setValue] = useState(defaultVale);
    const setValue1 = (value: string) => {
        setValue(value);
        onChange(value);
    };
    return (
        <div className='w-100 h-100'>
            <div>Define a Bible key</div>
            <div className='input-group'>
                <div className='input-group-text'>Key:</div>
                <input className='form-control'
                    type='text' value={value}
                    onChange={(e) => {
                        setValue1(e.target.value);
                    }}
                />
            </div>
            {guessingKeys !== undefined && guessingKeys.length > 0 ? (
                <div className='w-100'>
                    <div>Guessing keys:</div>
                    <div>
                        {guessingKeys.map((guessingKey) => {
                            return (
                                <button key={guessingKey}
                                    className='btn btn-sm btn-outline-info m-1'
                                    onClick={() => {
                                        setValue1(guessingKey);
                                    }}>
                                    {guessingKey}
                                </button>
                            );
                        })}
                    </div>
                </div>
            ) : null}
        </div>
    );
}

export function genBibleKeyXMLInput(
    key: string, onChange: (key: string) => void, guessingKeys?: string[],
) {
    return (
        <BibleKeyXMLInputComp
            defaultVale={key} onChange={onChange}
            guessingKeys={guessingKeys}
        />
    );
}
