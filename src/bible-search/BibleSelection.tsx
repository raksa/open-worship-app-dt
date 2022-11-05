import { useDownloadedBibleList } from '../setting/SettingBible/helpers';
import BibleSelectOption from './BibleSelectOption';

export default function BibleSelection({ value, onChange }: {
    value: string,
    onChange: (value: string) => void,
}) {
    const [bibleInfoList] = useDownloadedBibleList();
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
            {bibleInfoList.map((bibleInfo, i) => {
                return (
                    <BibleSelectOption key={`${i}`}
                        bibleName={bibleInfo.key} />
                );
            })}
        </select>
    );
}