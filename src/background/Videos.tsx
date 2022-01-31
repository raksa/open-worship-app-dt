import './Videos.scss';

import { createRef, useEffect, useState } from 'react';
import { copyToClipboard, isMac, openExplorer } from '../helper/electronHelper';
import { presentEventListener } from '../event/PresentEventListener';
import { copyFileToPath, FileResult, isSupportedMimetype, listFiles, useStateSettingString } from '../helper/helpers';
import PathSelector from '../helper/PathSelector';
import { renderBGVideo } from '../slide-presenting/slidePresentHelpers';
import { showAppContextMenu } from '../helper/AppContextMenu';
import { toastEventListener } from '../event/ToastEventListener';

export default function Videos() {
    const [dir, setDir] = useStateSettingString('video-selected-dir', '');
    const [list, setList] = useState<FileResult[] | null>(null);
    useEffect(() => {
        if (list === null) {
            const videos = listFiles(dir, 'video');
            setList(videos === null ? [] : videos);
        }
    }, [list, dir]);
    const applyDir = (dir: string) => {
        setDir(dir);
        setList(null);
    }
    return (
        <div className="background-video" draggable={dir !== null}
            onDragOver={(event) => {
                event.preventDefault();
                event.currentTarget.style.opacity = '0.5';
            }} onDragLeave={(event) => {
                event.preventDefault();
                event.currentTarget.style.opacity = '1';
            }} onDrop={(event) => {
                event.preventDefault();
                event.currentTarget.style.opacity = '1';
                Array.from(event.dataTransfer.files).forEach((file) => {
                    console.log(file);
                    
                    if (!isSupportedMimetype(file.type, 'video')) {
                        toastEventListener.showSimpleToast({
                            title: 'copy video file',
                            message: 'Unsupported video file!'
                        });
                    } else {
                        if (copyFileToPath(file.path, file.name, dir)) {
                            setList(null);
                            toastEventListener.showSimpleToast({
                                title: 'copy video file',
                                message: 'File has been copied'
                            });
                        } else {
                            toastEventListener.showSimpleToast({
                                title: 'copy video file',
                                message: 'Fail to copy file!'
                            });
                        }
                    }
                });
            }}>
            <PathSelector
                dirPath={dir}
                onRefresh={() => setList(null)}
                onChangeDirPath={applyDir}
                onSelectDirPath={applyDir} />
            <div className="d-flex justify-content-start flex-wrap">
                {(list || []).map((d, i) => {
                    const vRef = createRef<HTMLVideoElement>();
                    return (
                        <div key={`${i}`} className="video-thumbnail card" title={d.filePath}
                            onContextMenu={(e) => {
                                showAppContextMenu(e, [
                                    {
                                        title: 'Copy Path to Clipboard ', onClick: () => {
                                            copyToClipboard(d.filePath);
                                        }
                                    },
                                    {
                                        title: `Reveal in ${isMac() ? 'Finder' : 'File Explorer'}`,
                                        onClick: () => {
                                            openExplorer(d.filePath);
                                        }
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
                                renderBGVideo(d.src);
                                presentEventListener.renderBG();
                            }}>
                            <div className="card-body">
                                <video ref={vRef} loop
                                    muted src={d.src}></video>
                            </div>
                            <div className="card-footer">
                                <p className="card-text">{'...' +
                                    d.fileName.substring(d.fileName.length - 15)}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div >
    );
}
