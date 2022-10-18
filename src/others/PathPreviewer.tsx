import { selectDirs } from '../server/appHelper';
import DirSource from '../helper/DirSource';
import { useEffect, useState } from 'react';

export default function PathPreviewer({ dirSource }: {
    dirSource: DirSource,
    prefix: string
}) {
    const [text, setText] = useState('');
    useEffect(() => {
        setText(dirSource.dirPath);
    }, [dirSource]);
    const applyNewText = (newText: string) => {
        setText(newText);
        dirSource.dirPath = newText;
    };
    return (
        <div className='input-group mb-3'>
            {dirSource.dirPath &&
                <button className='btn btn-secondary'
                    type='button'
                    onClick={() => {
                        return dirSource.fireReloadEvent();
                    }}>
                    <i className='bi bi-arrow-clockwise' />
                </button>
            }
            <input type='text'
                className='form-control'
                value={text}
                onChange={(event) => {
                    applyNewText(event.target.value);
                }} />
            <button className='btn btn-secondary'
                type='button'
                onClick={() => {
                    const dirs = selectDirs();
                    if (dirs.length) {
                        applyNewText(dirs[0]);
                    }
                }}>
                <i className='bi bi-folder2-open' />
            </button>
        </div>
    );
}
