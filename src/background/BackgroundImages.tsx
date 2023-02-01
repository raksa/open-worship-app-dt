import './BackgroundImages.scss';

import { useCallback } from 'react';
import { showAppContextMenu } from '../others/AppContextMenu';
import FileListHandler from '../others/FileListHandler';
import { genCommonMenu } from '../others/FileItemHandler';
import DirSource from '../helper/DirSource';
import PresentBGManager from '../_present/PresentBGManager';
import { RenderPresentIds } from './Background';
import { usePBGMEvents } from '../_present/presentEventHelpers';
import FileSource from '../helper/FileSource';
import { DragTypeEnum, handleDragStart } from '../helper/DragInf';

const bgType = 'image';

export default function BackgroundImages() {
    const renderCallback = useCallback((fileSources: FileSource[]) => {
        return (
            <div className='d-flex justify-content-start flex-wrap'>
                {fileSources.map(genBody)}
            </div>
        );
    }, []);
    const dirSource = DirSource.getInstance(`${bgType}-list-selected-dir`);
    usePBGMEvents(['update']);
    return (
        <FileListHandler id={`background-${bgType}`}
            mimetype={bgType}
            dirSource={dirSource}
            bodyHandler={renderCallback} />
    );
}

function genBody(fileSource: FileSource) {
    const selectedBGSrcList = PresentBGManager.getSelectBGSrcList(
        fileSource.src, bgType);
    const selectedCN = selectedBGSrcList.length ? 'highlight-selected' : '';
    return (
        <div key={fileSource.name}
            className={`${bgType}-thumbnail card ${selectedCN}`}
            title={fileSource.filePath + '\n Show in presents:'
                + selectedBGSrcList.map(([key]) => key).join(',')}
            draggable
            onDragStart={(event) => {
                handleDragStart(event, fileSource, DragTypeEnum.BG_IMAGE);
            }}
            onContextMenu={(event) => {
                showAppContextMenu(event as any, genCommonMenu(fileSource));
            }}
            onClick={(event) => {
                PresentBGManager.bgSrcSelect(fileSource.src, event, bgType);
            }}>
            <div className='card-body'>
                <RenderPresentIds
                    ids={selectedBGSrcList.map(([key]) => +key)} />
                <img src={fileSource.src}
                    className='card-img-top' alt='...'
                    style={{
                        pointerEvents: 'none',
                    }} />
            </div>
            <div className='card-footer'>
                <p className='ellipsis-left card-text'>
                    {fileSource.fileName}
                </p>
            </div>
        </div>
    );
}