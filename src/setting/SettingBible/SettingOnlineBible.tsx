import { useState } from 'react';
import {
    BibleMinimalInfoType,
    downloadBible,
    extractDownloadedBible,
} from '../../server/bible-helpers/bibleHelpers';
import ToastEventListener from '../../event/ToastEventListener';
import appProvider from '../../server/appProvider';
import { BibleListType } from './helpers';

export default function SettingOnlineBible({
    downloadedBibleInfoList,
    onlineBibleInfoList,
    setOnlineBibleInfoList,
    refresh,
}: {
    downloadedBibleInfoList: BibleListType,
    onlineBibleInfoList: BibleListType,
    setOnlineBibleInfoList: (bbList: BibleListType) => void
    refresh: () => void,
}) {
    if (onlineBibleInfoList === null) {
        return <div>Loading...</div>;
    }
    const getRefresher = () => {
        return (
            <button className='btn btn-info'
                onClick={() => {
                    setOnlineBibleInfoList(null);
                }}>
                <i className='bi bi-arrow-clockwise' />
                Refresh
            </button>
        );
    };
    if (onlineBibleInfoList === undefined) {
        return (
            <div>
                <div>
                    {getRefresher()}
                </div>
                Unable to get online bible list
            </div>
        );
    }
    const bibleInfoList = onlineBibleInfoList.filter((bible) => {
        return bible.filePath && (!downloadedBibleInfoList ||
            downloadedBibleInfoList.length === 0 ||
            downloadedBibleInfoList.every((bible1) => {
                return bible1.key !== bible.key;
            }));
    });

    return (
        <div className='w-100'>
            <div>
                {getRefresher()}
            </div>
            <ul className='list-group d-flex flex-fill'>
                {bibleInfoList.map((bibleInfo, i) => {
                    return (
                        <OnlineBibleItem key={`${i}`}
                            bibleInfo={bibleInfo}
                            onDownloaded={() => {
                                refresh();
                            }} />
                    );
                })}
            </ul>
        </div>
    );
}

export function OnlineBibleItem({
    bibleInfo,
    onDownloaded,
}: {
    bibleInfo: BibleMinimalInfoType,
    onDownloaded: () => void,
}) {
    const { key, title } = bibleInfo;
    const [downloadingProgress, setDownloadingProgress] = useState<number | null>(null);
    const onDownloadHandler = () => {
        setDownloadingProgress(0);
        downloadBible({
            bibleInfo,
            options: {
                onStart: (totalSize) => {
                    ToastEventListener.showSimpleToast({
                        title: `Start downloading ${key}`,
                        message: `Total file size ${totalSize}mb`,
                    });
                },
                onProgress: (percentage) => {
                    setDownloadingProgress(percentage);
                },
                onDone: async (error) => {
                    if (error) {
                        appProvider.appUtils.handleError(error);
                    } else {
                        await extractDownloadedBible(bibleInfo.filePath as string,
                            bibleInfo.key);
                        onDownloaded();
                    }
                    setDownloadingProgress(null);
                },
            },
        });
    };
    return (
        <li className='list-group-item'>
            <div className='w-100'>
                <span>{title}({key})</span>
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
