import './SlideItemThumbEditor.scss';

import { useEffect, useState } from 'react';
import {
    useSlideItemThumbSelecting,
} from '../event/SlideListEventListener';
import { editorMapper } from './EditorBoxMapper';
import SlideItem from '../slide-presenting/SlideItem';
import SlideItemThumbEditorController from './SlideItemThumbEditorController';

export default function SlideItemThumbEditor() {
    const [slideItemThumb, setSlideItemThumb] = useState<SlideItem | null>(null);
    useEffect(() => {
        if (slideItemThumb === null) {
            SlideItem.getValidSlideItemThumbSelected()
                .then((item) => {
                    setSlideItemThumb(item);
                }).catch((error) => {
                    console.log(error);
                });
        }
    }, [slideItemThumb]);
    useSlideItemThumbSelecting((item) => {
        if (item?.id === slideItemThumb?.id) {
            return;
        }
        editorMapper.stopAllModes().then(() => {
            setSlideItemThumb(item);
        });
    });
    if (slideItemThumb === null) {
        return (
            <div className='item-thumb-editor empty'
                style={{ fontSize: '3em', padding: '20px' }}>
                No Slide Item Thumb Selected 😐
            </div>
        );
    }
    return (
        <SlideItemThumbEditorController
            slideItemThumb={slideItemThumb} />
    );
}
