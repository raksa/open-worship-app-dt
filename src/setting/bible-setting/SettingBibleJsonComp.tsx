import {
    useLocalBibleInfoList, useOnlineBibleInfoList,
} from './bibleSettingHelpers';
import SettingDownloadedBibleComp from './SettingDownloadedBibleComp';
import SettingOnlineBibleComp from './SettingOnlineBibleComp';

export default function SettingBibleJsonComp() {
    const [
        localBbInfoList, setLocalBibleInfoList,
    ] = useLocalBibleInfoList();
    const [
        onlineBbInfoList, setOnlineBbInfoList,
    ] = useOnlineBibleInfoList();
    return (
        <div className='w-100 app-border-white-round p-2'>
            <h3>Downloaded Bible List</h3>
            <SettingDownloadedBibleComp
                onlineBibleInfoList={onlineBbInfoList}
                downloadedBibleInfoList={localBbInfoList}
                setDownloadedBibleInfoList={setLocalBibleInfoList}
            />
            <hr />
            <h3>Online Bible List</h3>
            <SettingOnlineBibleComp
                onlineBibleInfoList={onlineBbInfoList}
                downloadedBibleInfoList={localBbInfoList}
                setOnlineBibleInfoList={setOnlineBbInfoList}
                setDownloadedBibleInfoList={setLocalBibleInfoList}
            />
        </div>
    );
}
