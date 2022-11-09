import { clearBibleCache } from '../../server/bible-helpers/bibleHelpers1';
import {
    useDownloadedBibleInfoList,
    useOnlineBibleInfoList,
} from './helpers';
import SettingDownloadedBible from './SettingDownloadedBible';
import SettingOnlineBible from './SettingOnlineBible';

export default function SettingBible() {
    const [downloadedBbInfoList, setDownloadedBbInfoList] = useDownloadedBibleInfoList();
    const [onlineBbInfoList, setOnlineBbInfoList] = useOnlineBibleInfoList();
    const refresh = () => {
        setDownloadedBbInfoList(null);
        setOnlineBbInfoList(null);
        clearBibleCache();
    };
    return (
        <div className='w-100'>
            <h3>Downloaded Bible List</h3>
            <SettingDownloadedBible
                onlineBibleInfoList={onlineBbInfoList}
                downloadedBibleInfoList={downloadedBbInfoList}
                setOnlineBibleInfoList={setOnlineBbInfoList}
                setDownloadedBibleInfoList={setDownloadedBbInfoList}
                refresh={refresh} />
            <hr />
            <h3>Online Bible List</h3>
            <SettingOnlineBible
                onlineBibleInfoList={onlineBbInfoList}
                downloadedBibleInfoList={downloadedBbInfoList}
                setOnlineBibleInfoList={setOnlineBbInfoList}
                refresh={refresh} />
        </div>
    );
}
