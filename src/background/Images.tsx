import './Images.scss';

import { useState } from 'react';
import {
    copyToClipboard, isMac, openExplorer,
} from '../helper/appHelper';
import { presentEventListener } from '../event/PresentEventListener';
import {
    FileSource,
} from '../helper/fileHelper';
import { useStateSettingString } from '../helper/settingHelper';
import { renderBGImage } from '../helper/presentingHelpers';
import { showAppContextMenu } from '../others/AppContextMenu';
import FileListHandler from '../others/FileListHandler';

const id = 'background-image';
export default function Images() {
    const [list, setList] = useState<FileSource[] | null>(null);
    const [dir, setDir] = useStateSettingString(`${id}-selected-dir`, '');
    return (
        <FileListHandler id={id} mimetype={'image'}
            list={list} setList={setList}
            dir={dir} setDir={setDir}
            body={<div className="d-flex justify-content-start flex-wrap">
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
            </div>} />
    );
}
