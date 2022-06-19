import './LyricView.scss';

import { cloneObject } from '../helper/helpers';
import LyricItem from '../lyric-list/LyricItem';

export default function LyricView({
    i, lyricItem, lyricItems, onLyricChange, onClose,
}: {
    i: number,
    lyricItem: LyricItem,
    lyricItems: LyricItem[],
    onLyricChange: (lyricPresent: LyricItem) => void,
    onClose: () => void,
}) {
    return (
        <div className="lyric-view flex-fill">
            <div className="input-group">
                <input className="form-control" type="text" placeholder='title'
                    value={lyricItem.title} onChange={(e) => {
                        const newItem = cloneObject(lyricItem);
                        newItem.title = e.target.value;
                        onLyricChange(newItem);
                    }} />
                {lyricItems.length > 1 &&
                    <button className="btn btn-outline-danger" onClick={onClose} >
                        <i className="bi bi-x-lg" />
                    </button>
                }
            </div>
            <textarea className='w-100 h-100 form-control'
                placeholder='Lyric, use "===" to break text block'
                value={lyricItem.text} onChange={(e) => {
                    const newItem = cloneObject(lyricItem);
                    newItem.text = e.target.value;
                    onLyricChange(newItem);
                }} />
        </div >
    );
}
