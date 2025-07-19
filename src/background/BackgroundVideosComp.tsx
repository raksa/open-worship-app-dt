import './BackgroundVideosComp.scss';

import { createRef, useState } from 'react';

import { RenderScreenIds } from './BackgroundComp';
import FileSource from '../helper/FileSource';
import BackgroundMediaComp from './BackgroundMediaComp';
import { DragTypeEnum } from '../helper/DragInf';
import {
    defaultDataDirNames,
    dirSourceSettingNames,
} from '../helper/constants';
import { BackgroundSrcType } from '../_screen/screenTypeHelpers';
import VideoHeaderSettingComp from './VideoHeaderSettingComp';
import { showSimpleToast } from '../toast/toastHelpers';
import { ContextMenuItemType } from '../context-menu/appContextMenuHelpers';
import DirSource from '../helper/DirSource';
import { showAppInput } from '../popup-widget/popupWidgetHelpers';
import { downloadVideo, readTextFromClipboard } from '../server/appHelpers';
import { handleError } from '../helper/errorHelpers';
import {
    hideProgressBard,
    showProgressBard,
} from '../progress-bar/progressBarHelpers';

function rendChild(
    filePath: string,
    selectedBackgroundSrcList: [string, BackgroundSrcType][],
) {
    return (
        <RendBody
            filePath={filePath}
            selectedBackgroundSrcList={selectedBackgroundSrcList}
        />
    );
}

function RendBody({
    filePath,
    selectedBackgroundSrcList,
}: Readonly<{
    filePath: string;
    selectedBackgroundSrcList: [string, BackgroundSrcType][];
}>) {
    const vRef = createRef<HTMLVideoElement>();
    const fileSource = FileSource.getInstance(filePath);
    return (
        <div
            className="card-body"
            onMouseEnter={() => {
                vRef.current?.play();
            }}
            onMouseLeave={() => {
                if (vRef.current) {
                    vRef.current.pause();
                    vRef.current.currentTime = 0;
                }
            }}
        >
            <RenderScreenIds
                screenIds={selectedBackgroundSrcList.map(([key]) => {
                    return parseInt(key);
                })}
            />
            <video ref={vRef} loop muted src={fileSource.src} />
        </div>
    );
}

function InputVideoUrlComp({
    defaultVideoUrl,
    onChange,
}: Readonly<{ defaultVideoUrl: string; onChange: (newUrl: string) => void }>) {
    const [videoUrl, setVideoUrl] = useState(defaultVideoUrl);
    const invalidMessage = videoUrl.trim() === '' ? 'Cannot be empty' : '';
    return (
        <div className="w-100 h-100">
            <div className="input-group" title={invalidMessage}>
                <div className="input-group-text">Video URL:</div>
                <input
                    className={
                        'form-control' + (invalidMessage ? ' is-invalid' : '')
                    }
                    type="text"
                    value={videoUrl}
                    onChange={(e) => {
                        setVideoUrl(e.target.value);
                        onChange(e.target.value);
                    }}
                />
            </div>
        </div>
    );
}
async function genContextMenuItems(dirSource: DirSource) {
    if (dirSource.dirPath === '') {
        return [];
    }
    const contextMenuItems: ContextMenuItemType[] = [
        {
            menuElement: '`Download From URL',
            onSelect: async () => {
                let videoUrl = '';
                const clipboardText = await readTextFromClipboard();
                if (
                    clipboardText !== null &&
                    clipboardText.trim().startsWith('http')
                ) {
                    videoUrl = clipboardText.trim();
                }
                const isConfirmInput = await showAppInput(
                    '`Download Video From URL',
                    <InputVideoUrlComp
                        defaultVideoUrl={videoUrl}
                        onChange={(newUrl) => {
                            videoUrl = newUrl;
                        }}
                    />,
                );
                if (!isConfirmInput) {
                    return;
                }
                if (!videoUrl.trim().startsWith('http')) {
                    showSimpleToast('`Download From URL', 'Invalid URL');
                    return;
                }
                try {
                    showSimpleToast(
                        '`Download From URL',
                        `Downloading video from "${videoUrl}", please wait...`,
                    );
                    showProgressBard(videoUrl);
                    const videoFilePath = await downloadVideo(
                        videoUrl,
                        dirSource.dirPath,
                    );
                    showSimpleToast(
                        '`Download From URL',
                        `Video downloaded successfully, file path: "${videoFilePath}"`,
                    );
                } catch (error) {
                    handleError(error);
                    showSimpleToast(
                        '`Download From URL',
                        'Error occurred during downloading video',
                    );
                } finally {
                    hideProgressBard(videoUrl);
                }
            },
        },
    ];
    return contextMenuItems;
}

export default function BackgroundVideosComp() {
    return (
        <BackgroundMediaComp
            extraHeaderChild={<VideoHeaderSettingComp />}
            defaultFolderName={defaultDataDirNames.BACKGROUND_VIDEO}
            dragType={DragTypeEnum.BACKGROUND_VIDEO}
            rendChild={rendChild}
            dirSourceSettingName={dirSourceSettingNames.BACKGROUND_VIDEO}
            genContextMenuItems={genContextMenuItems}
        />
    );
}
