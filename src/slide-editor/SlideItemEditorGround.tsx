import './SlideItemEditorPreviewer.scss';

import { useState } from 'react';
import { useSlideItemSelecting } from '../event/SlideListEventListener';
import SlideItem from '../slide-list/SlideItem';
import SlideItemEditor from './SlideItemEditor';
import { useSlideSelecting } from '../event/PreviewingEventListener';
import CanvasController from './canvas/CanvasController';
import { useFSEvents } from '../helper/dirSourceHelpers';
import { useAppEffect } from '../helper/debuggerHelpers';

export default function SlideItemEditorGround() {
    const [slideItem, setSlideItem] = useState<
        SlideItem | null | undefined>(null);
    const reloadSlide = async () => {
        const newSlide = await SlideItem.getSelectedItem();
        setSlideItem(newSlide || undefined);
    };
    useAppEffect(() => {
        if (slideItem === null) {
            reloadSlide();
        }
    }, [slideItem]);
    useFSEvents(['select', 'history-update', 'delete'],
        slideItem?.fileSource, () => {
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
