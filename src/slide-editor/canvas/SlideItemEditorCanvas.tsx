import { BoxEditor } from './box/BoxEditor';
import {
    useKeyboardRegistering,
} from '../../event/KeyboardEventListener';
import {
    showCanvasContextMenu,
    useCCEvents,
    useCCScale,
} from './canvasHelpers';
import ToastEventListener from '../../event/ToastEventListener';
import { isSupportedMimetype } from '../../server/fileHelper';
import FileSource from '../../helper/FileSource';
import CanvasController from './CanvasController';

export default function SlideItemEditorCanvas() {
    const canvasController = CanvasController.getInstance();
    const scale = useCCScale();
    useCCEvents(['update']);
    useKeyboardRegistering({ key: 'Escape' }, () => {
        canvasController.stopAllMods();
    });
    const isSupportType = (fileType: string) => {
        return isSupportedMimetype(fileType, 'image') ||
            isSupportedMimetype(fileType, 'video');
    };
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
                        }} onDragLeave={(event) => {
                            event.preventDefault();
                            event.currentTarget.style.opacity = '1';
                        }} onDrop={async (event) => {
                            event.preventDefault();
                            event.currentTarget.style.opacity = '1';
                            const files = event.dataTransfer.files;
                            for (const file of Array.from(files)) {
                                if (!isSupportType(file.type)) {
                                    ToastEventListener.showSimpleToast({
                                        title: 'Insert Image or Video',
                                        message: 'Unsupported file type!',
                                    });
                                } else {
                                    const fileSource = FileSource.genFileSource((file as any).path);
                                    canvasController.addNewMediaItem(fileSource, event);
                                }
                            }
                        }}
                        onContextMenu={(e) => showCanvasContextMenu(e)}
                        onClick={() => {
                            canvasController.stopAllMods();
                        }} >
                        {canvasItems.map((canvasItem, i) => {
                            return <BoxEditor scale={scale} key={`${i}`}
                                canvasItem={canvasItem} />;
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
