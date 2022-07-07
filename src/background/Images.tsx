import './Images.scss';

import { useState } from 'react';
import { presentEventListener } from '../event/PresentEventListener';
import { renderBGImage } from '../helper/presentingHelpers';
import { showAppContextMenu } from '../others/AppContextMenu';
import FileListHandler from '../others/FileListHandler';
import { genCommonMenu } from '../others/FileItemHandler';
import DirSource from '../helper/DirSource';

export default function Images() {
    const [dirSource, setDirSource] = useState(DirSource.genDirSource('image-list-selected-dir'));
    return (
        <FileListHandler id={'background-image'} mimetype={'image'}
            dirSource={dirSource}
            setDirSource={setDirSource}
            body={<div className="d-flex justify-content-start flex-wrap">
                {(dirSource.fileSources || []).map((fileSource, i) => {
                    return (
                        <div key={`${i}`} className="image-thumbnail card" title={fileSource.filePath}
                            onContextMenu={(e) => {
                                showAppContextMenu(e, genCommonMenu(fileSource),);
                            }}
                            onClick={() => {
                                renderBGImage(fileSource.src);
                                presentEventListener.renderBG();
                            }}>
                            <div className="card-body">
                                <img src={fileSource.src} className="card-img-top" alt="..." />
                            </div>
                            <div className="card-footer">
                                <p className="ellipsis-left card-text">{fileSource.fileName}</p>
                            </div>
                        </div>
                    );
                })}
            </div>} />
    );
}
