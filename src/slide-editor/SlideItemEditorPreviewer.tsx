import './SlideItemEditorPreviewer.scss';

import { useEffect, useState } from 'react';
import {
    useSlideItemSelecting,
} from '../event/SlideListEventListener';
import { editorMapper } from './EditorBoxMapper';
import SlideItem from '../slide-presenting/SlideItem';
import SlideItemEditor from './SlideItemEditor';
import FileReadError from '../others/FileReadError';
import { showAppContextMenu } from '../others/AppContextMenu';

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
            <FileReadError onContextMenu={(e) => {
                showAppContextMenu(e, [{
                    title: 'Reload', onClick: () => setSlideItem(null),
                }]);
            }} />
        );
    }
    return (
        <SlideItemEditor slideItem={slideItem} />
    );
}
