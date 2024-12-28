import {
    useDownloadedBibleInfoList, useOnlineBibleInfoList,
} from './bibleSettingHelpers';
import SettingDownloadedBibleComp from './SettingDownloadedBibleComp';
import SettingOnlineBibleComp from './SettingOnlineBibleComp';

export default function SettingBibleJsonComp() {
    const [
        downloadedBbInfoList, setDownloadedBbInfoList,
    ] = useDownloadedBibleInfoList();
    const [
        onlineBbInfoList, setOnlineBbInfoList,
    ] = useOnlineBibleInfoList();
    return (
        <div className='w-100'>
            <h3>Downloaded Bible List</h3>
            <SettingDownloadedBibleComp
                onlineBibleInfoList={onlineBbInfoList}
                downloadedBibleInfoList={downloadedBbInfoList}
                setDownloadedBibleInfoList={setDownloadedBbInfoList}
            />
            <hr />
            <h3>Online Bible List</h3>
            <SettingOnlineBibleComp
                onlineBibleInfoList={onlineBbInfoList}
                downloadedBibleInfoList={downloadedBbInfoList}
                setOnlineBibleInfoList={setOnlineBbInfoList}
                setDownloadedBibleInfoList={setDownloadedBbInfoList}
            />
        </div>
    );
}
