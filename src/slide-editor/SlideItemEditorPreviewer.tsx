import './SlideItemEditorPreviewer.scss';

import { useEffect, useState } from 'react';
import { useSlideItemSelecting } from '../event/SlideListEventListener';
import { editorMapper } from './EditorBoxMapper';
import SlideItem from '../slide-list/SlideItem';
import SlideItemEditor from './SlideItemEditor';
import SlideItemList from '../slide-presenting/SlideItemList';

export default function SlideItemEditorPreviewer() {
    const [slideItem, setSlideItem] = useState<SlideItem | null | undefined>(undefined);
    useEffect(() => {
        if (slideItem === null) {
            SlideItem.getSelectedItem().then((item) => {
                setSlideItem(item || undefined);
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
    if (slideItem === undefined) {
        return (
            <SlideItemList />
        );
    }
    return (
        <SlideItemEditor slideItem={slideItem} />
    );
}
