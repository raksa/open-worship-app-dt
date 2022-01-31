import { saveSlideItemThumbs } from '../helper/helpers';
import { SlideItemThumbType } from '../helper/slideType';
import { useSlideItemThumbSaving } from '../event/SlideListEventListener';
import { toastEventListener } from '../event/ToastEventListener';

export type ChangeHistory = { items: SlideItemThumbType[] };
export default function SlideItemThumbListMenu({
    isModifying,
    undo,
    redo,
    slideItemThumbs,
    setIsModifying,
    setSlideItemThumbs,
    setUndo,
    setRedo,
}: {
    isModifying: boolean,
    undo: ChangeHistory[],
    redo: ChangeHistory[],
    slideItemThumbs: SlideItemThumbType[],
    setIsModifying: (b: boolean) => void
    setSlideItemThumbs: (newItemThumbs: SlideItemThumbType[]) => void,
    setUndo: (undo: ChangeHistory[]) => void,
    setRedo: (redo: ChangeHistory[]) => void,
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
    }
    useSlideItemThumbSaving(save);
    return (
        <div style={{
            borderBottom: '1px solid #00000024',
            backgroundColor: '#00000020',
            minHeight: (!!undo.length || !!redo.length || isModifying) ? '35px' : '0px',
        }}>
            <div className="btn-group control float-end">
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
                    <div className='me-2'>
                        <button type="button" className="btn btn-sm btn-success"
                            title="clear background"
                            onClick={save}>
                            save</button>
                    </div>
                }
            </div>
        </div>
    );
}
