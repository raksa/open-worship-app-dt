import { useRef, useState } from 'react';
import { useAppEffectAsync } from '../helper/debuggerHelpers';
import { useStateSettingBoolean } from '../helper/settingHelpers';
import OtherRenderHeaderTitleComp from './OtherRenderHeaderTitleComp';
import LoadingComp from '../others/LoadingComp';
import ScreenOtherManager from '../_screen/managers/ScreenOtherManager';
import { getAndShowMedia } from '../_screen/screenOtherHelpers';
import { getShowingScreenIds, getScreenManagerInstances } from './otherHelpers';
import ScreensRendererComp from './ScreensRendererComp';
import { useScreenOtherManagerEvents } from '../_screen/managers/screenEventHelpers';
import { genTimeoutAttempt } from '../helper/helpers';
import { useOtherPropsSetting } from './propertiesSettingHelpers';

type CameraInfoType = {
    deviceId: string;
    groupId: string;
    label: string;
};

function RenderCameraInfoComp({
    cameraInfo,
    width,
    genStyle,
}: Readonly<{
    cameraInfo: CameraInfoType;
    width: number;
    genStyle: () => React.CSSProperties;
}>) {
    const containerRef = useRef<HTMLDivElement>(null);
    useAppEffectAsync(async () => {
        if (containerRef.current === null) {
            return;
        }
        return await getAndShowMedia({
            id: cameraInfo.deviceId,
            container: containerRef.current,
            width,
        });
    }, [containerRef.current]);
    const handleCameraShowing = (event: any, isForceChoosing = false) => {
        ScreenOtherManager.setCamera(
            event,
            cameraInfo.deviceId,
            genStyle(),
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
                // TODO: implement drag and drop
                onClick={handleCameraShowing}
                onContextMenu={handleContextMenuOpening}
                ref={containerRef}
            >
                <LoadingComp />
            </div>
        </div>
    );
}

const attemptTimeout = genTimeoutAttempt(500);
function refreshAllCameras(
    showingScreenIds: number[],
    extraStyle: React.CSSProperties,
) {
    attemptTimeout(() => {
        showingScreenIds.forEach((screenId) => {
            getScreenManagerInstances(screenId, (screenOtherManager) => {
                const cameraData = screenOtherManager.alertData?.cameraData;
                if (cameraData === null) {
                    return;
                }
                screenOtherManager.setCameraData(null);
                screenOtherManager.setCameraData({
                    ...cameraData,
                    extraStyle,
                });
            });
        });
    });
}

export default function OtherCameraShowComp() {
    useScreenOtherManagerEvents(['update']);
    const showingScreenIds = getShowingScreenIds((data) => {
        return data.cameraData !== null;
    });
    const { genStyle, element: propsSetting } = useOtherPropsSetting({
        prefix: 'camera',
        onChange: (extraStyle) => {
            refreshAllCameras(showingScreenIds, extraStyle);
        },
    });
    const [cameraInfoList, setCameraInfoList] = useState<CameraInfoType[]>([]);
    const [isOpened, setIsOpened] = useStateSettingBoolean(
        'other-camera-show-opened',
        false,
    );
    useAppEffectAsync(
        async (contextMethods) => {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const cameraList: CameraInfoType[] = [];
            for (const device of devices) {
                if (device.kind === 'videoinput') {
                    cameraList.push(device);
                }
            }
            contextMethods.setCameraInfoList(cameraList);
        },
        [],
        { setCameraInfoList },
    );
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
                    className="card-body w-100"
                    style={{
                        maxHeight: '500px',
                        overflowX: 'hidden',
                        overflowY: 'auto',
                    }}
                >
                    {propsSetting}
                    <hr />
                    <div className="d-flex flex-wrap">
                        {cameraInfoList.map((cameraInfo) => {
                            return (
                                <RenderCameraInfoComp
                                    key={cameraInfo.deviceId}
                                    cameraInfo={cameraInfo}
                                    width={300}
                                    genStyle={genStyle}
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
