import {
    useDownloadedBibleInfoList,
    useOnlineBibleInfoList,
} from './bibleSettingHelpers';
import SettingDownloadedBibleComp from './SettingDownloadedBibleComp';
import SettingOnlineBibleComp from './SettingOnlineBibleComp';

export default function SettingBibleJsonComp() {
    const [downloadedBibleInfoList, setDownloadedBibleInfoList] =
        useDownloadedBibleInfoList();
    const [onlineBbInfoList, setOnlineBbInfoList] = useOnlineBibleInfoList();
    return (
        <div className="w-100 app-border-white-round p-2">
            <h3>Downloaded Bible List</h3>
            <SettingDownloadedBibleComp
                onlineBibleInfoList={onlineBbInfoList}
                downloadedBibleInfoList={downloadedBibleInfoList}
                setDownloadedBibleInfoList={setDownloadedBibleInfoList}
            />
            <hr />
            <div>
                <h4>Online Bible List</h4>
                <div
                    style={{
                        color: 'yellow',
                        fontStyle: 'italic',
                    }}
                >
                    (Under development, please use XML instead)
                </div>
            </div>
            <SettingOnlineBibleComp
                onlineBibleInfoList={onlineBbInfoList}
                downloadedBibleInfoList={downloadedBibleInfoList}
                setOnlineBibleInfoList={setOnlineBbInfoList}
                setDownloadedBibleInfoList={setDownloadedBibleInfoList}
            />
        </div>
    );
}
