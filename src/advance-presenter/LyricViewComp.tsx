import './LyricViewComp.scss';

import LyricItem from '../lyric-list/LyricItem';

export default function LyricViewComp({
    index, lyricItem, lyricItems, onLyricChange, onClose,
}: Readonly<{
    index: number,
    lyricItem: LyricItem,
    lyricItems: LyricItem[],
    onLyricChange: (lyricPresent: LyricItem, index: number) => void,
    onClose: (index: number) => void,
}>) {
    return (
        <div className='app-lyric-view flex-fill'>
            <div className='input-group'>
                <input className='form-control' type='text'
                    placeholder='title'
                    value={lyricItem.title} onChange={(event) => {
                        const newItem = lyricItem.clone();
                        newItem.title = event.target.value;
                        onLyricChange(newItem, index);
                    }}
                />
                {lyricItems.length > 1 && (
                    <button className='btn btn-outline-danger'
                        onClick={() => {
                            onClose(index);
                        }} >
                        <i className='bi bi-x-lg' />
                    </button>
                )}
            </div>
            <textarea className='w-100 h-100 form-control'
                placeholder='Lyric, use "===" to break text block'
                value={lyricItem.content}
                onChange={(event) => {
                    const newItem = lyricItem.clone();
                    newItem.content = event.target.value;
                    onLyricChange(newItem, index);
                }}
            />
        </div >
    );
}
