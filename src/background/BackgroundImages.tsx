import './BackgroundImages.scss';

import { RenderScreenIds } from './Background';
import FileSource from '../helper/FileSource';
import BackgroundMedia from './BackgroundMedia';
import { DragTypeEnum } from '../helper/DragInf';
import {
    defaultDataDirNames, dirSourceSettingNames,
} from '../helper/constants';
import { BackgroundSrcType } from '../_screen/screenHelpers';

function rendChild(
    filePath: string, selectedBackgroundSrcList: [string, BackgroundSrcType][],
) {
    const fileSource = FileSource.getInstance(filePath);
    return (
        <div className='card-body'>
            <RenderScreenIds
                screenIds={selectedBackgroundSrcList.map(([key]) => {
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

export default function BackgroundImages() {
    return (
        <BackgroundMedia
            defaultFolderName={defaultDataDirNames.BACKGROUND_IMAGE}
            dragType={DragTypeEnum.BACKGROUND_IMAGE}
            rendChild={rendChild}
            dirSourceSettingName={dirSourceSettingNames.BACKGROUND_IMAGE}
        />
    );
}
