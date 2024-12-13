import { showAppContextMenu } from '../others/AppContextMenu';
import FileListHandler from '../others/FileListHandler';
import { genCommonMenu } from '../others/FileItemHandler';
import ScreenBGManager from '../_screen/ScreenBGManager';
import { usePBGMEvents } from '../_screen/screenEventHelpers';
import FileSource from '../helper/FileSource';
import { DragTypeEnum } from '../helper/DragInf';
import ItemColorNote from '../others/ItemColorNote';
import { handleDragStart } from '../bible-list/dragHelpers';
import { useGenDirSource } from '../helper/dirSourceHelpers';
import { BackgroundSrcType } from '../_screen/screenHelpers';
import { getMimetypeExtensions } from '../server/fileHelpers';

export type RenderChildType = (
    filePath: string,
    selectedBGSrcList: [string, BackgroundSrcType][],
) => React.JSX.Element;

const bgTypeMapper: any = {
    [DragTypeEnum.BG_IMAGE]: 'image',
    [DragTypeEnum.BG_VIDEO]: 'video',
    [DragTypeEnum.BG_SOUND]: 'sound',
};

export default function BackgroundMedia({
    rendChild, dragType, defaultFolderName, dirSourceSettingName,
    noDraggable = false, noClickable = false, isNameOnTop = false,
}: Readonly<{
    rendChild: RenderChildType,
    dragType: DragTypeEnum,
    defaultFolderName: string,
    dirSourceSettingName: string,
    noDraggable?: boolean,
    noClickable?: boolean,
    isNameOnTop?: boolean,
}>) {
    const bgType = bgTypeMapper[dragType];
    const dirSource = useGenDirSource(dirSourceSettingName);
    const handleBodyRendering = (filePaths: string[]) => {
        const genBodyWithChild = genBody.bind(
            null, rendChild, dragType, noDraggable, noClickable, isNameOnTop,
        );
        return (
            <div className='d-flex justify-content-start flex-wrap'>
                {filePaths.map(genBodyWithChild)}
            </div>
        );
    };
    usePBGMEvents(['update']);
    if (dirSource === null) {
        return null;
    }
    return (
        <FileListHandler id={`app-background-${bgType}`}
            mimetype={bgType}
            defaultFolderName={defaultFolderName}
            dirSource={dirSource}
            bodyHandler={handleBodyRendering}
            fileSelectionOption={bgType === 'color' ? undefined : {
                windowTitle: `Select ${bgType} files`,
                dirPath: dirSource.dirPath,
                extensions: getMimetypeExtensions(bgType),
            }}
        />
    );
}

function genBody(
    rendChild: RenderChildType, dragType: DragTypeEnum, noDraggable: boolean,
    noClickable: boolean, isNameOnTop: boolean, filePath: string,
) {
    const fileSource = FileSource.getInstance(filePath);
    const bgType = bgTypeMapper[dragType];
    const selectedBGSrcList = ScreenBGManager.getSelectBGSrcList(
        fileSource.src, bgType,
    );
    const selectedCN = selectedBGSrcList.length ? 'highlight-selected' : '';
    const screenKeys = selectedBGSrcList.map(([key]) => key);
    const title = (
        `${filePath}` + (selectedBGSrcList.length ?
            ` \nShow in presents:${screenKeys.join(',')}` : ''
        )
    );

    return (
        <div key={fileSource.name}
            className={`${bgType}-thumbnail card ${selectedCN}`}
            title={title}
            draggable={!noDraggable}
            onDragStart={(event) => {
                handleDragStart(event, fileSource, dragType);
            }}
            onContextMenu={(event) => {
                showAppContextMenu(event as any, genCommonMenu(filePath));
            }}
            onClick={noClickable ? () => { } : (event) => {
                ScreenBGManager.bgSrcSelect(fileSource.src, event, bgType);
            }}>
            {!isNameOnTop ? null : (
                <FileFullNameRenderer fileFullName={fileSource.fileFullName} />
            )}
            {rendChild(filePath, selectedBGSrcList)}
            <div style={{
                position: 'absolute',
                right: 0,
            }}>
                <ItemColorNote item={fileSource} />
            </div>
            {isNameOnTop ? null : (
                <FileFullNameRenderer fileFullName={fileSource.fileFullName} />
            )}
        </div>
    );
}

function FileFullNameRenderer({ fileFullName }: Readonly<{
    fileFullName: string,
}>) {
    return (
        <div className='card-footer'>
            <p className='ellipsis-left card-text'>
                {fileFullName}
            </p>
        </div>
    );
}
