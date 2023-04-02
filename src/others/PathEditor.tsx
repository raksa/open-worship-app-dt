import { selectDirs } from '../server/appHelper';
import DirSource from '../helper/DirSource';
import { useState } from 'react';
import { useDSEvents } from '../helper/dirSourceHelpers';

export default function PathEditor({ dirSource }: {
    dirSource: DirSource,
    prefix: string
}) {
    const [text, setText] = useState(dirSource.dirPath);
    const [isDirPathValid, setIsDirPathValid] = useState(
        dirSource.isDirPathValid);
    useDSEvents(['path'], dirSource, () => {
        setText(dirSource.dirPath);
        setIsDirPathValid(dirSource.isDirPathValid);
    });
    const applyNewText = (newText: string) => {
        setText(newText);
        dirSource.dirPath = newText;
    };
    const dirValidCN = isDirPathValid ? 'is-valid' : (
        isDirPathValid === null ? '' : 'is-invalid');
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
                className={`form-control ${dirValidCN}`}
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
