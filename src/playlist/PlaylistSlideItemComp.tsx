import FileReadErrorComp from '../others/FileReadErrorComp';
import PlaylistItem from './PlaylistItem';
import SlideRendererHtmlComp from '../app-document-presenter/items/SlideRendererHtmlComp';
import AppDocumentListEventListener from '../event/SlideListEventListener';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function PlaylistSlideItemComp({}: Readonly<{
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
            <SlideRendererHtmlComp slide={item} />
        </div>
    );
}
