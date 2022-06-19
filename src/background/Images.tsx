import './Images.scss';

import { useState } from 'react';
import { presentEventListener } from '../event/PresentEventListener';
import { useStateSettingString } from '../helper/settingHelper';
import { renderBGImage } from '../helper/presentingHelpers';
import { showAppContextMenu } from '../others/AppContextMenu';
import FileListHandler, { FileListType } from '../others/FileListHandler';
import { genCommonMenu } from '../others/FileItemHandler';

const id = 'background-image';
export default function Images() {
    const [list, setList] = useState<FileListType>(null);
    const [dir, setDir] = useStateSettingString<string>(`${id}-selected-dir`, '');
    return (
        <FileListHandler id={id} mimetype={'image'}
            list={list} setList={setList}
            dir={dir} setDir={setDir}
            body={<div className="d-flex justify-content-start flex-wrap">
                {(list || []).map((fileSource, i) => {
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
