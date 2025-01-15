import './SlideEditorPreviewerComp.scss';

import SlideEditorComp from './SlideEditorComp';
import { use } from 'react';
import { SelectedEditingSlideContext } from '../app-document-list/appDocumentHelpers';

export default function SlideEditorGroundComp() {
    const selectedSlideContext = use(SelectedEditingSlideContext);
    if (!selectedSlideContext?.selectedSlide) {
        return <div>No slide selected</div>;
    }
    return <SlideEditorComp />;
}
