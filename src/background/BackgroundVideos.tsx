import './BackgroundVideos.scss';

import { createRef } from 'react';
import {
    BackgroundSrcType,
} from '../_present/PresentBGManager';
import { RenderPresentIds } from './Background';
import FileSource from '../helper/FileSource';
import BackgroundMedia from './BackgroundMedia';


export default function BackgroundVideos() {
    return (
        <BackgroundMedia bgType={'video'}
            rendChild={rendChild} />
    );
}

function rendChild(fileSource: FileSource,
    selectedBGSrcList: [string, BackgroundSrcType][]) {
    return (
        <RendBody fileSource={fileSource}
            selectedBGSrcList={selectedBGSrcList} />
    );
}

function RendBody({ fileSource, selectedBGSrcList }: {
    fileSource: FileSource,
    selectedBGSrcList: [string, BackgroundSrcType][],
}) {
    const vRef = createRef<HTMLVideoElement>();
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