import './Videos.scss';

import { createRef, useState } from 'react';
import {
    copyToClipboard, isMac, openExplorer,
} from '../helper/appHelper';
import { presentEventListener } from '../event/PresentEventListener';
import { useStateSettingString } from '../helper/settingHelper';
import { FileSource } from '../helper/fileHelper';
import { renderBGVideo } from '../helper/presentingHelpers';
import { showAppContextMenu } from '../others/AppContextMenu';
import FileListHandler from '../others/FileListHandler';

const id = 'background-video';
export default function Videos() {
    const [list, setList] = useState<FileSource[] | null>(null);
    const [dir, setDir] = useStateSettingString(`${id}-selected-dir`, '');
    return (
        <FileListHandler id={id} mimetype={'video'}
            list={list} setList={setList}
            dir={dir} setDir={setDir}
            header={undefined}
            body={<div className="d-flex justify-content-start flex-wrap">
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
            </div>} />
    );
}
