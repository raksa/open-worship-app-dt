import './SlideItemEditorPreviewer.scss';

import { useEffect, useState } from 'react';
import {
    useSlideItemSelecting,
} from '../event/SlideListEventListener';
import { editorMapper } from './EditorBoxMapper';
import SlideItem from '../slide-presenting/SlideItem';
import SlideItemEditor from './SlideItemEditor';

export default function SlideItemEditorPreviewer() {
    const [slideItem, setSlideItem] = useState<SlideItem | null>(null);
    useEffect(() => {
        if (slideItem === null) {
            SlideItem.getSelectedItem()
                .then((item) => {
                    setSlideItem(item);
                }).catch((error) => {
                    console.log(error);
                });
        }
    }, [slideItem]);
    useSlideItemSelecting((item) => {
        if (item?.id === slideItem?.id) {
            return;
        }
        editorMapper.stopAllModes().then(() => {
            setSlideItem(item);
        });
    });
    if (slideItem === null) {
        return (
            <div className='slide-item-editor empty'
                style={{ fontSize: '3em', padding: '20px' }}>
                No Slide Item Thumb Selected 😐
            </div>
        );
    }
    return (
        <SlideItemEditor slideItem={slideItem} />
    );
}
