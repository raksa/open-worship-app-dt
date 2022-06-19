import './BibleView.scss';

import bibleHelper from '../bible-helper/bibleHelpers';
import { BibleSelectOption } from '../bible-search/InputHandler';
import { showAppContextMenu } from '../others/AppContextMenu';
import appProvider from '../helper/appProvider';
import BibleItem, {
    usePresentRenderText,
    usePresentRenderTitle,
} from '../bible-list/BibleItem';

export default function BibleView({
    bibleItem, onBibleChange, onClose,
}: {
    i: number,
    bibleItem: BibleItem,
    onBibleChange: (bibleName: string) => void,
    onClose: () => void,
}) {
    const title = usePresentRenderTitle(bibleItem);
    const text = usePresentRenderText(bibleItem);
    const bibleList = bibleHelper.getBibleList();
    return (
        <div className="bible-view card flex-fill" onContextMenu={(e) => {
            showAppContextMenu(e, [
                {
                    title: 'Copy', onClick: () => {
                        const toCopyText = `${title}\n${text}`;
                        appProvider.electron.clipboard.writeText(toCopyText);
                    },
                },
            ]);
        }}>
            <div className="card-header">
                <span className="input-group-text select float-start">
                    <select className="form-select bible" value={bibleItem.bibleName}
                        onChange={(event) => {
                            onBibleChange(event.target.value);
                        }}>
                        {bibleList.map((b, i) => <BibleSelectOption key={`${i}`} bibleName={b} />)}
                    </select>
                </span>
                {title}
                <button className="btn-close float-end" onClick={onClose} />
            </div>
            <div className="card-body p-3">
                <p className='select-text'>{text}</p>
            </div>
        </div>
    );
}

