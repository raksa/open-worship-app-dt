import './BibleSelection.scss';

import {
    ContextMenuItemType, showAppContextMenu,
} from '../others/AppContextMenu';
import {
    useDownloadedBibleInfoList,
} from '../setting/bible-setting/bibleSettingHelpers';
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
                menuTitle: bibleInfo.title,
                otherChild: (
                    <span className='text-muted'>{bibleInfo.key}</span>
                ),
                title: bibleInfo.title,
                onClick: () => {
                    onSelect(bibleInfo.key);
                },
            };
        })
    );
    showAppContextMenu(event, contextMenuItems);
}

function handleClickEvent(
    event: any, bibleKey: string,
    onChange: (oldBibleKey: string, newBibleKey: string) => void,
) {
    event.stopPropagation();
    showBibleOption(event, [bibleKey], (newBibleKey: string) => {
        onChange(bibleKey, newBibleKey);
    });
}

export default function BibleSelection({
    bibleKey, onBibleKeyChange,
}: Readonly<{
    bibleKey: string,
    onBibleKeyChange: (oldBibleKey: string, newBibleKey: string) => void,
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
        <button className='input-group-text'
            onClick={(event) => {
                handleClickEvent(event, bibleKey, onBibleKeyChange);
            }}>
            <BibleKeyWithTile bibleKey={bibleKey} />
            <i className='bi bi-chevron-down' />
        </button>
    );
}

export function BibleSelectionMini({
    bibleKey, onBibleKeyChange, isMinimal,
}: Readonly<{
    bibleKey: string,
    onBibleKeyChange: (oldBibleKey: string, newBibleKey: string) => void,
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
                handleClickEvent(event, bibleKey, onBibleKeyChange);
            }}>
            <BibleKeyWithTile bibleKey={bibleKey} />
        </span>
    );
}

function BibleKeyWithTile({ bibleKey }: Readonly<{ bibleKey: string }>) {
    const [bibleInfoList] = useDownloadedBibleInfoList();
    const currentBibleInfo = bibleInfoList?.find(
        (bibleInfo) => bibleInfo.key === bibleKey
    );
    return (
        <span title={currentBibleInfo?.title}>
            {bibleKey}
        </span>
    );
}
