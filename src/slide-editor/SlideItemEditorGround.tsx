import './SlideItemEditorPreviewer.scss';

import SlideItemEditorComp from './SlideItemEditorComp';
import { use } from 'react';
import { SelectedEditingSlideItemContext } from '../slide-list/appDocumentHelpers';

export default function SlideItemEditorGround() {
    const selectedSlideItemContext = use(SelectedEditingSlideItemContext);
    if (!selectedSlideItemContext?.selectedVaryAppDocumentItem) {
        return <div>No slide item selected</div>;
    }
    return <SlideItemEditorComp />;
}
