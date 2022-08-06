import './BackgroundImages.scss';

import { useState } from 'react';
import { showAppContextMenu } from '../others/AppContextMenu';
import FileListHandler from '../others/FileListHandler';
import { genCommonMenu } from '../others/FileItemHandler';
import DirSource from '../helper/DirSource';
import { useBGSrcList } from '../_present/presentHelpers';
import PresentManager from '../_present/PresentManager';

export default function BackgroundImages() {
    const [dirSource, setDirSource] = useState(DirSource.genDirSource('image-list-selected-dir'));
    const bgSrcList = useBGSrcList(['update']);
    const keyBGSrcList = Object.entries(bgSrcList).filter(([_, bgSrc]) => {
        return bgSrc.type === 'image';
    });
    return (
        <FileListHandler id='background-image' mimetype='image'
            dirSource={dirSource}
            setDirSource={setDirSource}
            body={<div className='d-flex justify-content-start flex-wrap'>
                {(dirSource.fileSources || []).map((fileSource, i) => {
                    const selectedBGSrcList = keyBGSrcList.filter(([_, bgSrc]) => {
                        return bgSrc.src === fileSource.src;
                    });
                    const selectedCN = selectedBGSrcList.length ? 'highlight-selected' : '';
                    return (
                        <div key={`${i}`}
                            className={`image-thumbnail card ${selectedCN}`}
                            title={fileSource.filePath + '\n Show in presents:'
                                + selectedBGSrcList.map(([key]) => key).join(',')}
                            onContextMenu={(e) => {
                                showAppContextMenu(e, genCommonMenu(fileSource),);
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
                                                type: 'image',
                                                src: fileSource.src,
                                            };

                                        });
                                }
                            }}>
                            <div className='card-body'>
                                <img src={fileSource.src}
                                    className='card-img-top' alt='...' />
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
