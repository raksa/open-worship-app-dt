import {
    useDownloadedBibleList,
    useOnlineBibleList,
} from './helpers';
import SettingDownloadedBible from './SettingDownloadedBible';
import SettingOnlineBible from './SettingOnlineBible';

export default function SettingBible() {
    const [downloadedBbList, setDownloadedBbList] = useDownloadedBibleList();
    const [onlineBbList, setOnlineBbList] = useOnlineBibleList();
    return (
        <div>
            <h3>Downloaded Bible List</h3>
            <SettingDownloadedBible
                onlineBibleList={onlineBbList}
                downloadedBibleList={downloadedBbList}
                setDownloadedBibleList={setDownloadedBbList} />
            <hr />
            <h3>Online Bible List</h3>
            <SettingOnlineBible
                onlineBibleList={onlineBbList}
                downloadedBibleList={downloadedBbList}
                setOnlineBibleList={setOnlineBbList} />
        </div>
    );
}
