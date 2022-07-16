import { useState } from 'react';

export function AskingNewName({ applyName }: {
    applyName: (n: string | null) => void,
}) {
    const [creatingNewName, setCreatingNewName] = useState('');
    return (
        <li className='list-group-item'>
            <div className='input-group'>
                <input type='text' className='form-control' placeholder='title'
                    value={creatingNewName}
                    aria-label='file name' aria-describedby='button-addon2' autoFocus
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && creatingNewName) {
                            applyName(creatingNewName);
                        } else if (e.key === 'Escape') {
                            applyName(null);
                        }
                    }}
                    onChange={(e) => {
                        // TODO: validate name
                        setCreatingNewName(e.target.value);
                    }} />
                <button className='btn btn-outline-success' type='button' id='button-addon2'
                    onClick={() => applyName(creatingNewName || null)}>
                    <i className='bi bi-plus' />
                </button>
            </div>
        </li>
    );
}
