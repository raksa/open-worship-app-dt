import './LyricView.scss';

import LyricItem from '../lyric-list/LyricItem';

export default function LyricView({
    lyricItem, lyricItems, onLyricChange, onClose,
}: {
    lyricItem: LyricItem,
    lyricItems: LyricItem[],
    onLyricChange: (lyricPresent: LyricItem) => void,
    onClose: () => void,
}) {
    return (
        <div className='lyric-view flex-fill'>
            <div className='input-group'>
                <input className='form-control' type='text' placeholder='title'
                    value={lyricItem.title} onChange={(event) => {
                        const newItem = lyricItem.clone();
                        newItem.title = event.target.value;
                        onLyricChange(newItem);
                    }} />
                {lyricItems.length > 1 &&
                    <button className='btn btn-outline-danger' onClick={onClose} >
                        <i className='bi bi-x-lg' />
                    </button>
                }
            </div>
            <textarea className='w-100 h-100 form-control'
                placeholder='Lyric, use "===" to break text block'
                value={lyricItem.content} onChange={(event) => {
                    const newItem = lyricItem.clone();
                    newItem.content = event.target.value;
                    onLyricChange(newItem);
                }} />
        </div >
    );
}
