import { openConfirm } from '../alert/HandleAlert';
import FileSource from '../helper/FileSource';
import { showAppContextMenu } from '../others/AppContextMenu';

export default function SlideFilePdf({
    index,
    fileSource,
}: {
    index: number,
    fileSource: FileSource,
}) {
    const applyClick = () => {
        console.log(fileSource.src);
    };
    return (
        <li className='list-group-item mx-1 pointer'
            onContextMenu={(event) => {
                showAppContextMenu(event as any, [{
                    title: 'Delete',
                    onClick: () => {
                        openConfirm(`Deleting "${fileSource.fileName}"`,
                            'Are you sure to delete this PDF file?')
                            .then((isOk) => {
                                if (isOk) {
                                    fileSource.delete();
                                }
                            });
                    },
                }]);
            }}
            title={fileSource.filePath}
            onClick={applyClick}
            data-index={index + 1}>
            <i className='bi bi-filetype-pdf' />
            {fileSource.name}
        </li >
    );
}
