import './PathSelector.scss';

import {
    copyToClipboard,
    isMac,
    openExplorer,
    selectDirs,
} from '../helper/appHelper';
import { showAppContextMenu } from './AppContextMenu';
import { useStateSettingBoolean } from '../helper/settingHelper';
import DirSource from '../helper/DirSource';

export default function PathSelector({
    dirSource, prefix,
}: {
    dirSource: DirSource,
    prefix: string
}) {
    const [showing, setShowing] = useStateSettingBoolean(`${prefix}-selector-opened`, false);
    const isShowing = !dirSource.dirPath || showing;
    return (
        <div className="path-selector w-100"
            onContextMenu={(e) => {
                showAppContextMenu(e, [
                    {
                        title: 'Copy to Clipboard',
                        onClick: () => {
                            copyToClipboard(dirSource.dirPath);
                        },
                    },
                    {
                        title: `Reveal in ${isMac() ? 'Finder' : 'File Explorer'}`,
                        onClick: () => {
                            openExplorer(dirSource.dirPath);
                        },
                    },
                ]);
            }}>
            <div className='d-flex path-previewer pointer' onClick={() => {
                setShowing(!showing);
            }}>
                <i className={`bi ${isShowing ? 'bi-chevron-down' : 'bi-chevron-right'}`} />
                {dirSource.dirPath && <div className='ellipsis-left border-white-round px-1 flex-fill'
                    title={dirSource.dirPath}>
                    {dirSource.dirPath}</div>}
                <div className='px-2' onClick={(e) => {
                    e.stopPropagation();
                    dirSource.clearFileSources();
                }}>
                    <i className="bi bi-arrow-clockwise" />
                </div>
            </div>
            {isShowing &&
                <div className="input-group mb-3">
                    <button className="btn btn-secondary" type="button"
                        onClick={() => dirSource.clearFileSources()}>
                        <i className="bi bi-arrow-clockwise" />
                    </button>
                    <input type="text" className="form-control" value={dirSource.dirPath}
                        onChange={(e) => {
                            dirSource.dirPath = e.target.value;
                        }} />
                    <button className="btn btn-secondary" type="button"
                        onClick={() => {
                            const dirs = selectDirs();
                            if (dirs.length) {
                                dirSource.dirPath = dirs[0];
                            }
                        }}>
                        <i className="bi bi-folder2-open" />
                    </button>
                </div>
            }
        </div>
    );
}
