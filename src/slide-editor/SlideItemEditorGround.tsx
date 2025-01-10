import './SlideItemEditorPreviewer.scss';

import { SelectedEditingSlideItemContext } from '../slide-list/SlideItem';
import SlideItemEditorComp from './SlideItemEditorComp';
import { use } from 'react';

export default function SlideItemEditorGround() {
    const selectedSlideItemContext = use(SelectedEditingSlideItemContext);
    if (!selectedSlideItemContext?.selectedSlideItem) {
        return <div>No slide item selected</div>;
    }
    return <SlideItemEditorComp />;
}
