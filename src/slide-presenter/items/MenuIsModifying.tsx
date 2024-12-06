import {
    toShortcutKey,
} from '../../event/KeyboardEventListener';
import Slide from '../../slide-list/Slide';

export default function MenuIsModifying({
    slide, eventMapper,
}: Readonly<{
    slide: Slide,
    eventMapper: any,
    isHavingHistories: boolean,
}>) {
    return (
        <>
            <button type='button'
                className='btn btn-sm btn-info'
                title='Discard changed'
                disabled={!slide.isChanged}
                onClick={() => {
                    slide.discardChanged();
                }}>
                <i className='bi bi-x-octagon' />
            </button>
            <button type='button'
                className='btn btn-sm btn-success'
                disabled={!slide.isChanged}
                data-tool-tip={toShortcutKey(eventMapper)}
                title='Save'
                onClick={() => {
                    slide.save();
                }}>
                <i className='bi bi-check2' />
            </button>
        </>
    );
}
