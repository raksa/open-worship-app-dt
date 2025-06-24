import DirSource from '../helper/DirSource';
import { selectDefaultDataDirName } from '../setting/directory-setting/directoryHelpers';
import { goToGeneralSetting } from '../setting/SettingComp';

export function SelectDefaultDirButton({
    dirSource,
    defaultFolderName,
}: Readonly<{
    dirSource: DirSource;
    defaultFolderName: string;
}>) {
    return (
        <button
            className="btn btn-sm btn-info"
            onClick={() => {
                selectDefaultDataDirName(dirSource, defaultFolderName);
            }}
        >
            `Select Default "{defaultFolderName}"
        </button>
    );
}

export default function NoDirSelectedComp({
    dirSource,
    defaultFolderName,
}: Readonly<{
    dirSource: DirSource;
    defaultFolderName: string;
}>) {
    return (
        <div className="card p-1 w-100 overflow-hidden">
            <div className="card-body">
                <div
                    className="ms-2"
                    style={{
                        color: 'yellow',
                    }}
                >
                    <i className="bi bi-info-circle" />
                    <span>No directory selected</span>
                </div>
                <div className="d-flex flex-column">
                    <div className="m-2">
                        <SelectDefaultDirButton
                            dirSource={dirSource}
                            defaultFolderName={defaultFolderName}
                        />
                    </div>
                    <div className="m-2">
                        <button
                            className="btn btn-sm btn-warning"
                            onClick={() => {
                                goToGeneralSetting();
                            }}
                        >
                            <span>`Go to Settings </span>
                            <i className="bi bi-gear-wide-connected" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
