import {
    keyboardEventListener,
    LinuxControlEnum,
    MacControlEnum,
    useKeyboardRegistering,
    WindowsControlEnum,
} from '../event/KeyboardEventListener';
import SlideThumbsController from './SlideThumbsController';

export default function SlideItemThumbListMenu({ controller }: {
    controller: SlideThumbsController,
}) {
    const eventMapper = {
        wControlKey: [WindowsControlEnum.Ctrl],
        mControlKey: [MacControlEnum.Ctrl],
        lControlKey: [LinuxControlEnum.Ctrl],
        key: 's',
    };
    useKeyboardRegistering(eventMapper, () => controller.save());
    return (
        <div style={{
            borderBottom: '1px solid #00000024',
            backgroundColor: '#00000020',
            minHeight: (!!controller.undo.length || !!controller.redo.length
                || controller.isModifying) ? '35px' : '0px',
        }}>
            <div className="btn-group control d-flex justify-content-center'">
                {!!controller.undo.length &&
                    <button type="button" className="btn btn-sm btn-info"
                        title="clear all"
                        onClick={() => controller.undoChanges()}>
                        undo
                        <i className="bi bi-arrow-90deg-left"></i></button>
                }
                {!!controller.redo.length &&
                    <button type="button" className="btn btn-sm btn-info"
                        title="clear background"
                        onClick={() => controller.redoChanges()}>
                        redo
                        <i className="bi bi-arrow-90deg-right"></i></button>
                }
                {controller.isModifying &&
                    <button type="button" className="btn btn-sm btn-success tool-tip tool-tip-fade"
                        data-tool-tip={keyboardEventListener.toShortcutKey(eventMapper)}
                        title="save slide thumbs"
                        onClick={() => controller.save()}>save</button>
                }
                {controller.isWrongDimension &&
                    <button type="button" className="btn btn-sm btn-warning"
                        title="⚠️ slide dimension is not match with present screen"
                        onClick={() => controller.fixSlideDimension()}>
                        Fix Slide Dimension</button>
                }
            </div>
        </div>
    );
}
