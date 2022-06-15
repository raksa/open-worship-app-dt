import './LyricView.scss';

import { LyricItemType } from '../helper/lyricHelpers';

export default function LyricView({ i, lyricItem, onLyricChange, onClose }: {
    i: number,
    lyricItem: LyricItemType,
    onLyricChange: (lyricPresent: LyricItemType) => void,
    onClose: () => void,
}) {
    return (
        <div className="lyric-view flex-fill">
            <div className="input-group">
                <input className="form-control" type="text" placeholder='title'
                    value={lyricItem.title} onChange={(e) => {
                        lyricItem.title = e.target.value;
                        onLyricChange(lyricItem);
                    }} />
                {i !== 0 &&
                    <button className="btn btn-outline-danger" onClick={onClose} >
                        <i className="bi bi-x-lg" />
                    </button>
                }
            </div>
            <textarea className='w-100 h-100 form-control'
                placeholder='Lyric, use "===" to break text block'
                value={lyricItem.text} onChange={(e) => {
                    lyricItem.text = e.target.value;
                    onLyricChange(lyricItem);
                }} />
        </div >
    );
}
