import './Videos.scss';

import { createRef, useEffect, useState } from 'react';
import { copyToClipboard, isMac, openExplorer } from '../helper/appHelper';
import { presentEventListener } from '../event/PresentEventListener';
import { useStateSettingString } from '../helper/settingHelper';
import fileHelpers, {
    FileSourceType,
    isSupportedMimetype,
} from '../helper/fileHelper';
import PathSelector from '../others/PathSelector';
import { renderBGVideo } from '../helper/presentingHelpers';
import { showAppContextMenu } from '../others/AppContextMenu';
import { toastEventListener } from '../event/ToastEventListener';

export default function Videos() {
    const [dir, setDir] = useStateSettingString('video-selected-dir', '');
    const [list, setList] = useState<FileSourceType[] | null>(null);
    useEffect(() => {
        if (list === null) {
            fileHelpers.listFiles(dir, 'video').then((videos) => {
                setList(videos === null ? [] : videos);
            }).catch((error: any) => {
                toastEventListener.showSimpleToast({
                    title: 'Listing Videos',
                    message: error.message,
                });
            });
        }
    }, [list, dir]);
    const applyDir = (newDir: string) => {
        setDir(newDir);
        setList(null);
    };
    return (
        <div className="background-video" draggable={dir !== null}
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
                    if (!isSupportedMimetype(file.type, 'video')) {
                        toastEventListener.showSimpleToast({
                            title: 'Copying Video File',
                            message: 'Unsupported video file!',
                        });
                    } else {
                        try {
                            await fileHelpers.copyFileToPath(file.path, file.name, dir);
                            setList(null);
                            toastEventListener.showSimpleToast({
                                title: 'Copying Video File',
                                message: 'File has been copied',
                            });
                        } catch (error: any) {
                            toastEventListener.showSimpleToast({
                                title: 'Copying Video File',
                                message: error.message,
                            });
                        }
                    }
                }
            }}>
            <PathSelector
                prefix='bg-video'
                dirPath={dir}
                onRefresh={() => setList(null)}
                onChangeDirPath={applyDir}
                onSelectDirPath={applyDir} />
            <div className="d-flex justify-content-start flex-wrap">
                {(list || []).map((file, i) => {
                    const vRef = createRef<HTMLVideoElement>();
                    return (
                        <div key={`${i}`} className="video-thumbnail card"
                            title={file.filePath}
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
                            onMouseEnter={() => {
                                vRef.current?.play();
                            }}
                            onMouseLeave={() => {
                                if (vRef.current) {
                                    vRef.current.pause();
                                    vRef.current.currentTime = 0;
                                }
                            }}
                            onClick={() => {
                                renderBGVideo(file.src);
                                presentEventListener.renderBG();
                            }}>
                            <div className="card-body">
                                <video ref={vRef} loop
                                    muted src={file.src}></video>
                            </div>
                            <div className="card-footer">
                                <p className="ellipsis-left card-text">
                                    {file.fileName}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div >
    );
}
