import './BibleSelection.scss';

import { showAppContextMenu } from '../others/AppContextMenu';
import {
    getBibleInfoWithStatusList,
} from '../helper/bible-helpers/serverBibleHelpers';
import {
    useDownloadedBibleInfoList,
} from '../setting/bible-setting/bibleSettingHelpers';
import BibleSelectOption from './BibleSelectOption';

export async function showBibleOption(
    event: any, excludeBibleKey: string[],
    onSelect: (bibleKey: string) => void,
) {
    const bibleList = await getBibleInfoWithStatusList();
    const bibleListFiltered = bibleList.filter(([bibleKey]) => {
        return !excludeBibleKey.includes(bibleKey);
    });
    showAppContextMenu(event,
        bibleListFiltered.map(([bibleKey, isAvailable]) => {
            return {
                title: bibleKey,
                disabled: !isAvailable,
                onClick: () => {
                    onSelect(bibleKey);
                },
            };
        }));
}

export default function BibleSelection({ value, onChange }: Readonly<{
    value: string,
    onChange: (oldValue: string, newValue: string) => void,
}>) {
    const [bibleInfoList] = useDownloadedBibleInfoList();
    if (bibleInfoList === null) {
        return (
            <div>Loading ...</div>
        );
    }
    if (bibleInfoList === undefined) {
        return (
            <div className='alert alert-danger'>Error</div>
        );
    }
    return (
        <select className='form-select bible'
            value={value}
            onChange={(event) => {
                onChange(value, event.target.value);
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

export function BibleSelectionMini({
    value, onChange, isMinimal,
}: Readonly<{
    value: string,
    onChange: (oldValue: string, newValue: string) => void,
    isMinimal?: boolean,
}>) {
    const [bibleInfoList] = useDownloadedBibleInfoList();
    if (bibleInfoList === null) {
        return (
            <div>...</div>
        );
    }
    if (bibleInfoList === undefined) {
        return (
            <div className='badge rounded-pill text-bg-danger'>
                Error
            </div>
        );
    }
    return (
        <span className={
            'bible-selector pointer ' +
            (isMinimal ? ' bg-info' : 'badge rounded-pill text-bg-info')
        }
            onClick={(event) => {
                event.stopPropagation();
                showBibleOption(event, [value],
                    (bibleKey: string) => {
                        onChange(value, bibleKey);
                    });
            }}>
            {value}
        </span>
    );
}
