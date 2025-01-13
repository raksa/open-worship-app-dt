import { toShortcutKey } from '../../event/KeyboardEventListener';
import { useEditingHistoryStatus } from '../../others/EditingHistoryManager';
import { useSelectedVaryAppDocumentContext } from '../../app-document-list/appDocumentHelpers';
import AppDocument from '../../app-document-list/AppDocument';

export default function MenuIsModifying({
    eventMapper,
}: Readonly<{
    eventMapper: any;
}>) {
    const selectedVaryAppDocument = useSelectedVaryAppDocumentContext();
    const { canSave } = useEditingHistoryStatus(
        selectedVaryAppDocument.filePath,
    );
    if (!AppDocument.checkIsThisType(selectedVaryAppDocument)) {
        return null;
    }
    return (
        <>
            <button
                type="button"
                className="btn btn-sm btn-danger"
                title="Discard changed"
                disabled={!canSave}
                onClick={() => {
                    selectedVaryAppDocument.editingHistoryManager.discard();
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
                    selectedVaryAppDocument.save();
                }}
            >
                <i className="bi bi-floppy" />
            </button>
        </>
    );
}
