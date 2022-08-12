import './BibleView.scss';

import bibleHelper from '../server/bible-helpers/bibleHelpers';
import { BibleSelectOption } from '../bible-search/InputHandler';
import { showAppContextMenu } from '../others/AppContextMenu';
import BibleItem, {
    useBibleItemRenderText,
    useBibleItemRenderTitle,
} from '../bible-list/BibleItem';
import { copyToClipboard } from '../server/appHelper';

export default function BibleView({
    bibleItem, onBibleChange, onClose,
}: {
    bibleItem: BibleItem,
    onBibleChange: (bibleName: string) => void,
    onClose: () => void,
}) {
    const title = useBibleItemRenderTitle(bibleItem);
    const text = useBibleItemRenderText(bibleItem);
    const bibleList = bibleHelper.getBibleList();
    return (
        <div className='bible-view card flex-fill'
            onContextMenu={(event) => {
                showAppContextMenu(event, [
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
                    <select className='form-select bible'
                        value={bibleItem.bibleName}
                        onChange={(event) => {
                            onBibleChange(event.target.value);
                        }}>
                        {bibleList.map((b, i) => {
                            return (
                                <BibleSelectOption key={`${i}`} bibleName={b} />
                            );
                        })}
                    </select>
                </span>
                {title}
                <button className='btn-close float-end'
                    onClick={onClose} />
            </div>
            <div className='card-body p-3'>
                <p className='select-text'>{text}</p>
            </div>
        </div>
    );
}

