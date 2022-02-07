import './Images.scss';

import { useEffect, useState } from 'react';
import { copyToClipboard, isMac, openExplorer } from '../helper/appHelper';
import { presentEventListener } from '../event/PresentEventListener';
import {
    copyFileToPath,
    FileSourceType,
    isSupportedMimetype,
    listFiles,
} from '../helper/fileHelper';
import { useStateSettingString } from '../helper/settingHelper';
import PathSelector from '../others/PathSelector';
import { renderBGImage } from '../helper/presentingHelpers';
import { showAppContextMenu } from '../others/AppContextMenu';
import { toastEventListener } from '../event/ToastEventListener';

export default function Images() {
    const [dir, setDir] = useStateSettingString('image-selected-dir', '');
    const [list, setList] = useState<FileSourceType[] | null>(null);
    useEffect(() => {
        if (list === null) {
            const images = listFiles(dir, 'image');
            setList(images === null ? [] : images);
        }
    }, [list, dir]);
    const applyDir = (dir: string) => {
        setDir(dir);
        setList(null);
    };
    return (
        <div className="background-image" draggable={dir !== null}
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
                    if (!isSupportedMimetype(file.type, 'image')) {
                        toastEventListener.showSimpleToast({
                            title: 'copy image file',
                            message: 'Unsupported image file!',
                        });
                    } else {
                        if (copyFileToPath(file.path, file.name, dir)) {
                            setList(null);
                            toastEventListener.showSimpleToast({
                                title: 'copy image file',
                                message: 'File has been copied',
                            });
                        } else {
                            toastEventListener.showSimpleToast({
                                title: 'copy image file',
                                message: 'Fail to copy file!',
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
                    return (
                        <div key={`${i}`} className="image-thumbnail card" title={d.filePath}
                            onContextMenu={(e) => {
                                showAppContextMenu(e, [
                                    {
                                        title: 'Copy Path to Clipboard ', onClick: () => {
                                            copyToClipboard(d.filePath);
                                        },
                                    },
                                    {
                                        title: `Reveal in ${isMac() ? 'Finder' : 'File Explorer'}`,
                                        onClick: () => {
                                            openExplorer(d.filePath);
                                        },
                                    },
                                ]);
                            }}
                            onClick={() => {
                                renderBGImage(d.src);
                                presentEventListener.renderBG();
                            }}>
                            <div className="card-body">
                                <img src={d.src} className="card-img-top" alt="..." />
                            </div>
                            <div className="card-footer">
                                <p className="card-text">{'...' +
                                    d.fileName.substring(d.fileName.length - 15)}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
