import { BoxEditor } from './box/BoxEditor';
import {
    KeyEnum,
    useKeyboardRegistering,
} from '../../event/KeyboardEventListener';
import {
    showCanvasContextMenu,
    useCCRefresh,
    useCCScale,
} from './canvasHelpers';
import { toastEventListener } from '../../event/ToastEventListener';
import { isSupportedMimetype } from '../../helper/fileHelper';
import FileSource from '../../helper/FileSource';
import { canvasController } from './CanvasController';

export default function SlideItemEditorCanvas() {
    const scale = useCCScale();
    useCCRefresh(['update']);
    useKeyboardRegistering({ key: KeyEnum.Escape }, () => {
        canvasController.stopAllMods();
    });
    const isSupportType = (fileType: string) => {
        return isSupportedMimetype(fileType, 'image') ||
        isSupportedMimetype(fileType, 'video');
    };
    const canvas = canvasController.canvas;
    if(canvas == null) {
        return null;
    }
    const canvasItems = canvas.canvasItems || [];
    return (
        <div className='editor-container w-100 h-100'>
            <div className='overflow-hidden' style={{
                width: `${canvas.width * scale + 20}px`,
                height: `${canvas.height * scale + 20}px`,
            }}>
                <div className='w-100 h-100' style={{
                    transform: `scale(${scale.toFixed(1)}) translate(50%, 50%)`,
                }}>
                    <div className='editor blank-bg border-white-round' style={{
                        width: `${canvas.width}px`,
                        height: `${canvas.height}px`,
                        transform: 'translate(-50%, -50%)',
                    }}
                        onDragOver={(event) => {
                            event.preventDefault();
                            if (Array.from(event.dataTransfer.items).every((item) => {
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
                            for (const file of Array.from(event.dataTransfer.files)) {
                                if (!isSupportType(file.type)) {
                                    toastEventListener.showSimpleToast({
                                        title: 'Insert Image or Video',
                                        message: 'Unsupported file type!',
                                    });
                                } else {
                                    const fileSource = FileSource.genFileSource(file.path, file.name);
                                    canvasController.addNewMedia(fileSource, event);
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
