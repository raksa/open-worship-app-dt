import { LyricPresentType } from '../lyric-list/LyricList';
import './LyricView.scss';

export default function LyricView({ i, lyricPresent, onLyricChange, onClose }: {
    i: number,
    lyricPresent: LyricPresentType,
    onLyricChange: (lyricPresent: LyricPresentType) => void,
    onClose: () => void,
}) {
    return (
        <div className="lyric-view flex-fill">
            <div className="input-group">
                <input className="form-control" type="text" placeholder='title'
                    value={lyricPresent.title} onChange={(e) => {
                        lyricPresent.title = e.target.value;
                        onLyricChange(lyricPresent);
                    }} />
                {i !== 0 &&
                    <button className="btn btn-outline-danger" onClick={onClose} >
                        <i className="bi bi-x-lg" />
                    </button>
                }
            </div>
            <textarea className='w-100 h-100 form-control'
                placeholder='Lyric, use "===" to break text block'
                value={lyricPresent.text} onChange={(e) => {
                    lyricPresent.text = e.target.value;
                    onLyricChange(lyricPresent);
                }} />
        </div >
    );
}
