import './BackgroundImages.scss';

import {
    BackgroundSrcType,
} from '../_present/PresentBGManager';
import { RenderPresentIds } from './Background';
import FileSource from '../helper/FileSource';
import BackgroundMedia from './BackgroundMedia';

export default function BackgroundImages() {
    return (
        <BackgroundMedia bgType={'image'}
            rendChild={rendChild} />
    );
}

function rendChild(fileSource: FileSource,
    selectedBGSrcList: [string, BackgroundSrcType][]) {
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