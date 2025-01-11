import { toShortcutKey } from '../../event/KeyboardEventListener';
import EditingHistoryManager, {
    useEditingHistoryStatus,
} from '../../others/EditingHistoryManager';
import { useSelectedVaryAppDocumentContext } from '../../slide-list/appDocumentHelpers';

export default function MenuIsModifying({
    eventMapper,
}: Readonly<{
    eventMapper: any;
}>) {
    const selectedSlide = useSelectedVaryAppDocumentContext();
    const { canSave } = useEditingHistoryStatus(selectedSlide.filePath);
    return (
        <>
            <button
                type="button"
                className="btn btn-sm btn-danger"
                title="Discard changed"
                disabled={!canSave}
                onClick={() => {
                    EditingHistoryManager.getInstance(
                        selectedSlide.filePath,
                    ).discard();
                }}
            >
                <i className="bi bi-x-octagon" />
            </button>
            <button
                type="button"
                className="btn btn-sm btn-success"
                disabled={!canSave}
                title={`Save [${toShortcutKey(eventMapper)}]`}
                onClick={() => {
                    EditingHistoryManager.getInstance(
                        selectedSlide.filePath,
                    ).save();
                }}
            >
                <i className="bi bi-check2" />
            </button>
        </>
    );
}
