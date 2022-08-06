import './BackgroundVideos.scss';

import { createRef, useState } from 'react';
import { showAppContextMenu } from '../others/AppContextMenu';
import FileListHandler from '../others/FileListHandler';
import { genCommonMenu } from '../others/FileItemHandler';
import DirSource from '../helper/DirSource';
import PresentManager from '../_present/PresentManager';
import { useBGSrcList } from '../_present/presentHelpers';

export default function BackgroundVideos() {
    const [dirSource, setDirSource] = useState(DirSource.genDirSource('video-list-selected-dir'));
    const bgSrcList = useBGSrcList(['update']);
    const keyBGSrcList = Object.entries(bgSrcList).filter(([_, bgSrc]) => {
        return bgSrc.type === 'video';
    });
    return (
        <FileListHandler id='background-video' mimetype='video'
            dirSource={dirSource}
            setDirSource={setDirSource}
            header={undefined}
            body={<div className='d-flex justify-content-start flex-wrap'>
                {(dirSource.fileSources || []).map((fileSource, i) => {
                    const vRef = createRef<HTMLVideoElement>();
                    const selectedBGSrcList = keyBGSrcList.filter(([_, bgSrc]) => {
                        return bgSrc.src === fileSource.src;
                    });
                    const selectedCN = selectedBGSrcList.length ? 'highlight-selected' : '';
                    return (
                        <div key={`${i}`}
                            className={`video-thumbnail card ${selectedCN}`}
                            title={fileSource.filePath + '\n Show in presents:'
                                + selectedBGSrcList.map(([key]) => key).join(',')}
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
                                if (selectedBGSrcList.length) {
                                    selectedBGSrcList.forEach(([key]) => {
                                        PresentManager.getInstanceByKey(key)
                                            .presentBGManager.bgSrc = null;
                                    });
                                } else {
                                    PresentManager.getSelectedInstances()
                                        .forEach((presentManager) => {
                                            presentManager.presentBGManager.bgSrc = {
                                                type: 'video',
                                                src: fileSource.src,
                                            };

                                        });
                                }
                            }}>
                            <div className='card-body'>
                                <div style={{
                                    position: 'absolute',
                                    textShadow: '1px 1px 5px #000',
                                }}>
                                    {selectedBGSrcList.map(([key]) => key).join(',')}
                                </div>
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
