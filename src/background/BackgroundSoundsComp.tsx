import './BackgroundSoundsComp.scss';

import FileSource from '../helper/FileSource';
import BackgroundMediaComp from './BackgroundMediaComp';
import { DragTypeEnum } from '../helper/DragInf';
import {
    defaultDataDirNames,
    dirSourceSettingNames,
} from '../helper/constants';
import { BackgroundSrcType } from '../_screen/screenHelpers';
import {
    handleAudioPlaying,
    handleAudioPausing,
    handleAudioEnding,
} from './audioBackgroundHelpers';
import { useState } from 'react';
import { showSimpleToast } from '../toast/toastHelpers';

function rendChild(
    activeMap: { [key: string]: boolean },
    filePath: string,
    selectedBackgroundSrcList: [string, BackgroundSrcType][],
) {
    if (!activeMap[filePath]) {
        return (
            <div data-file-path={filePath} style={{ display: 'none' }}></div>
        );
    }
    return (
        <RendBody
            filePath={filePath}
            selectedBackgroundSrcList={selectedBackgroundSrcList}
        />
    );
}

function RendBody({
    filePath,
}: Readonly<{
    filePath: string;
    selectedBackgroundSrcList: [string, BackgroundSrcType][];
}>) {
    const fileSource = FileSource.getInstance(filePath);
    return (
        <div className="card-body" data-file-path={filePath}>
            <audio
                controls
                onPlay={handleAudioPlaying}
                onPause={handleAudioPausing}
                onEnded={handleAudioEnding}
            >
                <source src={fileSource.src} />
                <track kind="captions" />
                Your browser does not support the audio element.
            </audio>
        </div>
    );
}

export default function BackgroundSoundsComp() {
    const [activeMap, setActiveMap] = useState<{ [key: string]: boolean }>({});
    const handleItemClicking = (event: any) => {
        const target = event.target;
        const parentElement = target.parentElement;
        // check is audio playing
        const audioElement = parentElement.querySelector('audio');
        if (audioElement && !audioElement.paused) {
            showSimpleToast(
                'Audio playing',
                'Please stop the audio before leaving the page.',
            );
            return;
        }
        const childElement = parentElement.querySelector('[data-file-path]');
        if (!childElement) {
            return;
        }
        const filePath = childElement.getAttribute('data-file-path');
        setActiveMap((preActiveMap) => {
            return {
                ...preActiveMap,
                [filePath]: !preActiveMap[filePath],
            };
        });
    };
    return (
        <BackgroundMediaComp
            defaultFolderName={defaultDataDirNames.BACKGROUND_SOUND}
            dragType={DragTypeEnum.BACKGROUND_SOUND}
            onClick={handleItemClicking}
            rendChild={rendChild.bind(null, activeMap)}
            dirSourceSettingName={dirSourceSettingNames.BACKGROUND_SOUND}
            noDraggable={true}
            isNameOnTop={true}
        />
    );
}
