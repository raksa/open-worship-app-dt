import {
    copyToClipboard, openExplorer,
} from '../server/appHelpers';
import appProvider from '../server/appProvider';
import { showAppContextMenu } from './AppContextMenu';

// TODO: check direction rtl error with /*
function cleanPath(path: string) {
    if (path.startsWith('/')) {
        path = path.substring(1);
    }
    return path;
};
function openContextMenu(dirPath: string, event: any) {
    showAppContextMenu(event, [
        {
            menuTitle: 'Copy to Clipboard',
            onClick: () => {
                copyToClipboard(dirPath);
            },
        },
        {
            menuTitle: (
                `Reveal in ${appProvider.systemUtils.isMac ?
                    'Finder' : 'File Explorer'}`
            ),
            onClick: () => {
                openExplorer(dirPath);
            },
        },
    ]);
};

export function PathPreviewer({
    dirPath, isShowingNameOnly = false, onClick,
}: Readonly<{
    dirPath: string,
    isShowingNameOnly?: boolean,
    onClick?: (event: any) => void,
}>) {
    const cleanedPath = cleanPath(dirPath);
    let path = cleanedPath;
    if (isShowingNameOnly) {
        path = appProvider.pathUtils.basename(cleanedPath);
        const index = path.indexOf('.');
        if (index > 0) {
            path = path.substring(0, index);
        }
    }
    return (
        <div className={
            'app-ellipsis-left app-border-white-round px-1 flex-fill' +
            ` ${onClick ? 'pointer' : ''}`
        }
            onContextMenu={openContextMenu.bind(null, cleanedPath)}
            onClick={onClick}
            title={cleanedPath}>
            {path}
        </div>
    );
}
