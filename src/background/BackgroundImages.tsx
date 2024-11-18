import './BackgroundImages.scss';

import {
    BackgroundSrcType,
} from '../_screen/ScreenBGManager';
import { RenderScreenIds } from './Background';
import FileSource from '../helper/FileSource';
import BackgroundMedia from './BackgroundMedia';
import { DragTypeEnum } from '../helper/DragInf';
import {
    defaultDataDirNames, dirSourceSettingNames,
} from '../helper/constants';

export default function BackgroundImages() {
    return (
        <BackgroundMedia
            defaultFolderName={defaultDataDirNames.BACKGROUND_IMAGE}
            dragType={DragTypeEnum.BG_IMAGE}
            rendChild={rendChild}
            dirSourceSettingName={dirSourceSettingNames.BACKGROUND_IMAGE}
        />
    );
}

function rendChild(
    filePath: string, selectedBGSrcList: [string, BackgroundSrcType][],
) {
    const fileSource = FileSource.getInstance(filePath);
    return (
        <div className='card-body'>
            <RenderScreenIds
                screenIds={selectedBGSrcList.map(([key]) => {
                    return parseInt(key, 10);
                })}
            />
            <img src={fileSource.src}
                className='card-img-top' alt='...'
                style={{
                    pointerEvents: 'none',
                }}
            />
        </div>
    );
}
