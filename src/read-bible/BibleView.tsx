import './BibleView.scss';

import { showAppContextMenu } from '../others/AppContextMenu';
import BibleItem, {
    useBibleItemRenderText,
    useBibleItemRenderTitle,
} from '../bible-list/BibleItem';
import { copyToClipboard } from '../server/appHelper';
import { useCallback } from 'react';
import { handleError } from '../helper/errorHelpers';
import { BibleSelectionMini } from '../bible-search/BibleSelection';

export default function BibleView({
    index, bibleItem, onClose, fontSize,
    onBibleChangeKey, onBibleChangeBibleItem,
}: {
    index: number,
    bibleItem: BibleItem,
    onClose: (index: number) => void,
    fontSize: number,
    onBibleChangeKey: (bibleKey: string, index: number) => void,
    onBibleChangeBibleItem: (bibleItem: BibleItem, index: number) => void,
}) {
    const title = useBibleItemRenderTitle(bibleItem);
    const text = useBibleItemRenderText(bibleItem);
    const onChangeCallback = useCallback((
        _: string, newBibleKey: string) => {
        onBibleChangeKey(newBibleKey, index);
    }, [index, onBibleChangeKey]);
    return (
        <div className='bible-view card flex-fill'
            style={{ minWidth: '30%' }}
            onDragOver={(event) => {
                event.preventDefault();
                event.currentTarget.classList.add('receiving-child');
            }}
            onDragLeave={(event) => {
                event.preventDefault();
                event.currentTarget.classList.remove('receiving-child');
            }}
            onDrop={async (event) => {
                event.currentTarget.classList.remove('receiving-child');
                const data = event.dataTransfer.getData('text');
                try {
                    const json = JSON.parse(data);
                    if (json.type === 'bibleItem') {
                        const bibleItem = BibleItem.fromJson(json.data);
                        onBibleChangeBibleItem(bibleItem, index);
                    }
                } catch (error) {
                    handleError(error);
                }
            }}
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
            {rendHeader(bibleItem.bibleKey, title, onChangeCallback,
                onClose, index)}
            <div className='card-body p-3'>
                <p className='selectable-text' style={{
                    fontSize: `${fontSize}px`,
                }}>{text}</p>
            </div>
        </div>
    );
}

function rendHeader(
    key: string, title: string,
    onChange: (oldBibleKey: string, newBibleKey: string) => void,
    onClose: (index: number) => void, index: number,
) {
    return (
        <div className='card-header'>
            <div className='d-flex'>
                <div className='flex-fill d-flex'>
                    <div>
                        <BibleSelectionMini value={key}
                            onChange={onChange} />
                    </div>
                    <div className='title'>
                        {title}
                    </div>
                </div>
                <div>
                    <button className='btn-close'
                        onClick={() => {
                            onClose(index);
                        }} />
                </div>
            </div>
        </div>
    );
}
