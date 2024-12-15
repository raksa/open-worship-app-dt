import { BoxEditors } from './box/BoxEditors';
import {
    useKeyboardRegistering,
} from '../../event/KeyboardEventListener';
import {
    showCanvasContextMenu,
} from './canvasCMHelpers';
import { isSupportedMimetype } from '../../server/fileHelpers';
import CanvasController, {
    useCanvasControllerContext,
} from './CanvasController';
import {
    useSlideItemCanvasScale,
} from './canvasEventHelpers';
import { showSimpleToast } from '../../toast/toastHelpers';
import Canvas from './Canvas';
import CanvasItem from './CanvasItem';

export default function SlideItemEditorCanvas() {
    const canvasController = useCanvasControllerContext();
    const scale = useSlideItemCanvasScale(canvasController);
    useKeyboardRegistering([{ key: 'Escape' }], () => {
        canvasController.stopAllMods();
    });
    const canvas = canvasController.canvas;
    const canvasItems = canvas.canvasItems;
    return (
        <div className='editor-container w-100 h-100'>
            <div className='overflow-hidden' style={{
                width: `${canvas.width * scale + 20}px`,
                height: `${canvas.height * scale + 20}px`,
            }}>
                <div className='w-100 h-100' style={{
                    transform: `scale(${scale.toFixed(1)}) translate(50%, 50%)`,
                }}>
                    {genBody({
                        canvas,
                        canvasItems,
                        canvasController,
                        scale,
                    })}
                </div>
            </div>
        </div>
    );
}

function genBody({
    canvas, canvasItems, canvasController, scale,
}: {
    canvas: Canvas,
    canvasItems: CanvasItem<any>[],
    canvasController: CanvasController,
    scale: number,
}) {
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
                        scale={scale}
                        canvasItem={canvasItem}
                    />
                );
            })}
        </div>
    );
}
