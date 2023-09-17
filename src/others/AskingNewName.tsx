import { useState } from 'react';

export default function AskingNewName({
    defaultName, applyName, customIcon,
}: {
    defaultName?: string,
    customIcon?: React.JSX.Element,
    applyName: (newName: string | null) => void,
}) {
    const [creatingNewName, setCreatingNewName] = useState(defaultName || '');
    return (
        <div className='input-group' onClick={(event) => {
            event.stopPropagation();
        }}>
            <input type='text'
                className='form-control'
                placeholder='title'
                value={creatingNewName}
                aria-label='file name'
                aria-describedby='button-addon2'
                autoFocus
                onKeyDown={(event) => {
                    if (event.key === 'Enter' && creatingNewName) {
                        applyName(creatingNewName);
                    } else if (event.key === 'Escape') {
                        applyName(null);
                    }
                }}
                onChange={(event) => {
                    // TODO: validate name
                    setCreatingNewName(event.target.value);
                }} />
            <button type='button'
                id='button-addon2'
                className='btn btn-outline-success'
                onClick={() => {
                    applyName(creatingNewName || null);
                }}>
                {customIcon || <i className='bi bi-check' />}
            </button>
        </div>
    );
}
