import './BackgroundImages.scss';

import {
    BackgroundSrcType,
} from '../_present/PresentBGManager';
import { RenderPresentIds } from './Background';
import FileSource from '../helper/FileSource';
import BackgroundMedia from './BackgroundMedia';
import { DragTypeEnum } from '../helper/DragInf';

export default function BackgroundImages() {
    return (
        <BackgroundMedia dragType={DragTypeEnum.BG_IMAGE}
            rendChild={rendChild} />
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
