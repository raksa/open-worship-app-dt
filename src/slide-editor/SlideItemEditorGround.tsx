import './SlideItemEditorPreviewer.scss';

import { useEffect, useState } from 'react';
import { useSlideItemSelecting } from '../event/SlideListEventListener';
import SlideItem from '../slide-list/SlideItem';
import SlideItemEditor from './SlideItemEditor';
import { useSlideSelecting } from '../event/PreviewingEventListener';

export default function SlideItemEditorSlideItemEditorGround() {
    const [slideItem, setSlideItem] = useState<SlideItem | null | undefined>(null);
    useEffect(() => {
        if (slideItem === null) {
            SlideItem.getSelectedItem().then((item) => {
                setSlideItem(item || undefined);
            });
        }
        if (slideItem) {
            const registerEvent = slideItem.fileSource.registerEventListener(
                ['select', 'update', 'delete'], () => {
                    setSlideItem(null);
                });
            return () => {
                slideItem.fileSource.unregisterEventListener(registerEvent);
            };
        }
    }, [slideItem]);
    useSlideSelecting(() => setSlideItem(null));
    useSlideItemSelecting(setSlideItem);
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
