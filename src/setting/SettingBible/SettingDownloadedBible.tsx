import {
    BibleMinimalInfoType, deleteBible,
} from '../../server/bible-helpers/bibleHelpers';
import ToastEventListener from '../../event/ToastEventListener';
import { BibleListType } from './helpers';
import { OnlineBibleItem } from './SettingOnlineBible';

export default function SettingDownloadedBible({
    onlineBibleList,
    downloadedBibleList,
    setDownloadedBibleList,
}: {
    onlineBibleList: BibleListType,
    downloadedBibleList: BibleListType,
    setDownloadedBibleList: (bbList: BibleListType) => void
}) {
    const refreshHandler = () => {
        setDownloadedBibleList(null);
    };
    if (downloadedBibleList === null) {
        return <div>Loading...</div>;
    }
    if (downloadedBibleList === undefined) {
        return <div>Unable to get downloaded bible list</div>;
    }
    const bibleList = downloadedBibleList.map((bible) => {
        const isUpdatable = onlineBibleList && onlineBibleList.some((bible1) => {
            return bible1.key === bible.key && bible1.version > bible.version;
        });
        return {
            isDownloading: false,
            ...bible,
            isUpdatable,
        };
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
                {bibleList.length === 0 ? (<div>No bible downloaded</div>) : (<>
                    {bibleList.map((bible, i) => {
                        if (bible.isDownloading) {
                            return (
                                <OnlineBibleItem key={`${i}`}
                                    bible={bible}
                                    onDownloaded={() => {
                                        setDownloadedBibleList(null);
                                    }} />
                            );
                        }
                        return (
                            <DownloadedBibleItem key={`${i}`}
                                bible={bible}
                                onDeleted={() => {
                                    setDownloadedBibleList(null);
                                }}
                                onUpdate={() => {
                                    bible.isDownloading = true;
                                    setDownloadedBibleList([...bibleList]);
                                }} />
                        );
                    })}
                </>)}
            </ul>
        </div>
    );
}

function DownloadedBibleItem({
    bible,
    onDeleted,
    onUpdate,
}: {
    bible: BibleMinimalInfoType,
    onDeleted: () => void,
    onUpdate: () => void,
}) {
    const { key, title } = bible;
    const onDeleteHandler = async () => {
        try {
            await deleteBible(key);
            onDeleted();
        } catch (error: any) {
            ToastEventListener.showSimpleToast({
                title: 'Deleting',
                message: error.message,
            });
        }
    };
    return (
        <li className='list-group-item'>
            <div>
                <span>{title}({key})</span>
                <div className='float-end'>
                    <button className='btn btn-warning'
                        onClick={onDeleteHandler}>
                        Delete
                    </button>
                    <button className='btn btn-warning'
                        onClick={() => {
                            onUpdate();
                        }}>
                        Update
                    </button>
                </div>
            </div>
        </li>
    );
}
