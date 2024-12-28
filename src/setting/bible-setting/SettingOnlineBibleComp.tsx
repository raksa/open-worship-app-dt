import LoadingCompComp from '../../others/LoadingCompComp';
import { BibleListType } from './bibleSettingHelpers';
import OnlineBibleItemComp from './OnlineBibleItemComp';

export default function SettingOnlineBibleComp({
    downloadedBibleInfoList, onlineBibleInfoList, setOnlineBibleInfoList,
    setDownloadedBibleInfoList,
}: Readonly<{
    downloadedBibleInfoList: BibleListType,
    onlineBibleInfoList: BibleListType,
    setOnlineBibleInfoList: (bbList: BibleListType) => void
    setDownloadedBibleInfoList: (bbList: BibleListType) => void,
}>) {
    const handleDownloadedEvent = () => {
        setDownloadedBibleInfoList(null);
    };
    if (onlineBibleInfoList === null) {
        return (
            <LoadingCompComp />
        );
    }
    const getRefresher = () => {
        return (
            <button className='btn btn-info'
                onClick={() => {
                    setOnlineBibleInfoList(null);
                }}>
                <i className='bi bi-arrow-clockwise' /> Refresh
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
    const bibleInfoList = onlineBibleInfoList.filter((bibleInfo) => {
        return bibleInfo.filePath && (!downloadedBibleInfoList ||
            downloadedBibleInfoList.length === 0 ||
            downloadedBibleInfoList.every((bible1) => {
                return bible1.key !== bibleInfo.key;
            }));
    });

    return (
        <div className='w-100'>
            <div>
                {getRefresher()}
            </div>
            <ul className='list-group d-flex flex-fill'>
                {bibleInfoList.map((bibleInfo) => {
                    return (
                        <OnlineBibleItemComp key={bibleInfo.key}
                            bibleInfo={bibleInfo}
                            onDownloaded={handleDownloadedEvent}
                        />
                    );
                })}
            </ul>
        </div>
    );
}
