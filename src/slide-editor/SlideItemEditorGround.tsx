import './SlideItemEditorPreviewer.scss';

import { useEffect, useState } from 'react';
import { useSlideItemSelecting } from '../event/SlideListEventListener';
import SlideItem from '../slide-list/SlideItem';
import SlideItemEditor from './SlideItemEditor';
import { useSlideSelecting } from '../event/PreviewingEventListener';
import { useFSRefresh } from '../helper/FileSource';
import CanvasController from './canvas/CanvasController';

export default function SlideItemEditorGround() {
    const [slideItem, setSlideItem] = useState<SlideItem | null | undefined>(null);
    const reloadSlide = async () => {
        const newSlide = await SlideItem.getSelectedItem();
        setSlideItem(newSlide || undefined);
    };
    useEffect(() => {
        if (slideItem === null) {
            reloadSlide();
        }
    }, [slideItem]);
    useFSRefresh(['select', 'history-update', 'delete'],
        slideItem?.fileSource || null, () => {
            setSlideItem(null);
        });
    useSlideSelecting(() => setSlideItem(null));
    useSlideItemSelecting(setSlideItem);
    CanvasController.getInstance().init(slideItem || null);
    if (!slideItem) {
        return (
            <div className='slide-item-editor empty'
                style={{ fontSize: '3em', padding: '20px' }}>
                No Slide Item Selected 😐
            </div>
        );
    }
    return (
        <SlideItemEditor slideItem={slideItem} />
    );
}
