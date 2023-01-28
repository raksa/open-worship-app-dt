import './BibleView.scss';

import { showAppContextMenu } from '../others/AppContextMenu';
import BibleItem, {
    useBibleItemRenderText,
    useBibleItemRenderTitle,
} from '../bible-list/BibleItem';
import { copyToClipboard } from '../server/appHelper';
import BibleSelection from '../bible-search/BibleSelection';
import { useCallback } from 'react';

export default function BibleView({
    index, bibleItem, onBibleChange, onClose,
}: {
    index: number,
    bibleItem: BibleItem,
    onBibleChange: (bibleKey: string, index: number) => void,
    onClose: (index: number) => void,
}) {
    const title = useBibleItemRenderTitle(bibleItem);
    const text = useBibleItemRenderText(bibleItem);
    const onChangeCallback = useCallback((bibleKey: string) => {
        onBibleChange(bibleKey, index);
    }, []);
    return (
        <div className='bible-view card flex-fill'
            onContextMenu={(event) => {
                showAppContextMenu(event as any, [
                    {
                        title: 'Copy', onClick: () => {
                            const toCopyText = `${title}\n${text}`;
                            copyToClipboard(toCopyText);
                        },
                    },
                ]);
            }}>
            <div className='card-header'>
                <span className='input-group-text select float-start'>
                    <BibleSelection value={bibleItem.bibleKey}
                        onChange={onChangeCallback} />
                </span>
                {title}
                <button className='btn-close float-end'
                    onClick={() => {
                        onClose(index);
                    }} />
            </div>
            <div className='card-body p-3'>
                <p className='selectable-text'>{text}</p>
            </div>
        </div>
    );
}

