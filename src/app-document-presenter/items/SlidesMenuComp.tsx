import { getDefaultScreenDisplay } from '../../_screen/managers/screenHelpers';
import {
    EventMapper as KBEventMapper,
    useKeyboardRegistering,
} from '../../event/KeyboardEventListener';
import { useEditingHistoryStatus } from '../../others/EditingHistoryManager';
import {
    useSelectedVaryAppDocumentContext,
    useSlideWrongDimension,
} from '../../app-document-list/appDocumentHelpers';
import AppDocument, {
    WrongDimensionType,
} from '../../app-document-list/AppDocument';
import MenuIsModifying from './MenuIsModifying';

const savingEventMapper: KBEventMapper = {
    allControlKey: ['Ctrl'],
    key: 's',
};

function CheckingDimensionComp({
    wrongDimension,
}: Readonly<{
    wrongDimension: WrongDimensionType;
}>) {
    const selectedVaryAppDocument = useSelectedVaryAppDocumentContext();
    const screenDisplay = getDefaultScreenDisplay();
    if (!AppDocument.checkIsThisType(selectedVaryAppDocument)) {
        return null;
    }
    return (
        <button
            type="button"
            className="btn btn-sm btn-warning"
            title={
                'Fix slide dimension: ' +
                AppDocument.toWrongDimensionString(wrongDimension)
            }
            onClick={() => {
                selectedVaryAppDocument.fixSlideDimension(screenDisplay);
            }}
        >
            <i className="bi bi-hammer" />
        </button>
    );
}

export default function SlidesMenuComp() {
    const selectedVaryAppDocument = useSelectedVaryAppDocumentContext();
    const screenDisplay = getDefaultScreenDisplay();
    const { canUndo, canRedo, canSave } = useEditingHistoryStatus(
        selectedVaryAppDocument.filePath,
    );
    useKeyboardRegistering(
        [savingEventMapper],
        () => {
            if (!AppDocument.checkIsThisType(selectedVaryAppDocument)) {
                return;
            }
            selectedVaryAppDocument.save();
        },
        [selectedVaryAppDocument],
    );
    const wrongDimension = useSlideWrongDimension(
        selectedVaryAppDocument,
        screenDisplay,
    );
    if (!AppDocument.checkIsThisType(selectedVaryAppDocument)) {
        return null;
    }
    if (!(canUndo || canRedo || canSave || wrongDimension)) {
        return null;
    }
    return (
        <div
            style={{
                borderBottom: '1px solid #00000024',
                backgroundColor: '#00000020',
                minHeight: '35px',
            }}
        >
            <div className="btn-group control d-flex justify-content-center">
                <button
                    type="button"
                    className="btn btn-sm btn-info"
                    title="Undo"
                    disabled={!canUndo}
                    onClick={() => {
                        selectedVaryAppDocument.editingHistoryManager.undo();
                    }}
                >
                    <i className="bi bi-arrow-90deg-left" />
                </button>
                <button
                    type="button"
                    className="btn btn-sm btn-info"
                    title="Redo"
                    disabled={!canRedo}
                    onClick={() => {
                        selectedVaryAppDocument.editingHistoryManager.redo();
                    }}
                >
                    <i className="bi bi-arrow-90deg-right" />
                </button>
                <MenuIsModifying eventMapper={savingEventMapper} />
                {wrongDimension !== null ? (
                    <CheckingDimensionComp wrongDimension={wrongDimension} />
                ) : null}
            </div>
        </div>
    );
}
