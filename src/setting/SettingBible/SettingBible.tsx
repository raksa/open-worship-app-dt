import {
    useDownloadedBibleInfoList,
    useOnlineBibleInfoList,
} from './helpers';
import SettingDownloadedBible from './SettingDownloadedBible';
import SettingOnlineBible from './SettingOnlineBible';

export default function SettingBible() {
    const [downloadedBbInfoList, setDownloadedBbInfoList] = useDownloadedBibleInfoList();
    const [onlineBbInfoList, setOnlineBbInfoList] = useOnlineBibleInfoList();
    return (
        <div>
            <h3>Downloaded Bible List</h3>
            <SettingDownloadedBible
                onlineBibleInfoList={onlineBbInfoList}
                downloadedBibleInfoList={downloadedBbInfoList}
                setDownloadedBibleInfoList={setDownloadedBbInfoList} />
            <hr />
            <h3>Online Bible List</h3>
            <SettingOnlineBible
                onlineBibleInfoList={onlineBbInfoList}
                downloadedBibleInfoList={downloadedBbInfoList}
                setOnlineBibleInfoList={setOnlineBbInfoList} />
        </div>
    );
}
