import { useState } from 'react';
import bibleHelper, {
    BibleMinimalInfoType,
} from '../../server/bible-helpers/bibleHelpers';
import ToastEventListener from '../../event/ToastEventListener';
import appProvider from '../../server/appProvider';
import { BibleListType } from './helpers';

export default function SettingOnlineBible({
    downloadedBibleList,
    onlineBibleList,
    setOnlineBibleList,
}: {
    downloadedBibleList: BibleListType,
    onlineBibleList: BibleListType,
    setOnlineBibleList: (bbList: BibleListType) => void
}) {
    const refreshHandler = () => {
        setOnlineBibleList(null);
    };
    if (onlineBibleList === null) {
        return <div>Loading...</div>;
    }
    if (onlineBibleList === undefined) {
        return <div>Unable to get online bible list</div>;
    }
    const bibleList = onlineBibleList.filter((bible) => {
        return !downloadedBibleList || downloadedBibleList.some((bb) => {
            return bb.key !== bible.key;
        });
    });
    return (
        <div className='w-100'>
            <div>
                <button className='btn btn-info'
                    onClick={refreshHandler}>
                    <i className='bi bi-arrow-clockwise' />
                    Refresh
                </button>
            </div>
            <ul className='list-group d-flex flex-fill'>
                {bibleList.map((bible, i) => {
                    return (
                        <OnlineBibleItem key={`${i}`}
                            bible={bible}
                            onDownloaded={() => {
                                setOnlineBibleList(null);
                            }} />
                    );
                })}
            </ul>
        </div>
    );
}

export function OnlineBibleItem({
    bible,
    onDownloaded,
}: {
    bible: BibleMinimalInfoType,
    onDownloaded: () => void,
}) {
    const { key, title } = bible;
    const [downloadingProgress, setDownloadingProgress] = useState<number | null>(null);
    const onDownloadHandler = () => {
        setDownloadingProgress(0);
        bibleHelper.download(key, {
            onStart: (totalSize) => {
                ToastEventListener.showSimpleToast({
                    title: `Start downloading ${key}`,
                    message: `Total size${totalSize}mb`,
                });
            },
            onProgress: (percentage) => {
                setDownloadingProgress(percentage);
            },
            onDone: (error) => {
                if (error) {
                    appProvider.appUtils.handleError(error);
                } else {
                    onDownloaded();
                }
                setDownloadingProgress(null);
            },
        });
    };
    return (
        <li className='list-group-item'>
            <div>
                <span>{title}({key})</span>
                <div className='float-end'>
                    <button className='btn btn-info'
                        onClick={onDownloadHandler}>
                        Download
                        <i className='bi bi-cloud-arrow-down' />
                    </button>
                </div>
                {downloadingProgress === null ?
                    (<div className='float-end'>
                        <button className='btn btn-info'
                            onClick={onDownloadHandler}>
                            Download
                            <i className='bi bi-cloud-arrow-down' />
                        </button>
                    </div>) : (<div>
                        <div className='progress'>
                            <div className='progress-bar progress-bar-striped progress-bar-animated'
                                role='progressbar'
                                aria-valuenow={downloadingProgress * 100}
                                aria-valuemin={0}
                                aria-valuemax={100}
                                style={{
                                    width: `${downloadingProgress * 100}%`,
                                }} />
                        </div>
                    </div>)
                }
            </div>
        </li>
    );
}
