import './BackgroundVideos.scss';

import { createRef } from 'react';

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


export default function BackgroundVideos() {
    return (
        <BackgroundMedia
            defaultFolderName={defaultDataDirNames.BACKGROUND_VIDEO}
            dragType={DragTypeEnum.BG_VIDEO}
            rendChild={rendChild}
            dirSourceSettingName={dirSourceSettingNames.BACKGROUND_VIDEO}
        />
    );
}

function rendChild(
    filePath: string, selectedBGSrcList: [string, BackgroundSrcType][],
) {
    return (
        <RendBody filePath={filePath}
            selectedBGSrcList={selectedBGSrcList}
        />
    );
}

function RendBody({ filePath, selectedBGSrcList }: Readonly<{
    filePath: string,
    selectedBGSrcList: [string, BackgroundSrcType][],
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
                screenIds={selectedBGSrcList.map(([key]) => {
                    return parseInt(key, 10);
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
