import Slide from '../slide-list/Slide';
import SlideItem from '../slide-list/SlideItem';
import { useReadFileToData } from '../helper/helpers';
import FileReadError from '../others/FileReadError';
import PlaylistItem from './PlaylistItem';
import SlideItemRendererHtml from '../slide-presenting/items/SlideItemRendererHtml';
import SlideListEventListener from '../event/SlideListEventListener';

export default function PlaylistSlideItem({ playlistItem }: {
    playlistItem: PlaylistItem,
}) {
    const filePath = playlistItem.fileSource.filePath;
    const result = SlideItem.extractItemSetting(filePath);
    if (result === null) {
        return (
            <FileReadError />
        );
    }
    const { id, fileSource } = result;
    const slide = useReadFileToData<Slide>(fileSource);
    const item = !slide ? null :
        (slide.items.find((newItem) => {
            return newItem.id === id;
        }) || null);
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
