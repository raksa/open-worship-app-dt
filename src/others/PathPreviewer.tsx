import {
    copyToClipboard, openExplorer,
} from '../server/appHelper';
import appProvider from '../server/appProvider';
import { showAppContextMenu } from './AppContextMenu';

// TODO: check direction rtl error with /*
const cleanPath = (path: string) => {
    if (path.startsWith('/')) {
        path = path.substring(1);
    }
    return path;
};

export function pathPreviewer({
    dirPath, isShowingNameOnly = false,
}: {
    dirPath: string, isShowingNameOnly?: boolean,
}) {
    const onContextMenu = (event: any) => {
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
        <div className='ellipsis-left border-white-round px-1 flex-fill'
            onContextMenu={onContextMenu}
            title={cleanedPath}>
            {path}
        </div>
    );
}
