import FileReadError from '../others/FileReadError';
import PlaylistItem from './PlaylistItem';
import SlideItemRendererHtml
    from '../slide-presenter/items/SlideItemRendererHtml';
import SlideListEventListener from '../event/SlideListEventListener';

export default function PlaylistSlideItem({ playlistItem }: Readonly<{
    playlistItem: PlaylistItem,
}>) {
    const item = null;
    if (item === null) {
        return (
            <FileReadError />
        );
    }
    return (
        <div className='card overflow-hidden'
            onClick={() => {
                SlideListEventListener.selectSlideItem(item);
            }}>
            <SlideItemRendererHtml slideItem={item} />
        </div>
    );
}
