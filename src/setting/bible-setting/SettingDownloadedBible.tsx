import { useCallback } from 'react';

import DownloadedBibleItem from './DownloadedBibleItem';
import { BibleListType } from './bibleSettingHelpers';
import OnlineBibleItem from './OnlineBibleItem';

type BibleInfoType = {
    isUpdatable: boolean;
    filePath: string | undefined;
    locale: 'km' | 'en';
    title: string;
    key: string;
    version: number;
    isDownloading: boolean;
};
export default function SettingDownloadedBible({
    onlineBibleInfoList, downloadedBibleInfoList, setDownloadedBibleInfoList,
}: Readonly<{
    onlineBibleInfoList: BibleListType,
    downloadedBibleInfoList: BibleListType,
    setDownloadedBibleInfoList: (bbList: BibleListType) => void,
}>) {
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
    const bibleInfoList = downloadedBibleInfoList
        .map<BibleInfoType>((bibleInfo) => {
            const foundBibleInfo = onlineBibleInfoList ?
                onlineBibleInfoList.find((bible1) => {
                    return bible1.key === bibleInfo.key &&
                        bible1.version >= bibleInfo.version;
                }) : undefined;
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
                    <i className='bi bi-arrow-clockwise' /> Refresh
                </button>
            </div>
            <ul className='list-group d-flex flex-fill'>
                {bibleInfoList.length === 0 ? (<div>
                    No bible downloaded
                </div>) : (<>
                    {bibleInfoList.map((bibleInfo, i) => {
                        return (
                            <RenderItem key={bibleInfo.key}
                                index={i}
                                bibleInfoList={bibleInfoList}
                                bibleInfo={bibleInfo}
                                setDownloadedBibleInfoList={
                                    setDownloadedBibleInfoList} />
                        );
                    })}
                </>)}
            </ul>
        </div>
    );
}

function RenderItem({
    bibleInfoList, bibleInfo, index, setDownloadedBibleInfoList,
}: Readonly<{
    bibleInfoList: BibleInfoType[],
    bibleInfo: BibleInfoType,
    index: number,
    setDownloadedBibleInfoList: (bbList: BibleListType) => void,
}>) {
    const onDownloadedCallback = useCallback(() => {
        setDownloadedBibleInfoList(null);
    }, [setDownloadedBibleInfoList]);
    const onDeletedCallback = useCallback(() => {
        setDownloadedBibleInfoList(null);
    }, [setDownloadedBibleInfoList]);
    const onUpdateCallback = useCallback(() => {
        bibleInfo.isDownloading = true;
        setDownloadedBibleInfoList([...bibleInfoList]);
    }, [bibleInfoList, bibleInfo, setDownloadedBibleInfoList]);
    if (bibleInfo.isDownloading) {
        return (
            <OnlineBibleItem key={`${index}`}
                bibleInfo={bibleInfo}
                onDownloaded={onDownloadedCallback} />
        );
    }
    return (
        <DownloadedBibleItem key={`${index}`}
            bibleInfo={bibleInfo}
            onDeleted={onDeletedCallback}
            onUpdate={onUpdateCallback} />
    );
}
