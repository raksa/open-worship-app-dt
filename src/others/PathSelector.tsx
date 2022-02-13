import './PathSelector.scss';

import {
    copyToClipboard,
    isMac,
    openExplorer,
    selectDirs,
} from '../helper/appHelper';
import { showAppContextMenu } from './AppContextMenu';
import { useStateSettingBoolean } from '../helper/settingHelper';

export default function PathSelector({
    dirPath,
    onRefresh,
    onChangeDirPath,
    onSelectDirPath,
    prefix,
}: {
    dirPath: string,
    onRefresh: () => void,
    onChangeDirPath: (dir: string) => void,
    onSelectDirPath: (dir: string) => void
    prefix: string;
}) {
    const [showing, setShowing] = useStateSettingBoolean(`${prefix}-showing-path-selector`, false);
    const isShowing = !dirPath || showing;
    return (
        <div className="path-selector" onContextMenu={(e) => {
            showAppContextMenu(e, [
                {
                    title: 'Copy to Clipboard',
                    onClick: () => {
                        copyToClipboard(dirPath);
                    },
                },
                {
                    title: `Reveal in ${isMac() ? 'Finder' : 'File Explorer'}`,
                    onClick: () => {
                        openExplorer(dirPath);
                    },
                },
            ]);
        }}>
            <div className='path-previewer pointer' onClick={() => setShowing(!showing)}>
                <i className={`bi ${isShowing ? 'bi-chevron-down' : 'bi-chevron-right'}`} />
                {dirPath && <div className='ellipsis-left border-white-round px-1' title={dirPath}>
                    {dirPath}</div>}
            </div>
            {isShowing &&
                <div className="input-group mb-3">
                    <button className="btn btn-secondary" type="button"
                        onClick={onRefresh}>
                        <i className="bi bi-arrow-clockwise" />
                    </button>
                    <input type="text" className="form-control" value={dirPath}
                        onChange={(e) => {
                            onChangeDirPath(e.target.value);
                        }} />
                    <button className="btn btn-secondary" type="button"
                        onClick={() => {
                            const dirs = selectDirs();
                            if (dirs.length) {
                                onSelectDirPath(dirs[0]);
                            }
                        }}>
                        <i className="bi bi-folder2-open" />
                    </button>
                </div>
            }
        </div>
    );
}
