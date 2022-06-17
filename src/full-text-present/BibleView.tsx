import './BibleView.scss';

import { BiblePresentType } from './previewingHelper';
import bibleHelper from '../bible-helper/bibleHelpers';
import {
    usePresentRenderText, usePresentRenderTitle,
} from '../bible-helper/helpers1';
import { BibleSelectOption } from '../bible-search/InputHandler';
import { showAppContextMenu } from '../others/AppContextMenu';
import appProvider from '../helper/appProvider';

export default function BibleView({ biblePresent, onBibleChange, onClose }: {
    i: number,
    biblePresent: BiblePresentType,
    onBibleChange: (bible: string) => void,
    onClose: () => void,
}) {
    const title = usePresentRenderTitle(biblePresent);
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
                        {bibleList.map((b, i) => <BibleSelectOption key={`${i}`} bible={b} />)}
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

