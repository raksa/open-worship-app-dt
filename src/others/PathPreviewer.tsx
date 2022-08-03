import { selectDirs } from '../server/appHelper';
import DirSource from '../helper/DirSource';

export default function PathPreviewer({ dirSource }: {
    dirSource: DirSource,
    prefix: string
}) {
    const rotateC = dirSource.fileSources === null ? 'rotating' : '';
    return (
        <div className='input-group mb-3'>
            {dirSource.dirPath &&
                <button className={`btn btn-secondary ${rotateC}`}
                    type='button'
                    onClick={() => dirSource.fireReloadEvent()}>
                    <i className='bi bi-arrow-clockwise' />
                </button>
            }
            <input type='text' className='form-control' value={dirSource.dirPath}
                onChange={(e) => {
                    dirSource.dirPath = e.target.value;
                }} />
            <button className='btn btn-secondary' type='button'
                onClick={() => {
                    const dirs = selectDirs();
                    if (dirs.length) {
                        dirSource.dirPath = dirs[0];
                    }
                }}>
                <i className='bi bi-folder2-open' />
            </button>
        </div>
    );
}
