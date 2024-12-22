import './BackgroundVideos.scss';

import { createRef } from 'react';

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
    return (
        <RendBody filePath={filePath}
            selectedBackgroundSrcList={selectedBackgroundSrcList}
        />
    );
}

function RendBody({
    filePath, selectedBackgroundSrcList,
}: Readonly<{
    filePath: string,
    selectedBackgroundSrcList: [string, BackgroundSrcType][],
}>) {
    const vRef = createRef<HTMLVideoElement>();
    const fileSource = FileSource.getInstance(filePath);
    return (
        <div className='card-body'
            onMouseEnter={() => {
                vRef.current?.play();
            }}
            onMouseLeave={() => {
                if (vRef.current) {
                    vRef.current.pause();
                    vRef.current.currentTime = 0;
                }
            }}>
            <RenderScreenIds
                screenIds={selectedBackgroundSrcList.map(([key]) => {
                    return parseInt(key);
                })}
            />
            <video ref={vRef}
                loop
                muted
                src={fileSource.src}
            />
        </div>
    );
}

export default function BackgroundVideos() {
    return (
        <BackgroundMedia
            defaultFolderName={defaultDataDirNames.BACKGROUND_VIDEO}
            dragType={DragTypeEnum.BACKGROUND_VIDEO}
            rendChild={rendChild}
            dirSourceSettingName={dirSourceSettingNames.BACKGROUND_VIDEO}
        />
    );
}
