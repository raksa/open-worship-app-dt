import './SlideItemEditorPreviewer.scss';

import { useSelectedSlideItemContext } from '../slide-list/SlideItem';
import SlideItemEditor from './SlideItemEditor';
import CanvasController from './canvas/CanvasController';

export default function SlideItemEditorGround() {
    const { selectedSlideItem } = useSelectedSlideItemContext();
    CanvasController.getInstance().init(selectedSlideItem);
    return (
        <SlideItemEditor />
    );
}
