import { saveSlideItemThumbs } from '../helper/helpers';
import { SlideItemThumbType } from '../editor/slideType';
import { toastEventListener } from '../event/ToastEventListener';
import { keyboardEventListener, LinuxControlEnum, MacControlEnum, useKeyboardRegistering, WindowsControlEnum } from '../event/KeyboardEventListener';

export type ChangeHistory = { items: SlideItemThumbType[] };
export default function SlideItemThumbListMenu({
    isModifying,
    undo,
    redo,
    slideItemThumbs,
    isWrongDimension,
    setIsModifying,
    setSlideItemThumbs,
    setUndo,
    setRedo,
    fixSlideDimension,
}: {
    isModifying: boolean,
    undo: ChangeHistory[],
    redo: ChangeHistory[],
    slideItemThumbs: SlideItemThumbType[],
    isWrongDimension: boolean,
    setIsModifying: (b: boolean) => void
    setSlideItemThumbs: (newItemThumbs: SlideItemThumbType[]) => void,
    setUndo: (undo: ChangeHistory[]) => void,
    setRedo: (redo: ChangeHistory[]) => void,
    fixSlideDimension?: () => void,
}) {
    const undoChanges = () => {
        const lastDone = undo.pop() as ChangeHistory;
        setUndo([...undo]);
        setSlideItemThumbs(lastDone.items);
        setRedo([...redo, {
            items: [...slideItemThumbs],
        }]);
        setIsModifying(true);
    }
    const redoChanges = () => {
        const lastRollback = redo.pop() as ChangeHistory;
        setRedo([...redo]);
        setSlideItemThumbs(lastRollback.items);
        setUndo([...undo, {
            items: [...slideItemThumbs],
        }]);
        setIsModifying(true);
    }
    const save = () => {
        try {
            const newItemThumbs = slideItemThumbs.map((item) => {
                item.isEditing = false;
                return item;
            })
            if (saveSlideItemThumbs(newItemThumbs)) {
                setIsModifying(false)
                setSlideItemThumbs(newItemThumbs);
            } else {
                toastEventListener.showSimpleToast({
                    title: 'Saving Slide',
                    message: 'Unable to save slide due to internal error',
                });
            }
        } catch (error) {
            console.log(error);
        }
    };
    const eventMapper = {
        wControlKey: [WindowsControlEnum.Ctrl],
        mControlKey: [MacControlEnum.Ctrl],
        lControlKey: [LinuxControlEnum.Ctrl],
        key: 's',
    };
    useKeyboardRegistering(eventMapper, save);
    return (
        <div style={{
            borderBottom: '1px solid #00000024',
            backgroundColor: '#00000020',
            minHeight: (!!undo.length || !!redo.length || isModifying) ? '35px' : '0px',
        }}>
            <div className="btn-group control d-flex justify-content-center'">
                {!!undo.length &&
                    <button type="button" className="btn btn-sm btn-info"
                        title="clear all"
                        onClick={undoChanges}>
                        undo
                        <i className="bi bi-arrow-90deg-left"></i></button>
                }
                {!!redo.length &&
                    <button type="button" className="btn btn-sm btn-info"
                        title="clear background"
                        onClick={redoChanges}>
                        redo
                        <i className="bi bi-arrow-90deg-right"></i></button>
                }
                {isModifying &&
                    <button type="button" className="btn btn-sm btn-success tool-tip tool-tip-fade"
                        data-tool-tip={keyboardEventListener.toShortcutKey(eventMapper)}
                        title="save slide thumbs"
                        onClick={save}>save</button>
                }
                {isWrongDimension &&
                    <button type="button" className="btn btn-sm btn-warning"
                        title="⚠️ slide dimension is not match with present screen"
                        onClick={fixSlideDimension}>Fix Slide Dimension</button>
                }
            </div>
        </div>
    );
}
