import { toShortcutKey } from '../../event/KeyboardEventListener';
import { useSelectedSlideContext } from '../../slide-list/Slide';

export default function MenuIsModifying({
    eventMapper,
}: Readonly<{
    eventMapper: any;
    isHavingHistories: boolean;
}>) {
    const selectedSlide = useSelectedSlideContext();
    return (
        <>
            <button
                type="button"
                className="btn btn-sm btn-danger"
                title="Discard changed"
                disabled={!selectedSlide.isChanged}
                onClick={() => {
                    selectedSlide.discardChanged();
                }}
            >
                <i className="bi bi-x-octagon" />
            </button>
            <button
                type="button"
                className="btn btn-sm btn-success"
                disabled={!selectedSlide.isChanged}
                title={`Save [${toShortcutKey(eventMapper)}]`}
                onClick={() => {
                    selectedSlide.save();
                }}
            >
                <i className="bi bi-check2" />
            </button>
        </>
    );
}
