import {
    keyboardEventListener,
} from '../../event/KeyboardEventListener';
import Slide from '../../slide-list/Slide';

export default function MenuIsModifying({
    slide, eventMapper, isHavingHistories,
}: {
    slide: Slide, eventMapper: any, isHavingHistories: boolean,
}) {
    const discardChanged = () => {
        return (
            <button type='button' className='btn btn-sm btn-info'
                onClick={() => {
                    slide.discardChanged();
                }}>Discard Changed</button>
        );
    };
    if (!slide.isChanged) {
        return isHavingHistories ? discardChanged() : null;
    }
    return (
        <>
            {discardChanged()}
            <button type='button' className='btn btn-sm btn-success tool-tip tool-tip-fade'
                data-tool-tip={keyboardEventListener.toShortcutKey(eventMapper)}
                title='save slide thumbs'
                onClick={() => {
                    slide.save();
                }}>Save</button>
        </>
    );
}
