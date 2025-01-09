import './BibleSelection.scss';

import {
    ContextMenuItemType, showAppContextMenu,
} from '../others/AppContextMenuComp';
import {
    useLocalBibleInfoList,
} from '../setting/bible-setting/bibleSettingHelpers';
import {
    BibleMinimalInfoType, getAllLocalBibleInfoList,
} from '../helper/bible-helpers/bibleDownloadHelpers';
import { showAppAlert } from '../popup-widget/popupWidgetHelpers';

export async function showBibleOption(
    event: any, excludeBibleKey: string[],
    onSelect: (bibleKey: string) => void,
) {
    let localBibleInfoList = await getAllLocalBibleInfoList();
    if (localBibleInfoList === null) {
        showAppAlert(
            'Unable to get bible info list',
            'We were sorry, but we are unable to get bible list at the moment' +
            ' please try again later'
        );
        return;
    }
    localBibleInfoList = localBibleInfoList.filter((bibleInfo) => {
        return !excludeBibleKey.includes(bibleInfo.key);
    });
    const localBibleInfoMap: { [locale: string]: BibleMinimalInfoType[] } = {};
    localBibleInfoList.forEach((bibleInfo) => {
        if (localBibleInfoMap[bibleInfo.locale] === undefined) {
            localBibleInfoMap[bibleInfo.locale] = [];
        }
        localBibleInfoMap[bibleInfo.locale].push(bibleInfo);
    });
    const menuItems: ContextMenuItemType[] = [];
    for (const locale in localBibleInfoMap) {
        const bibleInfoList = localBibleInfoMap[locale];
        menuItems.push(...[{
            menuTitle: locale,
            disabled: true,
        }, ...bibleInfoList.map((bibleInfo) => {
            return {
                menuTitle: `(${bibleInfo.key}) ${bibleInfo.title}`,
                title: bibleInfo.title,
                onClick: () => {
                    onSelect(bibleInfo.key);
                },
            };
        })]);
    }
    showAppContextMenu(event, menuItems);
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
    const [bibleInfoList] = useLocalBibleInfoList();
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
    onBibleKeyChange?: (oldBibleKey: string, newBibleKey: string) => void,
    isMinimal?: boolean,
}>) {
    const [bibleInfoList] = useLocalBibleInfoList();
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
    const isHandleClickEvent = onBibleKeyChange !== undefined;
    return (
        <span className={
            `bible-selector ${isHandleClickEvent ? 'pointer' : ''} ` +
            (isMinimal ? ' bg-info' : 'badge rounded-pill text-bg-info')
        }
            onClick={isHandleClickEvent ? (event) => {
                handleClickEvent(event, bibleKey, onBibleKeyChange);
            } : undefined}>
            <BibleKeyWithTile bibleKey={bibleKey} />
        </span>
    );
}

function BibleKeyWithTile({ bibleKey }: Readonly<{ bibleKey: string }>) {
    const [bibleInfoList] = useLocalBibleInfoList();
    const currentBibleInfo = bibleInfoList?.find(
        (bibleInfo) => bibleInfo.key === bibleKey
    );
    return (
        <span title={currentBibleInfo?.title}>
            {bibleKey}
        </span>
    );
}
