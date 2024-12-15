import './BackgroundSounds.scss';

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
    return (
        <RendBody filePath={filePath}
            selectedBackgroundSrcList={selectedBackgroundSrcList}
        />
    );
}

function RendBody({ filePath }: Readonly<{
    filePath: string,
    selectedBackgroundSrcList: [string, BackgroundSrcType][],
}>) {
    const fileSource = FileSource.getInstance(filePath);
    return (
        <div className='card-body'>
            <audio controls>
                <source src={fileSource.src} />
                <track kind="captions" />
                Your browser does not support the audio element.
            </audio>
        </div>
    );
}

export default function BackgroundSounds() {
    return (
        <BackgroundMedia
            defaultFolderName={defaultDataDirNames.BACKGROUND_SOUND}
            dragType={DragTypeEnum.BACKGROUND_SOUND}
            rendChild={rendChild}
            dirSourceSettingName={dirSourceSettingNames.BACKGROUND_SOUND}
            noDraggable={true}
            noClickable={true}
            isNameOnTop={true}
        />
    );
}
