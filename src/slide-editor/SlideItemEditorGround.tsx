import './SlideItemEditorPreviewer.scss';

import { useSelectedSlideItem } from '../slide-list/SlideItem';
import SlideItemEditor from './SlideItemEditor';
import CanvasController from './canvas/CanvasController';

export default function SlideItemEditorGround() {
    const { selectedSlideItem } = useSelectedSlideItem();
    CanvasController.getInstance().init(selectedSlideItem);
    return (
        <SlideItemEditor />
    );
}
