import './SlideItemEditorPreviewer.scss';

import { SelectedEditingSlideItemContext } from '../slide-list/SlideItem';
import SlideItemEditor from './SlideItemEditor';
import CanvasController from './canvas/CanvasController';
import { use } from 'react';

export default function SlideItemEditorGround() {
    const selectedSlideItemContext = use(SelectedEditingSlideItemContext);
    if (
        selectedSlideItemContext === null ||
        selectedSlideItemContext.selectedSlideItem === null
    ) {
        return (
            <div>No slide item selected</div>
        );
    }
    CanvasController.getInstance().init(
        selectedSlideItemContext.selectedSlideItem,
    );
    return (
        <SlideItemEditor />
    );
}
