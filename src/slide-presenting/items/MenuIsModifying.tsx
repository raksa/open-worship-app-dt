import KeyboardEventListener from '../../event/KeyboardEventListener';
import Slide from '../../slide-list/Slide';

export default function MenuIsModifying({
    slide,
    eventMapper,
}: {
    slide: Slide,
    eventMapper: any,
    isHavingHistories: boolean,
}) {
    return (
        <>
            <button type='button'
                className='btn btn-sm btn-info'
                disabled={!slide.isChanged}
                onClick={() => {
                    slide.discardChanged();
                }}>Discard Changed</button>
            <button type='button'
                className='btn btn-sm btn-success'
                disabled={!slide.isChanged}
                data-tool-tip={KeyboardEventListener
                    .toShortcutKey(eventMapper)}
                title='save slide thumbs'
                onClick={() => {
                    slide.save();
                }}>Save</button>
        </>
    );
}
