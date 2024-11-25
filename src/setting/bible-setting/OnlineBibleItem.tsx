import { useState } from 'react';

import { handleError } from '../../helper/errorHelpers';
import {
    BibleMinimalInfoType, downloadBible, extractDownloadedBible,
} from '../../helper/bible-helpers/bibleDownloadHelpers';

function useDownloadBible(
    bibleInfo: BibleMinimalInfoType, onDownloaded: () => void,
): [number | null, () => void] {
    const [
        downloadingProgress, setDownloadingProgress,
    ] = useState<number | null>(null);
    const startDownloadBible = () => {
        setDownloadingProgress(0);
        downloadBible({
            bibleInfo,
            options: {
                onStart: (_) => { },
                onProgress: (percentage) => {
                    setDownloadingProgress(percentage);
                },
                onDone: (error, filePath) => {
                    (async () => {
                        if (error) {
                            handleError(error);
                        } else {
                            await extractDownloadedBible(filePath as string);
                            onDownloaded();
                        }
                        setDownloadingProgress(null);
                    })();
                },
            },
        });
    };
    return [downloadingProgress, startDownloadBible];
};

export default function OnlineBibleItem({
    bibleInfo, onDownloaded,
}: Readonly<{
    bibleInfo: BibleMinimalInfoType,
    onDownloaded: () => void,
}>) {
    const [downloadingProgress, startDownloadBible] = useDownloadBible(
        bibleInfo, onDownloaded,
    );
    return (
        <li className='list-group-item'>
            <div className='w-100'>
                <span>{bibleInfo.title} ({bibleInfo.key})</span>
                {downloadingProgress === null ? (
                    <div className='float-end'>
                        <button className='btn btn-info'
                            onClick={startDownloadBible}>
                            Download <i className='bi bi-cloud-arrow-down' />
                        </button>
                    </div>
                ) : (
                    <div>
                        <div className='progress'>
                            <div className={
                                'progress-bar progress-bar-striped ' +
                                'progress-bar-animated'
                            }
                                role='progressbar'
                                aria-valuenow={downloadingProgress * 100}
                                aria-valuemin={0}
                                aria-valuemax={100}
                                style={{
                                    width: `${downloadingProgress * 100}%`,
                                }}
                            />
                        </div>
                    </div>
                )}
            </div>
        </li>
    );
}
