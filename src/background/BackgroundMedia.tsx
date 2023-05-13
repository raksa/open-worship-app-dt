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
import { DragTypeEnum } from '../helper/DragInf';
import ItemColorNote from '../others/ItemColorNote';
import { handleDragStart } from '../helper/dragHelpers';

export type RenderChildType = (fileSource: FileSource,
    selectedBGSrcList: [string, BackgroundSrcType][]) => JSX.Element;

const bgTypeMapper: any = {
    [DragTypeEnum.BG_IMAGE]: 'image',
    [DragTypeEnum.BG_VIDEO]: 'video',
};

export default function BackgroundMedia({ rendChild, dragType }: {
    rendChild: RenderChildType,
    dragType: DragTypeEnum,
}) {
    const bgType = bgTypeMapper[dragType];
    const renderCallback = useCallback((fileSources: FileSource[]) => {
        const genBodyWithChild = genBody.bind(null, rendChild, dragType);
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

function genBody(rendChild: RenderChildType, dragType: DragTypeEnum,
    fileSource: FileSource) {
    const bgType = bgTypeMapper[dragType];
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
                handleDragStart(event, fileSource, dragType);
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
