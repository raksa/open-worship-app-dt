import { BoxEditorComp } from './box/BoxEditorComp';
import {
    useKeyboardRegistering,
} from '../../event/KeyboardEventListener';
import {
    showCanvasContextMenu,
} from './canvasContextMenuHelpers';
import { isSupportedMimetype } from '../../server/fileHelpers';
import { useCanvasControllerContext } from './CanvasController';
import {
    useCanvasControllerEvents,
    useSlideItemCanvasScale,
} from './canvasEventHelpers';
import { showSimpleToast } from '../../toast/toastHelpers';
import CanvasItem, { CanvasItemContext } from './CanvasItem';
import { useOptimistic } from 'react';
import { useProgressBarComp } from '../../progress-bar/ProgressBarComp';

export default function SlideItemEditorCanvasComp() {
    const canvasController = useCanvasControllerContext();
    const { canvas } = canvasController;
    const scale = useSlideItemCanvasScale();
    useKeyboardRegistering([{ key: 'Escape' }], () => {
        canvasController.stopAllMods();
    });
    return (
        <div className='editor-container w-100 h-100'>
            <div className='overflow-hidden' style={{
                width: `${canvas.width * scale + 20}px`,
                height: `${canvas.height * scale + 20}px`,
            }}>
                <div className='w-100 h-100' style={{
                    transform: `scale(${scale.toFixed(1)}) translate(50%, 50%)`,
                }}>
                    <BodyRendererComp />
                </div>
            </div>
        </div>
    );
}

function BodyRendererComp() {
    const canvasController = useCanvasControllerContext();
    const { canvas } = canvasController;
    const { startTransaction, progressBarChild } = useProgressBarComp();
    const [canvasItems, setCanvasItems] = (
        useOptimistic<CanvasItem<any>[]>([...canvas.canvasItems])
    );
    useCanvasControllerEvents(canvasController, ['update'], () => {
        startTransaction(() => {
            setCanvasItems([...canvas.canvasItems]);
        });
    });
    const isSupportType = (fileType: string) => {
        return (
            isSupportedMimetype(fileType, 'image') ||
            isSupportedMimetype(fileType, 'video')
        );
    };
    const handleDragging = (event: any) => {
        event.preventDefault();
        const items: DataTransferItemList = event.dataTransfer.items;
        if (Array.from(items).every((item) => {
            return isSupportType(item.type);
        })) {
            event.currentTarget.style.opacity = '0.5';
        }
    };
    const handleDropping = async (event: any) => {
        const dragEvent = event as DragEvent;
        dragEvent.preventDefault();
        const style = (dragEvent.currentTarget as any)?.style || {};
        style.opacity = '1';
        const files = dragEvent.dataTransfer?.files || [];
        Array.from(files).forEach((file) => {
            if (!isSupportType(file.type)) {
                showSimpleToast('Insert Image or Video',
                    'Unsupported file type!');
            } else {
                canvasController.genNewMediaItemFromFilePath(
                    (file as any).path, event,
                ).then((newCanvasItem) => {
                    if (newCanvasItem) {
                        canvasController.addNewItem(newCanvasItem);
                    }
                });
            }
        });
    };
    const handleContextMenuOpening = async (event: any) => {
        event.preventDefault();
        (event.target as HTMLDivElement).focus();
        canvasController.stopAllMods();
        showCanvasContextMenu(event, canvasController);
    };
    return (
        <div className='editor blank-bg border-white-round'
            style={{
                width: `${canvas.width}px`,
                height: `${canvas.height}px`,
                transform: 'translate(-50%, -50%)',
            }}
            onDragOver={handleDragging}
            onDragLeave={(event) => {
                event.preventDefault();
                event.currentTarget.style.opacity = '1';
            }}
            onDrop={handleDropping}
            onContextMenu={handleContextMenuOpening}
            onClick={() => {
                canvasController.stopAllMods();
            }} >
            {progressBarChild}
            {canvasItems.map((canvasItem) => {
                return (
                    <CanvasItemContext key={canvasItem.id} value={canvasItem}>
                        <BoxEditorComp />
                    </CanvasItemContext>
                );
            })}
        </div>
    );
}
