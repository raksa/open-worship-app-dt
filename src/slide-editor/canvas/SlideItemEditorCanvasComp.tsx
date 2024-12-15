import { BoxEditors } from './box/BoxEditors';
import {
    useKeyboardRegistering,
} from '../../event/KeyboardEventListener';
import {
    showCanvasContextMenu,
} from './canvasCMHelpers';
import { isSupportedMimetype } from '../../server/fileHelpers';
import { useCanvasControllerContext } from './CanvasController';
import {
    useSlideItemCanvasScale,
} from './canvasEventHelpers';
import { showSimpleToast } from '../../toast/toastHelpers';
import { useOptimistic } from 'react';

export default function SlideItemEditorCanvasComp() {
    const canvasController = useCanvasControllerContext();
    const scale = useSlideItemCanvasScale();
    useKeyboardRegistering([{ key: 'Escape' }], () => {
        canvasController.stopAllMods();
    });
    return (
        <div className='editor-container w-100 h-100'>
            <div className='overflow-hidden' style={{
                width: `${canvasController.canvas.width * scale + 20}px`,
                height: `${canvasController.canvas.height * scale + 20}px`,
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
    const [canvasItems] = useOptimistic(canvas.canvasItems);
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
        (event.target as HTMLDivElement).focus();
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
            {canvasItems.map((canvasItem) => {
                return (
                    <BoxEditors key={canvasItem.id}
                        canvasItem={canvasItem}
                    />
                );
            })}
        </div>
    );
}
