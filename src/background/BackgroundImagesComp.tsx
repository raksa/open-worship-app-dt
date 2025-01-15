import './BackgroundImagesComp.scss';

import { RenderScreenIds } from './BackgroundComp';
import FileSource from '../helper/FileSource';
import BackgroundMediaComp from './BackgroundMediaComp';
import { DragTypeEnum } from '../helper/DragInf';
import {
    defaultDataDirNames,
    dirSourceSettingNames,
} from '../helper/constants';
import { BackgroundSrcType } from '../_screen/screenHelpers';

function rendChild(
    filePath: string,
    selectedBackgroundSrcList: [string, BackgroundSrcType][],
) {
    const fileSource = FileSource.getInstance(filePath);
    return (
        <div className="card-body">
            <RenderScreenIds
                screenIds={selectedBackgroundSrcList.map(([key]) => {
                    return parseInt(key);
                })}
            />
            <img
                src={fileSource.src}
                className="card-img-top"
                alt="..."
                style={{
                    pointerEvents: 'none',
                }}
            />
        </div>
    );
}

export default function BackgroundImagesComp() {
    return (
        <BackgroundMediaComp
            defaultFolderName={defaultDataDirNames.BACKGROUND_IMAGE}
            dragType={DragTypeEnum.BACKGROUND_IMAGE}
            rendChild={rendChild}
            dirSourceSettingName={dirSourceSettingNames.BACKGROUND_IMAGE}
        />
    );
}
