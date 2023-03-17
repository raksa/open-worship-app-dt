import { BoxEditor } from './box/BoxEditor';
import {
    useKeyboardRegistering,
} from '../../event/KeyboardEventListener';
import {
    showCanvasContextMenu,
} from './canvasCMHelpers';
import { isSupportedMimetype } from '../../server/fileHelper';
import FileSource from '../../helper/FileSource';
import CanvasController from './CanvasController';
import { useCCScale, useCCEvents } from './canvasEventHelpers';
import { showSimpleToast } from '../../toast/toastHelpers';
import Canvas from './Canvas';
import CanvasItem from './CanvasItem';

export default function SlideItemEditorCanvas() {
    const canvasController = CanvasController.getInstance();
    const scale = useCCScale();
    useCCEvents(['update']);
    useKeyboardRegistering({ key: 'Escape' }, () => {
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
        return isSupportedMimetype(fileType, 'image') ||
            isSupportedMimetype(fileType, 'video');
    };
    const onDropHandler = async (event: any) => {
        const dragEvent = event as DragEvent;
        dragEvent.preventDefault();
        const style = (dragEvent.currentTarget as any)?.style || {};
        style.opacity = '1';
        const files = dragEvent.dataTransfer?.files || [];
        for (const file of Array.from(files)) {
            if (!isSupportType(file.type)) {
                showSimpleToast('Insert Image or Video',
                    'Unsupported file type!');
            } else {
                const fileSource = FileSource.getInstance((file as any).path);
                canvasController.addNewMediaItem(fileSource, event);
            }
        }
    };
    return (
        <div className='editor blank-bg border-white-round'
            style={{
                width: `${canvas.width}px`,
                height: `${canvas.height}px`,
                transform: 'translate(-50%, -50%)',
            }}
            onDragOver={(event) => {
                event.preventDefault();
                const items = event.dataTransfer.items;
                if (Array.from(items).every((item) => {
                    return isSupportType(item.type);
                })) {
                    event.currentTarget.style.opacity = '0.5';
                }
            }}
            onDragLeave={(event) => {
                event.preventDefault();
                event.currentTarget.style.opacity = '1';
            }}
            onDrop={onDropHandler}
            onContextMenu={(event) => {
                showCanvasContextMenu(event);
            }}
            onClick={() => {
                canvasController.stopAllMods();
            }} >
            {canvasItems.map((canvasItem) => {
                return <BoxEditor key={canvasItem.id}
                    scale={scale}
                    canvasItem={canvasItem} />;
            })}
        </div>
    );
}