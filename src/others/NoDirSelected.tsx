import { openConfirm } from '../alert/alertHelpers';
import DirSource from '../helper/DirSource';
import { handleError } from '../helper/errorHelpers';
import { getDesktopPath } from '../server/appHelper';
import appProvider from '../server/appProvider';
import { fsCreateDir } from '../server/fileHelper';
import { showSimpleToast } from '../toast/toastHelpers';

async function selectDefault(dirSource: DirSource, dirName: string) {
    const desktopPath = getDesktopPath();
    const dirPath = appProvider.pathUtils.join(desktopPath, 'worship', dirName);
    const isOk = await openConfirm(
        'Select Default Folder', `This will select "${dirPath}"`,
    );
    if (isOk) {
        try {
            await fsCreateDir(dirPath);
        } catch (error: any) {
            if (!error.message.includes('file already exists')) {
                handleError(error);
            }
            showSimpleToast(
                'Creating Default Folder', `Fail to create folder "${dirPath}"`
            );
            return;
        }
        dirSource.dirPath = dirPath;
    }
}

export default function NoDirSelected({
    dirSource, defaultFolderName,
}: Readonly<{
    dirSource: DirSource, defaultFolderName: string,
}>) {
    return (
        <div className='card-body pb-5'>
            <div className='alert alert-warning'>
                <i className='bi bi-info-circle' />
                <div className='ms-2'>
                    No directory selected
                </div>
                <button className='btn btn-info'
                    onClick={() => {
                        selectDefault(dirSource, defaultFolderName);
                    }}>
                    Select Default "{defaultFolderName}"
                </button>
            </div>
        </div>
    );
}
