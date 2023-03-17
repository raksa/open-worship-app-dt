import { useCallback } from 'react';
import { showAppContextMenu } from '../others/AppContextMenu';
import FileListHandler from '../others/FileListHandler';
import { genCommonMenu } from '../others/FileItemHandler';
import DirSource from '../helper/DirSource';
import PresentBGManager, {
    BackgroundSrcType,
} from '../_present/PresentBGManager';
import { usePBGMEvents } from '../_present/presentEventHelpers';
import FileSource from '../helper/FileSource';
import { DragTypeEnum, handleDragStart } from '../helper/DragInf';
import ItemColorNote from '../others/ItemColorNote';

export type RenderChildType = (fileSource: FileSource,
    selectedBGSrcList: [string, BackgroundSrcType][]) => JSX.Element;

export default function BackgroundMedia({ rendChild, bgType }: {
    rendChild: RenderChildType,
    bgType: 'video' | 'image',
}) {
    const renderCallback = useCallback((fileSources: FileSource[]) => {
        const genBodyWithChild = genBody.bind(null, rendChild, bgType);
        return (
            <div className='d-flex justify-content-start flex-wrap'>
                {fileSources.map(genBodyWithChild)}
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

function genBody(rendChild: RenderChildType, bgType: 'video' | 'image',
    fileSource: FileSource) {
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
                handleDragStart(event, fileSource, DragTypeEnum.BG_VIDEO);
            }}
            onContextMenu={(event) => {
                showAppContextMenu(event as any, genCommonMenu(fileSource));
            }}
            onClick={(event) => {
                PresentBGManager.bgSrcSelect(fileSource.src, event, bgType);
            }}>
            {rendChild(fileSource, selectedBGSrcList)}
            <div style={{
                position: 'absolute',
                right: 0,
            }}>
                <ItemColorNote item={fileSource} />
            </div>
            <div className='card-footer'>
                <p className='ellipsis-left card-text'>
                    {fileSource.fileName}
                </p>
            </div>
        </div>
    );
}
