import { useRef, useState } from 'react';
import { useAppEffect } from '../helper/debuggerHelpers';
import {
    getSetting,
    useStateSettingBoolean,
    useStateSettingNumber,
    useStateSettingString,
} from '../helper/settingHelpers';
import OtherRenderHeaderTitleComp from './OtherRenderHeaderTitleComp';
import LoadingComp from '../others/LoadingComp';
import ScreenOtherManager from '../_screen/managers/ScreenOtherManager';
import { getAndShowMedia } from '../_screen/screenOtherHelpers';
import { getShowingScreenIds, getScreenManagerInstances } from './alertHelpers';
import ScreensRendererComp from './ScreensRendererComp';
import { useScreenOtherManagerEvents } from '../_screen/managers/screenEventHelpers';
import SlideEditorToolAlignComp from '../slide-editor/canvas/tools/SlideEditorToolAlignComp';
import AppRangeComp from '../others/AppRangeComp';

const ALIGNMENT_SETTING_NAME = 'other-camera-alignment-data';
const IS_ROUND_SETTING_NAME = 'other-camera-show-round';
const VIDEO_WIDTH_PERCENTAGE_SETTING_NAME =
    'other-camera-show-video-width-percentage';

type CameraInfoType = {
    deviceId: string;
    groupId: string;
    label: string;
};

function genVideoWidthExtraStyle(): React.CSSProperties {
    const widthScale = parseInt(
        getSetting(VIDEO_WIDTH_PERCENTAGE_SETTING_NAME, '50'),
    );
    return {
        width: `${Math.max(1, Math.min(100, widthScale))}%`,
        height: 'auto',
    };
}

function genIsRoundExtraStyle(): React.CSSProperties {
    const isRound = getSetting(IS_ROUND_SETTING_NAME, 'true') === 'true';
    if (isRound) {
        return {
            borderRadius: '50%',
            overflow: 'hidden',
        };
    }
    return {};
}

function genAlignmentExtraStyle(): React.CSSProperties {
    const alignmentData = JSON.parse(getSetting(ALIGNMENT_SETTING_NAME, '{}'));
    const { horizontalAlignment = 'center', verticalAlignment = 'center' } =
        alignmentData;
    if (horizontalAlignment === 'center' && verticalAlignment === 'center') {
        return {
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
        };
    }
    let style: any = {};
    if (horizontalAlignment === 'center') {
        style = {
            left: '50%',
            transform: 'translateX(-50%)',
        };
    }
    if (verticalAlignment === 'center') {
        style = {
            top: '50%',
            transform: 'translateY(-50%)',
        };
    }
    if (horizontalAlignment === 'left') {
        style.left = '0';
    } else if (horizontalAlignment === 'right') {
        style.right = '0';
    }
    if (verticalAlignment === 'start') {
        style.top = '0';
    } else if (verticalAlignment === 'end') {
        style.bottom = '0';
    }
    return style;
}

function getExtraStyle(): React.CSSProperties {
    return {
        position: 'absolute',
        height: 'auto',
        ...genVideoWidthExtraStyle(),
        ...genIsRoundExtraStyle(),
        ...genAlignmentExtraStyle(),
    };
}

function RenderCameraInfoComp({
    cameraInfo,
    width,
}: Readonly<{ cameraInfo: CameraInfoType; width: number }>) {
    const containerRef = useRef<HTMLDivElement>(null);
    useAppEffect(() => {
        if (containerRef.current === null) {
            return;
        }
        getAndShowMedia({
            id: cameraInfo.deviceId,
            container: containerRef.current,
            width,
        });
    }, [containerRef.current]);
    const handleCameraShowing = (event: any, isForceChoosing = false) => {
        ScreenOtherManager.setCamera(
            event,
            cameraInfo.deviceId,
            getExtraStyle(),
            isForceChoosing,
        );
    };
    const handleContextMenuOpening = (event: any) => {
        handleCameraShowing(event, true);
    };

    return (
        <div className="card m-2" style={{ width: `${width}px` }}>
            <div className="card-header app-ellipsis" title={cameraInfo.label}>
                {cameraInfo.label}
            </div>
            <div
                className={
                    'card-body w-100 p-0 overflow-hidden' +
                    ' app-caught-hover-pointer'
                }
                onClick={handleCameraShowing}
                onContextMenu={handleContextMenuOpening}
                ref={containerRef}
            >
                <LoadingComp />
            </div>
        </div>
    );
}

