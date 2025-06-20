import DirSource from '../helper/DirSource';
import { selectDefaultDataDirName } from '../setting/path-setting/directoryHelpers';

export default function NoDirSelectedComp({
    dirSource,
    defaultFolderName,
}: Readonly<{
    dirSource: DirSource;
    defaultFolderName: string;
}>) {
    return (
        <div className="card-body pb-5">
            <div className="alert alert-warning">
                <i className="bi bi-info-circle" />
                <div className="ms-2">No directory selected</div>
                <button
                    className="btn btn-info"
                    onClick={() => {
                        selectDefaultDataDirName(dirSource, defaultFolderName);
                    }}
                >
                    Select Default "{defaultFolderName}"
                </button>
            </div>
        </div>
    );
}
