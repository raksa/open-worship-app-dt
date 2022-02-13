import './BibleView.scss';

import { BiblePresentType } from './fullTextPresentHelper';
import bibleHelper from '../bible-helper/bibleHelper';
import { biblePresentToTitle, usePresentRenderText } from '../bible-helper/helpers';
import { BibleSelectOption } from '../bible-search/InputHandler';
import { showAppContextMenu } from '../others/AppContextMenu';
import appProvider from '../helper/appProvider';

export default function BibleView({ biblePresent, onBibleChange, onClose }: {
    i: number,
    biblePresent: BiblePresentType,
    onBibleChange: (bible: string) => void,
    onClose: () => void,
}) {
    const title = biblePresentToTitle(biblePresent);
    const text = usePresentRenderText(biblePresent);
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
                    <select className="form-select bible" value={biblePresent.bible}
                        onChange={(event) => {
                            onBibleChange(event.target.value);
                        }}>
                        {bibleList.map((b, i) => <BibleSelectOption key={`${i}`} b={b} />)}
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

