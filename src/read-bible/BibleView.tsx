import './BibleView.scss';

import { showAppContextMenu } from '../others/AppContextMenu';
import BibleItem, {
    useBibleItemRenderText,
    useBibleItemRenderTitle,
} from '../bible-list/BibleItem';
import { copyToClipboard } from '../server/appHelper';
import BibleSelection from '../bible-search/BibleSelection';

export default function BibleView({
    bibleItem, onBibleChange, onClose,
}: {
    bibleItem: BibleItem,
    onBibleChange: (bibleKey: string) => void,
    onClose: () => void,
}) {
    const title = useBibleItemRenderTitle(bibleItem);
    const text = useBibleItemRenderText(bibleItem);
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
                        onChange={(bibleKey) => {
                            onBibleChange(bibleKey);
                        }} />
                </span>
                {title}
                <button className='btn-close float-end'
                    onClick={onClose} />
            </div>
            <div className='card-body p-3'>
                <p className='selectable-text'>{text}</p>
            </div>
        </div>
    );
}

