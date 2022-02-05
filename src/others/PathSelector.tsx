import './PathSelector.scss';

import {
    copyToClipboard,
    isMac,
    openExplorer,
    selectDirs,
} from '../helper/appHelper';
import { showAppContextMenu } from './AppContextMenu';

export default function PathSelector({
    dirPath,
    onRefresh,
    onChangeDirPath,
    onSelectDirPath,
}: {
    dirPath: string,
    onRefresh: () => void,
    onChangeDirPath: (dir: string) => void,
    onSelectDirPath: (dir: string) => void
}) {
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
        </div>
    );
}
