import {
    toShortcutKey,
} from '../../event/KeyboardEventListener';
import Slide from '../../slide-list/Slide';

export default function MenuIsModifying({
    slide, eventMapper, isSlideChanged,
}: Readonly<{
    slide: Slide,
    eventMapper: any,
    isSlideChanged: boolean,
}>) {
    return (
        <>
            <button type='button'
                className='btn btn-sm btn-info'
                disabled={!isSlideChanged}
                onClick={() => {
                    slide.discardChanged();
                }}>Discard Changed</button>
            <button type='button'
                className='btn btn-sm btn-success'
                disabled={!isSlideChanged}
                data-tool-tip={toShortcutKey(eventMapper)}
                title='save slide thumbs'
                onClick={() => {
                    slide.save();
                }}>Save</button>
        </>
    );
}
