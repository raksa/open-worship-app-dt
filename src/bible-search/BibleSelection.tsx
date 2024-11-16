import './BibleSelection.scss';

import {
    ContextMenuItemType, showAppContextMenu,
} from '../others/AppContextMenu';
import {
    useDownloadedBibleInfoList,
} from '../setting/bible-setting/bibleSettingHelpers';
import BibleSelectOption from './BibleSelectOption';
import {
    getDownloadedBibleInfoList,
} from '../helper/bible-helpers/bibleDownloadHelpers';
import { openAlert } from '../alert/alertHelpers';

export async function showBibleOption(
    event: any, excludeBibleKey: string[],
    onSelect: (bibleKey: string) => void,
) {
    const bibleInfoList = await getDownloadedBibleInfoList();
    if (bibleInfoList === null) {
        openAlert(
            'Unable to get bible info list',
            'We were sorry, but we are unable to get bible list at the moment' +
            ' please try again later'
        );
        return;
    }
    const contextMenuItems: ContextMenuItemType[] = (
        bibleInfoList.filter((bibleInfo) => {
            return !excludeBibleKey.includes(bibleInfo.key);
        }).map((bibleInfo) => {
            return {
                title: bibleInfo.key,
                onClick: () => {
                    onSelect(bibleInfo.key);
                },
            };
        })
    );
    showAppContextMenu(event, contextMenuItems);
}

export default function BibleSelection({ bibleKey, onChange }: Readonly<{
    bibleKey: string,
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
            value={bibleKey}
            onChange={(event) => {
                onChange(bibleKey, event.target.value);
            }}>
            {bibleInfoList.map((bibleInfo) => {
                return (
                    <BibleSelectOption key={bibleInfo.key}
                        bibleKey={bibleInfo.key}
                    />
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