function refreshAllCameras(showingScreenIds: number[]) {
    showingScreenIds.forEach((screenId) => {
        getScreenManagerInstances(screenId, (screenOtherManager) => {
            const cameraData = screenOtherManager.alertData?.cameraData;
            if (cameraData === null) {
                return;
            }
            screenOtherManager.setCameraData(null);
            screenOtherManager.setCameraData({
                ...cameraData,
                extraStyle: getExtraStyle(),
            });
        });
    });
}

export default function OtherCameraShowComp() {
    const showingScreenIds = getShowingScreenIds((data) => {
        return data.cameraData !== null;
    });
    const [videoWidthPercentage, setVideoWidthPercentage] =
        useStateSettingNumber(VIDEO_WIDTH_PERCENTAGE_SETTING_NAME, 50);
    const setVideoWidthPercentage1 = (value: number) => {
        setVideoWidthPercentage(value);
        refreshAllCameras(showingScreenIds);
    };
    const [isRound, setIsRound] = useStateSettingBoolean(
        IS_ROUND_SETTING_NAME,
        true,
    );
    const setIsRound1 = (value: boolean) => {
        setIsRound(value);
        refreshAllCameras(showingScreenIds);
    };
    const [alignmentData, setAlignmentData] = useStateSettingString(
        ALIGNMENT_SETTING_NAME,
        JSON.stringify({
            horizontalAlignment: 'center',
            verticalAlignment: 'center',
        }),
    );
    const setAlignmentData1 = (data: string) => {
        setAlignmentData(data);
        refreshAllCameras(showingScreenIds);
    };
    const [cameraInfoList, setCameraInfoList] = useState<CameraInfoType[]>([]);
    const [isOpened, setIsOpened] = useStateSettingBoolean(
        'other-camera-show-opened',
        true,
    );
    useScreenOtherManagerEvents(['update']);
    useAppEffect(() => {
        navigator.mediaDevices.enumerateDevices().then((devices) => {
            const cameraList: CameraInfoType[] = [];
            for (const device of devices) {
                if (device.kind === 'videoinput') {
                    cameraList.push(device);
                }
            }
            setCameraInfoList(cameraList);
        });
    }, []);
    const handleCameraHiding = (screenId: number) => {
        getScreenManagerInstances(screenId, (screenOtherManager) => {
            screenOtherManager.setCameraData(null);
        });
    };
    return (
        <div className="card m-2">
            <div
                className={
                    'card-header d-flex justify-content-between' +
                    ' align-items-center'
                }
            >
                <OtherRenderHeaderTitleComp
                    isOpened={isOpened}
                    setIsOpened={setIsOpened}
                >
                    <h4>Camera Show</h4>
                </OtherRenderHeaderTitleComp>
                {!isOpened ? (
                    <ScreensRendererComp
                        showingScreenIds={showingScreenIds}
                        buttonTitle="Hide Camera"
                        handleOtherHiding={handleCameraHiding}
                        isMini={true}
                    />
                ) : null}
            </div>
            {isOpened ? (
                <div
                    className="card-body"
                    style={{
                        maxHeight: '500px',
                        overflowY: 'auto',
                    }}
                >
                    <div
                        className={
                            'd-flex justify-content-between' +
                            ' align-items-center mb-2'
                        }
                    >
                        <SlideEditorToolAlignComp
                            data={JSON.parse(alignmentData)}
                            onData={(data) => {
                                const oldData = JSON.parse(alignmentData);
                                setAlignmentData1(
                                    JSON.stringify({
                                        ...oldData,
                                        ...data,
                                    }),
                                );
                            }}
                        />
                        <div>
                            <AppRangeComp
                                value={videoWidthPercentage}
                                title="Width (%)"
                                setValue={setVideoWidthPercentage1}
                                defaultSize={{
                                    size: videoWidthPercentage,
                                    min: 1,
                                    max: 100,
                                    step: 1,
                                }}
                                isShowValue
                            />
                        </div>
                        <div className="input-group-text">
                            <span className="p-1">Round:</span>
                            <input
                                className="form-check-input mt-0"
                                type="checkbox"
                                checked={isRound}
                                onChange={(event) => {
                                    setIsRound1(event.target.checked);
                                }}
                            />
                        </div>
                    </div>
                    <div className="d-flex flex-wrap">
                        {cameraInfoList.map((cameraInfo) => {
                            return (
                                <RenderCameraInfoComp
                                    key={cameraInfo.deviceId}
                                    cameraInfo={cameraInfo}
                                    width={300}
                                />
                            );
                        })}
                    </div>
                    <hr />
                    <ScreensRendererComp
                        showingScreenIds={showingScreenIds}
                        buttonTitle="Hide Camera"
                        handleOtherHiding={handleCameraHiding}
                    />
                </div>
            ) : null}
        </div>
    );
}
