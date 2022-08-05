import './Videos.scss';

import { createRef, useState } from 'react';
import { showAppContextMenu } from '../others/AppContextMenu';
import FileListHandler from '../others/FileListHandler';
import { genCommonMenu } from '../others/FileItemHandler';
import DirSource from '../helper/DirSource';
import PresentManager from '../_present/PresentManager';

export default function Videos() {
    const [dirSource, setDirSource] = useState(DirSource.genDirSource('video-list-selected-dir'));
    return (
        <FileListHandler id={'background-video'} mimetype={'video'}
            dirSource={dirSource}
            setDirSource={setDirSource}
            header={undefined}
            body={<div className='d-flex justify-content-start flex-wrap'>
                {(dirSource.fileSources || []).map((fileSource, i) => {
                    const vRef = createRef<HTMLVideoElement>();
                    return (
                        <div key={`${i}`} className='video-thumbnail card'
                            title={fileSource.filePath}
                            onContextMenu={(e) => {
                                showAppContextMenu(e, genCommonMenu(fileSource),);
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
                                PresentManager.getInstance(0).presentBGManager.bgSrc = {
                                    type: 'video',
                                    src: fileSource.src,
                                };
                            }}>
                            <div className='card-body'>
                                <video ref={vRef} loop
                                    muted src={fileSource.src}></video>
                            </div>
                            <div className='card-footer'>
                                <p className='ellipsis-left card-text'>
                                    {fileSource.fileName}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>} />
    );
}
