import './BackgroundVideos.scss';

import { createRef } from 'react';

import {
    BackgroundSrcType,
} from '../_present/PresentBGManager';
import { RenderPresentIds } from './Background';
import FileSource from '../helper/FileSource';
import BackgroundMedia from './BackgroundMedia';
import { DragTypeEnum } from '../helper/DragInf';


export default function BackgroundVideos() {
    return (
        <BackgroundMedia dragType={DragTypeEnum.BG_VIDEO}
            rendChild={rendChild} />
    );
}

function rendChild(
    filePath: string, selectedBGSrcList: [string, BackgroundSrcType][],
) {
    return (
        <RendBody filePath={filePath}
            selectedBGSrcList={selectedBGSrcList} />
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
            <RenderPresentIds
                ids={selectedBGSrcList.map(([key]) => +key)} />
            <video ref={vRef}
                loop
                muted
                src={fileSource.src} />
        </div>
    );
}
