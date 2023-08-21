import {
    copyToClipboard, openExplorer,
} from '../server/appHelper';
import appProvider from '../server/appProvider';
import { showAppContextMenu } from './AppContextMenu';

// TODO: check direction rtl error with /*
const cleanPath = (path: string) => {
    if (path && path[0] === '/') {
        path = path.substring(1);
    }
    return path;
};

export function pathPreviewer(dirPath: string) {
    const onContextMenu = (event: any) => {
        showAppContextMenu(event as any, [
            {
                title: 'Copy to Clipboard',
                onClick: () => {
                    copyToClipboard(dirPath);
                },
            },
            {
                title: `Reveal in ${appProvider.systemUtils.isMac ?
                    'Finder' : 'File Explorer'}`,
                onClick: () => {
                    openExplorer(dirPath);
                },
            },
        ]);
    };
    return (
        <div className='ellipsis-left border-white-round px-1 flex-fill'
            onContextMenu={onContextMenu}
            title={cleanPath(dirPath)}>
            {cleanPath(dirPath)}
        </div>
    );
}
