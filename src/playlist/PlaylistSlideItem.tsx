import {
    slideListEventListenerGlobal,
} from '../event/SlideListEventListener';
import Slide from '../slide-list/Slide';
import SlideItem from '../slide-list/SlideItem';
import { useReadFileToData } from '../helper/helpers';
import FileReadError from '../others/FileReadError';
import { SlideItemIFrame } from '../slide-presenting/items/SlideItemRenderers';
import PlaylistItem from './PlaylistItem';

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
                slideListEventListenerGlobal.selectSlideItem(item);
            }}>
            <SlideItemIFrame slideItem={item} />
        </div>
    );
}
