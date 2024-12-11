import './SlideItemEditorPreviewer.scss';

import { useSelectedEditingSlideItemContext } from '../slide-list/SlideItem';
import SlideItemEditor from './SlideItemEditor';
import CanvasController from './canvas/CanvasController';

export default function SlideItemEditorGround() {
    const { selectedSlideItem } = useSelectedEditingSlideItemContext();
    CanvasController.getInstance().init(selectedSlideItem);
    return (
        <SlideItemEditor />
    );
}
