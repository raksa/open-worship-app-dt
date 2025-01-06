import { useState } from 'react';

import { selectDirs } from '../server/appHelpers';
import DirSource from '../helper/DirSource';

export default function PathEditorComp({ dirSource }: Readonly<{
    dirSource: DirSource,
    prefix: string
}>) {
    const [text, setText] = useState(dirSource.dirPath);
    const handleNewTextSetting = (newText: string) => {
        setText(newText);
        dirSource.dirPath = newText;
    };
    let dirValidCN = 'is-valid';
    if (dirSource.isDirPathValid === null) {
        dirValidCN = '';
    } else if (!dirSource.isDirPathValid) {
        dirValidCN = 'is-invalid';
    }
    return (
        <div className='input-group mb-3'>
            {dirSource.dirPath ? (
                <button className='btn btn-secondary'
                    type='button'
                    onClick={() => {
                        return dirSource.fireReloadEvent();
                    }}>
                    <i className='bi bi-arrow-clockwise' />
                </button>
            ) : null}
            <input type='text'
                className={`form-control ${dirValidCN}`}
                value={text}
                onChange={(event) => {
                    handleNewTextSetting(event.target.value);
                }}
            />
            <button className='btn btn-secondary'
                type='button'
                onClick={() => {
                    const dirs = selectDirs();
                    if (dirs.length) {
                        handleNewTextSetting(dirs[0]);
                    }
                }}>
                <i className='bi bi-folder2-open' />
            </button>
        </div>
    );
}
