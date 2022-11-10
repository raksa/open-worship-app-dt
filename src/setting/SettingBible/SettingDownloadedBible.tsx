import DownloadedBibleItem from './DownloadedBibleItem';
import { BibleListType } from './helpers';
import OnlineBibleItem from './OnlineBibleItem';

export default function SettingDownloadedBible({
    onlineBibleInfoList,
    downloadedBibleInfoList,
    setDownloadedBibleInfoList,
}: {
    onlineBibleInfoList: BibleListType,
    downloadedBibleInfoList: BibleListType,
    setDownloadedBibleInfoList: (bbList: BibleListType) => void,
}) {
    if (downloadedBibleInfoList === null) {
        return (
            <div>Loading...</div>
        );
    }
    if (downloadedBibleInfoList === undefined) {
        return (
            <div>Unable to get downloaded bible list</div>
        );
    }
    const bibleInfoList = downloadedBibleInfoList.map((bibleInfo) => {
        const foundBibleInfo = onlineBibleInfoList &&
            onlineBibleInfoList.find((bible1) => {
                return bible1.key === bibleInfo.key &&
                    bible1.version >= bibleInfo.version;
            });
        return {
            isDownloading: false,
            ...bibleInfo,
            isUpdatable: !!foundBibleInfo,
            filePath: foundBibleInfo?.filePath,
        };
    });
    return (
        <div className='w-100'>
            <div>
                <button className='btn btn-info'
                    onClick={() => {
                        setDownloadedBibleInfoList(null);
                    }}>
                    <i className='bi bi-arrow-clockwise' />
                    Refresh
                </button>
            </div>
            <ul className='list-group d-flex flex-fill'>
                {bibleInfoList.length === 0 ? (<div>
                    No bible downloaded
                </div>) : (<>
                    {bibleInfoList.map((bibleInfo, i) => {
                        if (bibleInfo.isDownloading) {
                            return (
                                <OnlineBibleItem key={`${i}`}
                                    bibleInfo={bibleInfo}
                                    onDownloaded={() => {
                                        setDownloadedBibleInfoList(null);
                                    }} />
                            );
                        }
                        return (
                            <DownloadedBibleItem key={`${i}`}
                                bibleInfo={bibleInfo}
                                onDeleted={() => {
                                    setDownloadedBibleInfoList(null);
                                }}
                                onUpdate={() => {
                                    bibleInfo.isDownloading = true;
                                    setDownloadedBibleInfoList([...bibleInfoList]);
                                }} />
                        );
                    })}
                </>)}
            </ul>
        </div>
    );
}
