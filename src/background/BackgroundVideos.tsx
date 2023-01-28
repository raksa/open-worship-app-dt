import './BackgroundVideos.scss';

import { createRef, useCallback } from 'react';
import { showAppContextMenu } from '../others/AppContextMenu';
import FileListHandler from '../others/FileListHandler';
import { genCommonMenu } from '../others/FileItemHandler';
import DirSource from '../helper/DirSource';
import PresentBGManager from '../_present/PresentBGManager';
import { RenderPresentIds } from './Background';
import { usePBGMEvents } from '../_present/presentEventHelpers';
import FileSource from '../helper/FileSource';
import { DragTypeEnum, handleDragStart } from '../helper/DragInf';

export default function BackgroundVideos() {
    const renderCallback = useCallback((fileSources: FileSource[]) => {
        return (
            <div className='d-flex justify-content-start flex-wrap'>
                {fileSources.map(genBody)}
            </div>
        );
    }, []);
    const dirSource = DirSource.getInstance('video-list-selected-dir');
    usePBGMEvents(['update']);
    return (
        <FileListHandler id='background-video' mimetype='video'
            dirSource={dirSource}
            bodyHandler={renderCallback} />
    );
}

function genBody(fileSource: FileSource) {
    const vRef = createRef<HTMLVideoElement>();
    const selectedBGSrcList = PresentBGManager.getSelectBGSrcList(
        fileSource.src, 'video');
    const selectedCN = selectedBGSrcList.length ? 'highlight-selected' : '';
    return (
        <div key={fileSource.name}
            className={`video-thumbnail card ${selectedCN}`}
            title={fileSource.filePath + '\n Show in presents:'
                + selectedBGSrcList.map(([key]) => key).join(',')}
            draggable
            onDragStart={(event) => {
                handleDragStart(event, fileSource, DragTypeEnum.BG_VIDEO);
            }}
            onContextMenu={(event) => {
                showAppContextMenu(event as any, genCommonMenu(fileSource));
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
            onClick={(event) => {
                PresentBGManager.bgSrcSelect(fileSource.src, event, 'video');
            }}>
            <div className='card-body'>
                <RenderPresentIds
                    ids={selectedBGSrcList.map(([key]) => +key)} />
                <video ref={vRef}
                    loop
                    muted
                    src={fileSource.src} />
            </div>
            <div className='card-footer'>
                <p className='ellipsis-left card-text'>
                    {fileSource.fileName}
                </p>
            </div>
        </div>
    );
}