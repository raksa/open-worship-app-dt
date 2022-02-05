import { useState } from 'react';
import bibleHelper from '../bible-helper/bibleHelper';
import { toastEventListener } from '../event/ToastEventListener';

export function SettingBible() {
    const [bbList, setBbList] = useState(bibleHelper.getBibleList());
    const [isRefreshing, setIsRefreshing] = useState(false);
    return (
        <div className='w-100'>
            <div>
                <button disabled={isRefreshing}
                    className={`btn ${isRefreshing ? 'btn-success' : 'btn-primary'}`}
                    onClick={() => {
                        setIsRefreshing(true);
                        setBbList([]);
                        bibleHelper.getBibleListOnline().then((isSuccess) => {
                            if (!isSuccess) {
                                toastEventListener.showSimpleToast({
                                    title: 'Refreshing bible list',
                                    message: 'Unable to get bible list, please check your internet connection and try again!',
                                });
                            }
                            setBbList(bibleHelper.getBibleList());
                            setIsRefreshing(false);
                        });
                    }}
                ><i className={`bi bi-arrow-clockwise ${isRefreshing ? 'rotating' : ''}`}></i>
                    Refresh</button>
            </div>
            <ul className="list-group d-flex flex-fill">
                {bbList.map((bb, i) => {
                    return (
                        <BibleItem key={`${i}`} bible={bb} />
                    );
                })}
            </ul>
        </div>
    );
}
function BibleItem({ bible }: { bible: string }) {
    const [isDownloaded, setIsDownloaded] = useState(bibleHelper.checkExist(bible));
    const [dProgress, setDProgress] = useState<number | null>(null);
    return (
        <li className="list-group-item">
            <div>
                <span>{bible}</span>
                {dProgress === null ?
                    <div className='float-end'>
                        <DownloadOption isDownloaded={isDownloaded}
                            onDownload={() => {
                                setDProgress(0);
                                bibleHelper.download(bible, {
                                    onStart: (totalSize) => {
                                        toastEventListener.showSimpleToast({
                                            title: `Start downloading ${bible}`,
                                            message: `Total size${totalSize}mb`,
                                        });
                                    },
                                    onProgress: (percentage) => {
                                        setDProgress(percentage);
                                    },
                                    onDone: (error) => {
                                        if (error) {
                                            console.log(error);
                                            setIsDownloaded(false);
                                        } else {
                                            setIsDownloaded(true);
                                        }
                                        setDProgress(null);
                                    },
                                });
                            }} onDelete={() => {
                                bibleHelper.delete(bible);
                                setIsDownloaded(false);
                            }} />
                    </div> : <div>
                        <div className="progress">
                            <div className="progress-bar progress-bar-striped progress-bar-animated"
                                role="progressbar" aria-valuenow={dProgress * 100}
                                aria-valuemin={0} aria-valuemax={100} style={{ width: `${dProgress * 100}%` }}></div>
                        </div>
                    </div>
                }
            </div>
        </li>
    );
}
function DownloadOption({ isDownloaded, onDownload, onDelete }: {
    isDownloaded: boolean | null,
    onDownload: () => void,
    onDelete: () => void,
}) {
    if (isDownloaded === null) {
        return (
            <button disabled className='btn btn-danger'>Unable to Download
                <i className="bi bi-cloud-arrow-down" />
            </button>
        );
    }
    if (isDownloaded) {
        return (
            <button className='btn btn-warning'
                onClick={onDelete}>Delete</button>
        );
    }
    return (
        <button className='btn btn-info'
            onClick={onDownload}>Download
            <i className="bi bi-cloud-arrow-down" />
        </button>
    );
}
