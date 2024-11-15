import './BackgroundImages.scss';

import {
    BackgroundSrcType,
} from '../_present/PresentBGManager';
import { RenderPresentIds } from './Background';
import FileSource from '../helper/FileSource';
import BackgroundMedia from './BackgroundMedia';
import { DragTypeEnum } from '../helper/DragInf';
import { dirSourceSettingNames } from '../helper/constants';

export default function BackgroundImages() {
    return (
        <BackgroundMedia
            defaultFolderName='images'
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
            <RenderPresentIds
                ids={selectedBGSrcList.map(([key]) => +key)} />
            <img src={fileSource.src}
                className='card-img-top' alt='...'
                style={{
                    pointerEvents: 'none',
                }} />
        </div>
    );
}
