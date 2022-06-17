import { useState, useEffect } from 'react';
import {
    keyboardEventListener,
    LinuxControlEnum,
    MacControlEnum,
    useKeyboardRegistering,
    WindowsControlEnum,
} from '../event/KeyboardEventListener';
import { useDisplay } from '../event/PresentEventListener';
import SlideItemsController, { useRefresh } from './SlideItemsController';

export default function SlideItemThumbListMenu({ controller }: {
    controller: SlideItemsController,
}) {
    useRefresh(controller);
    const { presentDisplay } = useDisplay();
    const eventMapper = {
        wControlKey: [WindowsControlEnum.Ctrl],
        mControlKey: [MacControlEnum.Ctrl],
        lControlKey: [LinuxControlEnum.Ctrl],
        key: 's',
    };
    useKeyboardRegistering(eventMapper, () => controller.slide.save());
    const foundWrongDimension = controller.checkIsWrongDimension(presentDisplay);
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
                <RenderIsModifying controller={controller} eventMapper={eventMapper} />
                {foundWrongDimension !== null &&
                    <button type="button" className="btn btn-sm btn-warning"
                        title={toWrongDimensionString(foundWrongDimension)}
                        onClick={() => controller.fixSlideDimension(presentDisplay)}>
                        Fix Slide Dimension</button>
                }
            </div>
        </div>
    );
}
function RenderIsModifying({ controller, eventMapper }: {
    controller: SlideItemsController, eventMapper: any,
}) {
    const [isModifying, setIsModifying] = useState(false);
    useEffect(() => {
        controller.isModifying().then(setIsModifying);
    }, [controller]);
    if (!isModifying) {
        return null;
    }
    return (
        <button type="button" className="btn btn-sm btn-success tool-tip tool-tip-fade"
            data-tool-tip={keyboardEventListener.toShortcutKey(eventMapper)}
            title="save slide thumbs"
            onClick={() => controller.slide.save()}>save</button>
    );
}
function toWrongDimensionString({ slide, display }: {
    slide: { width: number, height: number }, display: { width: number, height: number },
}) {
    return `⚠️ slide:${slide.width}x${slide.height} display:${display.width}x${display.height}`;
}