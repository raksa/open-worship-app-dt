import './SlideItemThumbEditor.scss';

import { useState } from 'react';
import { useSlideItemThumbSelecting } from '../event/SlideListEventListener';
import { editorMapper } from './EditorBoxMapper';
import { getValidSlideItemThumbSelected } from '../slide-presenting/SlideItemThumbList';
import SlideItemThumb from '../slide-presenting/SlideItemThumb';
import SlideItemThumbEditorController from './SlideItemThumbEditorController';

export default function SlideItemThumbEditor() {
    const [slideItemThumb, setSlideItemThumb] = useState<SlideItemThumb | null>(
        getValidSlideItemThumbSelected());
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
