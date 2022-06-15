import './Images.scss';

import { useEffect, useState } from 'react';
import { copyToClipboard, isMac, openExplorer } from '../helper/appHelper';
import { presentEventListener } from '../event/PresentEventListener';
import fileHelpers, {
    FileSourceType,
    isSupportedMimetype,
} from '../helper/fileHelper';
import { useStateSettingString } from '../helper/settingHelper';
import PathSelector from '../others/PathSelector';
import { renderBGImage } from '../helper/presentingHelpers';
import { showAppContextMenu } from '../others/AppContextMenu';
import { toastEventListener } from '../event/ToastEventListener';

export default function Images() {
    const [dirPath, setDirPath] = useStateSettingString('image-selected-dir', '');
    const [list, setList] = useState<FileSourceType[] | null>(null);
    useEffect(() => {
        if (list === null) {
            fileHelpers.listFiles(dirPath, 'image').then((images) => {
                setList(images === null ? [] : images);
            }).catch((error: any) => {
                toastEventListener.showSimpleToast({
                    title: 'Listing images',
                    message: error.message,
                });
            });
        }
    }, [list, dirPath]);
    const applyDir = (newDirPath: string) => {
        setDirPath(newDirPath);
        setList(null);
    };
    return (
        <div className="background-image" draggable={dirPath !== null}
            onDragOver={(event) => {
                event.preventDefault();
                event.currentTarget.style.opacity = '0.5';
            }} onDragLeave={(event) => {
                event.preventDefault();
                event.currentTarget.style.opacity = '1';
            }} onDrop={async (event) => {
                event.preventDefault();
                event.currentTarget.style.opacity = '1';
                for (const file of Array.from(event.dataTransfer.files)) {
                    if (!isSupportedMimetype(file.type, 'image')) {
                        toastEventListener.showSimpleToast({
                            title: 'Copying Image File',
                            message: 'Unsupported image file!',
                        });
                    } else {
                        try {
                            await fileHelpers.copyFileToPath(file.path, file.name, dirPath);
                            setList(null);
                            toastEventListener.showSimpleToast({
                                title: 'Copying Image File',
                                message: 'File has been copied',
                            });
                        } catch (error: any) {
                            toastEventListener.showSimpleToast({
                                title: 'Copying Image File',
                                message: error.message,
                            });
                        }
                    }
                }
            }}>
            <PathSelector
                prefix='bg-image'
                dirPath={dirPath}
                onRefresh={() => setList(null)}
                onChangeDirPath={applyDir}
                onSelectDirPath={applyDir} />
            <div className="d-flex justify-content-start flex-wrap">
                {(list || []).map((file, i) => {
                    return (
                        <div key={`${i}`} className="image-thumbnail card" title={file.filePath}
                            onContextMenu={(e) => {
                                showAppContextMenu(e, [
                                    {
                                        title: 'Copy Path to Clipboard ', onClick: () => {
                                            copyToClipboard(file.filePath);
                                        },
                                    },
                                    {
                                        title: `Reveal in ${isMac() ? 'Finder' : 'File Explorer'}`,
                                        onClick: () => {
                                            openExplorer(file.filePath);
                                        },
                                    },
                                ]);
                            }}
                            onClick={() => {
                                renderBGImage(file.src);
                                presentEventListener.renderBG();
                            }}>
                            <div className="card-body">
                                <img src={file.src} className="card-img-top" alt="..." />
                            </div>
                            <div className="card-footer">
                                <p className="ellipsis-left card-text">{file.fileName}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
