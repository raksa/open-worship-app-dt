import { useDownloadedBibleInfoList } from '../setting/SettingBible/helpers';
import BibleSelectOption from './BibleSelectOption';

export default function BibleSelection({ value, onChange }: {
    value: string,
    onChange: (value: string) => void,
}) {
    const [bibleInfoList] = useDownloadedBibleInfoList();
    if (bibleInfoList === null) {
        return (
            <div>Loading ...</div>
        );
    }
    if (bibleInfoList === undefined) {
        return (
            <div>Unable to get bible list</div>
        );
    }
    return (
        <select className='form-select bible'
            value={value}
            onChange={(event) => {
                onChange(event.target.value);
            }}>
            {bibleInfoList.map((bibleInfo) => {
                return (
                    <BibleSelectOption key={bibleInfo.key}
                        bibleKey={bibleInfo.key} />
                );
            })}
        </select>
    );
}
