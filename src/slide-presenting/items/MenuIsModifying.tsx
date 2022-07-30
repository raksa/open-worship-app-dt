import {
    keyboardEventListener,
} from '../../event/KeyboardEventListener';
import Slide from '../../slide-list/Slide';

export default function MenuIsModifying({
    slide, eventMapper, isHavingHistories,
}: {
    slide: Slide, eventMapper: any, isHavingHistories: boolean,
}) {
    const toRollback = () => {
        return (
            <button type='button' className='btn btn-sm btn-info'
                onClick={() => {
                    slide.discardChanged();
                }}>Rollback</button>
        );
    };
    if (!slide.isChanged) {
        return isHavingHistories ? toRollback() : null;
    }
    return (
        <>
            {toRollback()}
            <button type='button' className='btn btn-sm btn-success tool-tip tool-tip-fade'
                data-tool-tip={keyboardEventListener.toShortcutKey(eventMapper)}
                title='save slide thumbs'
                onClick={() => {
                    slide.save();
                }}>Save</button>
        </>
    );
}
