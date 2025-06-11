import { showAppContextMenu } from '../context-menu/appContextMenuHelpers';
import { menuTitleRealFile } from '../helper/helpers';
import { copyToClipboard, showExplorer } from '../server/appHelpers';
import { pathBasename } from '../server/fileHelpers';

// TODO: check direction rtl error with /*
function cleanPath(path: string) {
    if (path.startsWith('/')) {
        path = path.substring(1);
    }
    return path;
}
function openContextMenu(dirPath: string, event: any) {
    showAppContextMenu(event, [
        {
            menuElement: 'Copy to Clipboard',
            onSelect: () => {
                copyToClipboard(dirPath);
            },
        },
        {
            menuElement: menuTitleRealFile,
            onSelect: () => {
                showExplorer(dirPath);
            },
        },
    ]);
}

export function PathPreviewerComp({
    dirPath,
    isShowingNameOnly = false,
    onClick,
}: Readonly<{
    dirPath: string;
    isShowingNameOnly?: boolean;
    onClick?: (event: any) => void;
}>) {
    const cleanedPath = cleanPath(dirPath);
    let path = cleanedPath;
    if (isShowingNameOnly) {
        path = pathBasename(cleanedPath);
        const index = path.indexOf('.');
        if (index > 0) {
            path = path.substring(0, index);
        }
    }
    return (
        <div
            className={
                'app-ellipsis-left app-border-white-round px-1 flex-fill' +
                ` ${onClick ? 'pointer' : ''}`
            }
            onContextMenu={openContextMenu.bind(null, dirPath)}
            onClick={onClick}
            title={cleanedPath}
        >
            {path}
        </div>
    );
}
