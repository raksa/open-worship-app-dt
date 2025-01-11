import FileReadErrorComp from '../others/FileReadErrorComp';
import PlaylistItem from './PlaylistItem';
import SlideItemRendererHtml from '../slide-presenter/items/SlideItemRendererHtml';
import AppDocumentListEventListener from '../event/SlideListEventListener';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function PlaylistSlideItem({}: Readonly<{
    playlistItem: PlaylistItem;
}>) {
    const item = null;
    if (item === null) {
        return <FileReadErrorComp />;
    }
    return (
        <div
            className="card overflow-hidden"
            onClick={() => {
                AppDocumentListEventListener.selectAppDocumentItem(item);
            }}
        >
            <SlideItemRendererHtml slideItem={item} />
        </div>
    );
}
